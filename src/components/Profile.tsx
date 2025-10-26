import React from "react";
import { Link } from "react-router-dom";

interface ProfileProps {
  userName?: string | null;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userName, onLogout }) => {
  return (
    <div className="absolute right-0 mt-3 w-48 sm:w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl text-gray-200 py-2 z-50 animate-fadeIn">
      {userName ? (
        <>
          <div className="px-4 py-2 text-sm sm:text-base text-gray-300 hover:bg-gray-700 cursor-default rounded-t-xl transition">
            Logged in as{" "}
            <span className="font-semibold text-white">{userName}</span>
          </div>
          <hr className="border-gray-700 my-1" />
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm sm:text-base rounded-b-xl hover:bg-gradient-to-r hover:from-red-500 hover:via-pink-500 hover:to-purple-500 transition-colors duration-300 font-medium"
          >
            Logout
          </button>
        </>
      ) : (
        <div className="px-4 py-3 text-center">
          <Link
            to="/login"
            className="inline-block w-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-transform transform hover:scale-105 text-sm sm:text-base"
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default Profile;
