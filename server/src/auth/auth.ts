import { Request, Response, NextFunction } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import { AUTH_CONFIG } from "./authConfig";
import {
  jwkResponse,
  loginResponse,
  oidcToken,
  userInfoResponse,
  idToken,
} from "./authType";
import User, { UserModelType } from "../models/user";

/**
 * Handles the login procedure given an OpenID auth code (which may or may not be valid)
 */
export async function login(req: Request, res: Response) {
  const code = req.body["code"];
  const userResponse: loginResponse = {
    //Response we will send back to user/browser
    success: true,
    error_msg: "",
    id_token: "",
    session_id: "",
    sub: "",
    email: "",
    affiliation: "",
    name: "",
    given_name: "",
    family_name: "",
  };
  /**
   * Helper function: Instruct the client browser to clear the nonce cookie
   *
   * Note: We include the original cookie options because most browsers are set to
   * clear only when then the options provided in clear header are identical to
   * the original cookie
   */
  function clearNonceCookie() {
    res.clearCookie(
      AUTH_CONFIG.nonce_cookie_name,
      AUTH_CONFIG.nonce_cookie_options
    );
  }
  /**
   * Helper function: Given an error message,
   * output a JSON response to user with that error.
   *
   * Note: For our system we're choosing to output the error to the user/browser. However,
   * if you don't want to leak the reason why we failed to authenticate, you can
   * alternatively write the error_msg to output to a server-side log instead (Not implemented).
   */
  function respondWithError(errorMsg: string) {
    userResponse.success = false;
    userResponse.error_msg = errorMsg;
    clearNonceCookie();
    res.status(200).json(userResponse);
  }

  //Check if code was provided
  if (code === undefined) {
    respondWithError("Input Error: No auth code was provided in request");
    return;
  }

  //Check if nonce cookie was provided
  if (!(AUTH_CONFIG.nonce_cookie_name in req.cookies)) {
    respondWithError("Input Error: No nonce cookie was provided in request");
    return;
  }
  const nonceCookie: string = req.cookies[AUTH_CONFIG.nonce_cookie_name];

  //Send code to OIDC to get back token
  let oidcResponse;
  try {
    oidcResponse = await axios.post<oidcToken>(
      AUTH_CONFIG.token_endpoint,
      new URLSearchParams({
        grant_type: AUTH_CONFIG.grantType,
        code: code,
        redirect_uri: AUTH_CONFIG.redirect_uri,
      }),
      {
        auth: {
          username: AUTH_CONFIG.client_id,
          password: AUTH_CONFIG.client_secret,
        },
      }
    );
  } catch (error) {
    console.log(error);
    respondWithError("Input Error: Invalid user code was provided");
    return;
  }
  const oidcJSON: oidcToken = oidcResponse.data;

  //Check token_type is correct
  const correctTokenType = oidcJSON.token_type === AUTH_CONFIG.tokenType;
  if (!correctTokenType) {
    respondWithError("OIDC error: Unexpected token type received in ID token");
    return;
  }
  //Proceed to validate ID token and fetch information about the user
  if (oidcJSON.id_token) {
    //Fetch the OIDC server public key
    const oidcPublicKeys = (
      await axios.get<jwkResponse>(AUTH_CONFIG.public_key)
    ).data;
    if ("keys" in oidcPublicKeys && Array.isArray(oidcPublicKeys.keys)) {
      const firstKey = oidcPublicKeys.keys[0];

      if (!firstKey) {
        return respondWithError("OIDC Error: No public key available");
      }
      const pemPublicKey = jwkToPem(firstKey);

      let decoded: idToken;
      try {
        //Verify the token, and if valid, return the decoded payload
        decoded = jwt.verify(oidcJSON.id_token, pemPublicKey) as idToken;
      } catch (error) {
        //Handle issue with token not having valid signature
        return respondWithError(
          "OIDC error: Invalid signature in OIDC ID token"
        );
      }
      //Validate the issuer
      const correctIssuer = decoded.iss === AUTH_CONFIG.tokenIssuer;
      if (!correctIssuer)
        return respondWithError(
          "OIDC Error: Issuer of token is not as expected"
        );

      const currTimeSeconds = Math.floor(Date.now() / 1000); //Note: Timestamps in ID tokens are measured in seconds

      //Validate the expiration and issue time stamps
      if (decoded.exp < currTimeSeconds)
        return respondWithError(
          "OIDC Error: Given ID token has already expired"
        );
      if (decoded.iat > currTimeSeconds)
        return respondWithError(
          "OIDC Error: Given ID token is issued in the future"
        );

      //Validate nonce in ID token matches one sent during token request
      const nonceMatches = decoded.nonce === nonceCookie;
      if (!nonceMatches)
        return respondWithError(
          "OIDC Error: Nonce in ID token doesn't match up with original value"
        );

      //Validate client_id included in audiences list
      const clientIdInAudience = decoded.aud.includes(AUTH_CONFIG.client_id);
      if (!clientIdInAudience)
        return respondWithError(
          "OIDC Error: Audience list in ID token doesn't include our app's client id"
        );

      //Assured that ID token is valid, try to query user information using access token
      const profileResults = await getUserInfo(oidcJSON.access_token, decoded);

      if (profileResults.success) {
        // Get or create user in database
        const user = await getOrCreateUser(profileResults);

        // Store user in session (your existing session management)
        req.session.user = user;

        //Both operations succeeded.
        userResponse.success = true;
        userResponse.id_token = oidcJSON.id_token;
        userResponse.session_id = "session_" + Math.random().toString(36); // Simple session ID

        //Populate profile fields
        userResponse.sub = profileResults.sub;
        userResponse.email = profileResults.email;
        userResponse.affiliation = profileResults.affiliation;
        userResponse.name = profileResults.name;
        userResponse.given_name = profileResults.given_name;
        userResponse.family_name = profileResults.family_name;

        clearNonceCookie();
        res.status(200).json(userResponse);
      } else {
        userResponse.success = false;
        userResponse.error_msg = profileResults.error_msg;
        clearNonceCookie();
        res.status(200).json(userResponse);
      }
    }
  }
}

/**
 * Given a valid access_token and id_token (parsed into its object representation),
 * query the OIDC User Information endpoint and return profile info.
 *
 *
 * For our basic example case, we will just or the user's email (defined in our authConfig.ts' scope)
 *
 * Returns: user's profile information, which includes (email, mit affiliation, full name, given
 *          name, and family name)
 * */
async function getUserInfo(
  access_token: string,
  id_token: object
): Promise<userInfoResponse> {
  const userInfoResults: userInfoResponse = {
    success: false,
    error_msg: "",
    sub: "",
    email: "",
    affiliation: "",
    name: "",
    given_name: "",
    family_name: "",
  };
  let oidcResponse;
  try {
    oidcResponse = await axios.get(AUTH_CONFIG.user_info_endpoint, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    userInfoResults.success = true;
    userInfoResults.sub = oidcResponse.data.sub;
    userInfoResults.email = oidcResponse.data.email; //Get email from JSON object
    userInfoResults.affiliation = oidcResponse.data.affiliation;
    userInfoResults.name = oidcResponse.data.name;
    userInfoResults.given_name = oidcResponse.data.given_name;
    userInfoResults.family_name = oidcResponse.data.family_name;
  } catch (error) {
    userInfoResults.success = false;
    userInfoResults.error_msg =
      "Request to OIDC user endpoint to retrieve profile info errored out.";
  }

  return userInfoResults;
}

/**
 * Gets user from DB, or makes a new account if it doesn't exist yet
 */
async function getOrCreateUser(
  userInfo: userInfoResponse
): Promise<UserModelType> {
  const existingUser = await User.findOne({ mitId: userInfo.sub });
  if (existingUser) {
    // Update user info in case it changed
    existingUser.name = userInfo.name;
    existingUser.email = userInfo.email;
    return await existingUser.save();
  }

  const newUser = new User({
    name: userInfo.name,
    email: userInfo.email,
    mitId: userInfo.sub,
  });

  return await newUser.save();
}

export function logout(req: Request, res: Response) {
  req.session.user = undefined;
  req.user = undefined;
  res.send({});
}

export function populateCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  next();
}

export function ensureLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    res.status(401).send({ err: "not logged in" });
    return;
  }
  next();
}
