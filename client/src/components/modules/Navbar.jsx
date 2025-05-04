import { NavLink } from "react-router-dom";
import React, { useContext } from "react";
import { UserContext } from "../App";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import beaverLogo from "../../assets/beaver.png";

const Navbar = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  const isAuth = Boolean(userId);

  return (
    <nav className="bg-white z-50 border-b border-gray-300 fixed top-0 w-full">
      <div className="max-w-full pl-8 pr-8 text-md">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Home Link */}
          <NavLink to="/" className="flex items-center no-underline">
            <img src={beaverLogo} alt="MIT Clubs Logo" className="h-8 w-auto mr-2" />
            <span className="text-xl font-bold text-brand-blue-dark">Beaver Clubs</span>
          </NavLink>

          {/* Right Side - Authenticated Links or Login/Register */}
          <div className="flex items-center space-x-10">
            {isAuth ? (
              <>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `no-underline font-semibold ${isActive ? "text-brand-blue-dark" : "text-gray-600 hover:text-gray-900"}`
                  }
                >
                  About
                </NavLink>
                <NavLink
                  to="/saved-clubs"
                  className={({ isActive }) =>
                    `no-underline font-semibold ${isActive ? "text-brand-blue-dark" : "text-gray-600 hover:text-gray-900"}`
                  }
                >
                  Saved
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `no-underline font-semibold ${isActive ? "text-brand-blue-dark" : "text-gray-600 hover:text-gray-900"}`
                  }
                >
                  Profile
                </NavLink>
                <button
                  onClick={() => {
                    googleLogout();
                    handleLogout();
                  }}
                  className="text-gray-600 hover:text-gray-900 no-underline font-semibold"
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
