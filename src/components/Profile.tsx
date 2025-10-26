import React from "react";
import { Link } from "react-router-dom";

interface ProfileProps {
  userName?: string | null;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userName, onLogout }) => {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg text-gray-200 py-2 z-50">
      {userName ? (
        <>
          <div className="px-4 py-2 hover:bg-gray-700 cursor-default">
            Logged in as <span className="font-semibold">{userName}</span>
          </div>
          <hr className="border-gray-700 my-1" />
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-700 transition"
            onClick={onLogout}
          >
            Logout
          </button>
        </>
      ) : (
        <div className="px-4 py-4 text-center">
          <Link
            to="/login"
            className="inline-block w-full bg-red-500 text-white font-semibold py-2 rounded hover:bg-red-600 transition"
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default Profile;
