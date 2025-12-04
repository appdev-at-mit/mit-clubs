import React from "react";
import Logo from "../../assets/logo-with-words.png";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 mx-3">
      <img src={Logo} alt="MIT Clubs Logo" className="w-64 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        something went wrong
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you are looking for does not exist.
      </p>
    </div>
  );
};

export default NotFound;
