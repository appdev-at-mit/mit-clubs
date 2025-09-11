import { AUTH_CONFIG } from "../auth/authConfig";

class LocalData {
  /*
   * Retrieve the user's information used to authenticate to backend API requests
   */
  static getUserAuthInfo() {
    const sessionId = localStorage.getItem(AUTH_CONFIG.sessionid_localstorage_name) || "";
    const email = localStorage.getItem(AUTH_CONFIG.useremail_localstoragge_name) || "";

    //Return format is done according to AuthModel in backend Python server main.py
    return {
      email_addr: email,
      session_id: sessionId,
    };
  }

  /*
   * Get email of currently logged in user
   */
  static getUserEmail() {
    const email = localStorage.getItem(AUTH_CONFIG.useremail_localstoragge_name) || "";
    // Note: A user must exist before calling this function
    return email;
  }

  /*
   * Get username of currently logged in user
   */
  static getUserName() {
    const name = localStorage.getItem(AUTH_CONFIG.username_localstorage_name) || "";
    // Note: A user must exist before calling this function
    return name;
  }

  /*
   * Check whether user is logged in, indicated by whether they have session ID tokens stored from previou
   * successful authentication
   */
  static isUserLoggedIn() {
    const sessionId = localStorage.getItem(AUTH_CONFIG.sessionid_localstorage_name);
    const email = localStorage.getItem(AUTH_CONFIG.useremail_localstoragge_name);
    return Boolean(sessionId && email);
  }
}

export default LocalData;