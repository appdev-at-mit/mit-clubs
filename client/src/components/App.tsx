import React, { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";

export interface User {
  _id?: string;
  name?: string;
  email?: string;
  isAdmin?: boolean;
}

export interface UserContextType {
  userId?: string;
  userName?: string;
  userEmail?: string;
  isAdmin: boolean;
  handleLogin: (credentialResponse: any) => void;
  handleLogout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // TODO: login
  }, []);

  const handleLogin = (credentialResponse: any) => {
    console.log("TOOD", credentialResponse);
  };

  const handleLogout = () => {
    setUserId(undefined);
    setUserName(undefined);
    setUserEmail(undefined);
    setIsAdmin(false);
  };

  const authContextValue: UserContextType = {
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
