import React from "react";
import { Link } from "react-router-dom";

const Error401: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-10 text-center">
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
        401
      </h1>
      <p className="text-base sm:text-lg md:text-xl mb-8 text-gray-700 max-w-md">
        You must be logged in to access this page.
      </p>
      <Link
        to="/login"
        className="inline-block bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 
             text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg 
             transform transition-transform duration-300 hover:scale-105"
      >
        Go to Login
      </Link>
    </div>
  );
};

export default Error401;
