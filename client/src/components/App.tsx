import React, { useState, useEffect, createContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "../utilities.css";
import { get, post } from "../utilities";
import { AuthContextType, User } from "../types";

export const UserContext = createContext<AuthContextType | null>(null);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    get("/api/whoami")
      .then((user: User) => {
        if (user._id) {
          setUserId(user._id);
          setUserName(user.name);
          setUserEmail(user.email);
          setIsAdmin(Boolean(user.isAdmin));
        }
      })
      .catch((error) => {
        console.log("User not logged in:", error);
      });
  }, []);

  function handleLogin(credentialResponse: any): void {
    const userToken = credentialResponse.credential;
    post("/api/login", { token: userToken })
      .then((response: any) => {
        const user = response.user;
        const isNewUser = response.isNewUser;

        setUserId(user._id);
        setUserName(user.name);
        setUserEmail(user.email);
        setIsAdmin(Boolean(user.isAdmin));

        navigate("/");
      })
      .catch((err) => {
        console.error("Login failed:", err);
      });
  }

  function handleLogout(): void {
    setUserId(undefined);
    setUserName(undefined);
    setUserEmail(undefined);
    setIsAdmin(false);
    post("/api/logout").then(() => {
      navigate("/");
    });
  }

  const authContextValue = {
    userId,
    userName,
    userEmail,
    isAdmin,
    handleLogin,
    handleLogout,
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserContext.Provider value={authContextValue}>
        <Outlet />
      </UserContext.Provider>
    </GoogleOAuthProvider>
  );
};

export default App;
