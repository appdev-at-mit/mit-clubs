import { NavLink } from "react-router-dom";
import React, { useContext } from "react";
import { UserContext } from "../App";
import { GoogleLogin, googleLogout } from "@react-oauth/google";

const Navbar = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  const isAuth = Boolean(userId);

  return (
    <nav className="bg-white shadow shadow-md z-10">
      <div className="max-w-full px-10 text-md">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Home Link */}
          <div>
            <NavLink to="/">
              <span className="text-xl font-bold text-gray-800">MIT Clubs</span>
            </NavLink>
          </div>

          {/* Right Side - Authenticated Links or Login/Register */}
          <div className="flex items-center space-x-10">
            {isAuth ? (
              <>
                <NavLink
                  to="/saved-clubs"
                  className={({ isActive }) =>
                    `text-gray-700 hover:text-gray-900 ${isActive ? "font-semibold" : ""}`
                  }
                >
                  Saved
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `text-gray-700 hover:text-gray-900 ${isActive ? "font-semibold" : ""}`
                  }
                >
                  Profile
                </NavLink>
                <button
                  onClick={() => {
                    googleLogout();
                    handleLogout();
                  }}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
