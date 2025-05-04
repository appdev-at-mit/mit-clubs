import React, { useState, useEffect, createContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import jwt_decode from "jwt-decode";

import "../utilities.css";

import { socket } from "../client-socket";

import { get, post } from "../utilities";

export const UserContext = createContext(null);

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [userName, setUserName] = useState(undefined);
  const [userEmail, setUserEmail] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
        setUserName(user.name);
        setUserEmail(user.email);
        setIsAdmin(!!user.isAdmin);
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    post("/api/login", { token: userToken }).then((response) => { 

      const user = response.user;
      const isNewUser = response.isNewUser;

      setUserId(user._id);
      setUserName(user.name);
      setUserEmail(user.email);
      setIsAdmin(!!user.isAdmin);
      post("/api/initsocket", { socketid: socket.id });

      if (isNewUser) {
        navigate('/survey');
      } else {
        navigate('/');
      } 
    }).catch((err) => {
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    setUserName(undefined);
    setUserEmail(undefined);
    setIsAdmin(false);
    post("/api/logout");
  };

  const authContextValue = {
    userId,
    userName,
    userEmail,
    isAdmin,
    handleLogin,
    handleLogout,
  };

  return (
    <UserContext.Provider value={authContextValue}>
      <Outlet />
    </UserContext.Provider>
  );
};

export default App;
