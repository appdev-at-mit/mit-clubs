import { NavLink } from "react-router-dom";
import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import { redirectToLogin } from "../../auth/auth";
import { Menu, X } from "lucide-react";
import logo from "../../assets/logo.png";

function Navbar() {
  const userContext = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!userContext) {
    throw new Error("Navbar must be used within UserContext");
  }

  const { userId, handleLogout } = userContext;
  const isAuth = Boolean(userId);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white z-50 border-b border-gray-300 fixed top-0 w-full">
      <div className="max-w-full pl-6 pr-6 md:pl-8 md:pr-8 text-md">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/" className="flex items-center no-underline">
            <img src={logo} alt="MIT Clubs Logo" className="h-8 w-auto mr-2" />
            <span className="hidden md:inline text-xl font-bold text-appdev-blue-dark">
              MIT Clubs
            </span>
          </NavLink>

          {/* Desktop View */}
          <div className="hidden md:flex items-center space-x-10">
            {isAuth ? (
              <>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `no-underline font-semibold ${
                      isActive
                        ? "text-appdev-blue-dark"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                >
                  About
                </NavLink>
                <NavLink
                  to="/events"
                  className={({ isActive }) =>
                    `no-underline font-semibold ${
                      isActive
                        ? "text-appdev-blue-dark"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                >
                  Events
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `no-underline font-semibold ${
                      isActive
                        ? "text-appdev-blue-dark"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                >
                  Profile
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="text-gray-600 hover:text-gray-900 no-underline font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `no-underline font-semibold ${
                      isActive
                        ? "text-appdev-blue-dark"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                >
                  About
                </NavLink>
                <NavLink
                  to="/events"
                  className={({ isActive }) =>
                    `no-underline font-semibold ${
                      isActive
                        ? "text-appdev-blue-dark"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                >
                  Events
                </NavLink>
                <button
                  onClick={() => redirectToLogin()}
                  className="bg-appdev-blue text-white px-4 py-2 rounded-md hover:bg-appdev-blue-dark font-semibold"
                >
                  Login
                </button>
              </>
            )}
          </div>

          {/* Mobile View */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2">
            <div className="flex flex-col space-y-2 pt-4">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `no-underline font-semibold py-2 ${
                    isActive
                      ? "text-appdev-blue-dark"
                      : "text-gray-600 hover:text-gray-900"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </NavLink>
              {isAuth ? (
                <>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `no-underline font-semibold py-2 ${
                        isActive
                          ? "text-appdev-blue-dark"
                          : "text-gray-600 hover:text-gray-900"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-gray-900 no-underline font-semibold py-2 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="py-2">
                  <button
                    onClick={() => {
                      redirectToLogin();
                      setIsMenuOpen(false);
                    }}
                    className="bg-appdev-blue text-white px-4 py-2 rounded-md hover:bg-appdev-blue-dark font-semibold w-full"
                  >
                    Login
                  </button>
                </div>
              )}
                <NavLink
                  to="/events"
                  className={({ isActive }) =>
                    `no-underline font-semibold py-2 ${
                      isActive
                        ? "text-appdev-blue-dark"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Events
                </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
