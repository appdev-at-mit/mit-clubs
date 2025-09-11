import React, { useState, useEffect, createContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "../auth/authProvider";

import "../utilities.css";
import { get, post } from "../utilities";
import { AuthContextType, User } from "../types";

export const UserContext = createContext<AuthContextType | null>(null);

function App() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, [location.state]); // Re-run when location.state changes (from nanoid)

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
    authChecked,
    handleLogout,
  };

  return (
    <AuthProvider>
      <UserContext.Provider value={authContextValue}>
        <Outlet />
      </UserContext.Provider>
    </AuthProvider>
  );
}

export default App;
