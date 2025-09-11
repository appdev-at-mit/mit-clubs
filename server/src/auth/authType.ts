import { JWK } from "jwk-to-pem";

/**
 * Expected response format after querying OIDC /token endpoint
 */
interface oidcToken {
  access_token: string;
  token_type: string;
  id_token?: string;
  scope?: string;
  refresh_token?: string;
}

/**
 * Expected response from OIDC /jwk endpoint
 */
interface jwkResponse {
  keys: JWK[]; // Array of JWK (JSON Web Key) objects
}

/**
 * Expected response for server to return to user's browser after querying /login endpoint
 */
interface loginResponse {
  success: boolean; //Whether or not the login succeeded
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

  //For identity management (useful for OpenPubKey extension)
  id_token: string;
}

/**
 * Defines results from calling getUserInfo() function
 */
interface userInfoResponse {
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
}

/**
 * Expected structure of a JWT ID token (after verification and decoding)
 */
interface idToken {
  iss: string; // Issuer of the token
  sub: string; // Subject (user identifier)
  aud: string[]; // Audience (client IDs that the token is intended for)
  exp: number; // Expiration time (Unix timestamp)
  iat: number; // Issued at time (Unix timestamp)
  nonce?: string; // Nonce value
}

export { loginResponse, userInfoResponse, oidcToken, idToken, jwkResponse };
