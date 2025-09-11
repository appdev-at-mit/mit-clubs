import React from "react";
import { AUTH_CONFIG } from "./authConfig";
import { generateRandomBytes, toHexString } from "./authHelper";
import Cookies from "universal-cookie";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "./authProvider";
import { nanoid } from "nanoid";

import Logo from "../assets/logo-with-words.png";
import AppdevLogo from "../assets/appdev_logo.svg?url";

/**
 * Expected response for server to return to user's browser after querying /login endpoint
 */
interface loginResponse {
  success: boolean; //Whether or not we were able to get user's info
  error_msg: string; //If failed, provide error message. Else, empty string.

  //All the values below will be populated if success,
  //otherwise they will be empty strings.

  //These are in accordance with: https://github.com/sipb/petrock#what-information-can-i-query
  sub: string;
  email: string;
  affiliation: string;
  name: string;
  given_name: string;
  family_name: string;

  //For session management
  session_id: string;

  //For identity management
  id_token: string;
}

/**
 * Redirect user to OIDC Authentication Endpoint for login with necessary query parameters
 */
async function redirectToLogin() {
  //Generate new state and nonce values
  const state = toHexString(generateRandomBytes(AUTH_CONFIG.state_length)); //TODO: Cryptography bind value with a browser cookie
  const nonce = generateRandomBytes(AUTH_CONFIG.nonce_length); //TODO: Save as a HTTP only session cookie
  const nonce_hash = await window.crypto.subtle
    .digest("SHA-256", nonce)
    .then((hashBuffer) => {
      const hashArray = new Uint8Array(hashBuffer);
      return toHexString(hashArray);
    });

  const params = new URLSearchParams();
  params.append("client_id", AUTH_CONFIG.client_id);
  params.append("response_type", AUTH_CONFIG.response_type);
  params.append("scope", AUTH_CONFIG.scope);
  params.append("redirect_uri", AUTH_CONFIG.redirect_uri);
  params.append("state", state);
  params.append("nonce", nonce_hash);

  //Store the state in localStorage (to be used for code validation)
  localStorage.setItem(AUTH_CONFIG.state_localstorage_name, state);

  //Store the nonce as a Secure, SameSite cookie (to be sent to backend for ID token validation)
  const cookies = new Cookies();
  cookies.set(
    AUTH_CONFIG.nonce_cookie_name,
    nonce_hash,
    AUTH_CONFIG.nonce_cookie_options
  );

  const destinationURL = AUTH_CONFIG.auth_endpoint + "?" + params.toString();
  window.location.replace(destinationURL);
}

function OidcResponseHandler() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const state = searchParams.get("state");
  const code = searchParams.get("code");

  let initialMsg: string;

  //Validate the state parameter we get back is what we generated on client side
  if (state === localStorage.getItem(AUTH_CONFIG.state_localstorage_name)) {
    initialMsg =
      "Please wait while the server completes your login - do not reload the page"; //User logged in to OIDC page, but still needs to be logged
    //into our backend system.
  } else {
    initialMsg = "Login failed. Please try again.";
  }
  localStorage.removeItem(AUTH_CONFIG.state_localstorage_name); //Remove state variable after validation

  const [loginMsg, setLoginMsg] = useState(initialMsg);
  const [hasProcessed, setHasProcessed] = useState(false);

  /**
   * Should be called only once (e.g. upon successful login to OIDC endpoint).
   */
  useEffect(() => {
    if (hasProcessed) return;

    //Note: We're using an async wrapper to make easier to work with
    //results from fetch() since useEffect is a synchronous function

    /**
     * Validates and sends the received user `code` to the backend
     * for token retrieval and validation, then parses the result
     * browser-side
     */
    async function sendCode(): Promise<void> {
      setHasProcessed(true);

      const requestOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code }),
        credentials: "include", //Should include nonce, which is an HTTPonly cookie
      };

      //Send user's code to backend server
      const response = await fetch(AUTH_CONFIG.login_uri, requestOptions);
      const data: loginResponse = await response.json();
      if (data.success) {
        //Login was successful! Expect id_token
        setLoginMsg("Login successful!");
        localStorage.setItem(
          AUTH_CONFIG.idtoken_localstorage_name,
          data.id_token
        ); //Save id_token to local storage
        localStorage.setItem(
          AUTH_CONFIG.useremail_localstoragge_name,
          data.email
        );
        localStorage.setItem(AUTH_CONFIG.username_localstorage_name, data.name);
        localStorage.setItem(
          AUTH_CONFIG.sessionid_localstorage_name,
          data.session_id
        ); //Save session_id to local storage

        //NOTE: If you want to do more with the additional user profile
        //      information (such as full name, family name, given name,
        //                   MIT affiliation, you can do so here).
        //      Otherwise, they are not saved to localstorage by default
        //      out of privacy concerns.

        const from = location.state?.from?.pathname || "/";
        auth.signin(data.email, () => {
          //Redirect user back to their original location
          // nanoid as cursed state management to force update the user context
          navigate(from, { replace: true, state: nanoid() });
        });
      } else {
        //Login was unsuccessful. Let user know about error message.
        setLoginMsg(`Login failed! ${data.error_msg}`);
      }
    }

    sendCode();
  }, [navigate, code, auth]);

  const statusMessages = ["almost done"];
  const randomMessage =
    statusMessages[Math.floor(Math.random() * statusMessages.length)];

  return (
    <div>
      <div className="OidcResponseHandler flex flex-col items-center justify-center h-screen bg-gray-100 mx-3">
        <img src={Logo} alt="MIT Clubs Logo" className="w-64 mb-8" />
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          {randomMessage}...
        </h2>
        <p>{loginMsg}</p>
        <br />
      </div>
      <img
        src={AppdevLogo}
        alt="MIT AppDev Logo"
        className="absolute bottom-20 left-1/2 -translate-x-1/2 m-4 w-32 h-auto saturate-[60%]"
      />
    </div>
  );
}

export { redirectToLogin, OidcResponseHandler };
