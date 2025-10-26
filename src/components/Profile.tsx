import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface ProfileProps {
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({
  userName,
  userEmail,
  userRole,
  onLogout,
}) => {
  const navigate = useNavigate();

  const displayRole =
    userRole === "APP_OWNER"
      ? "Owner"
      : userRole === "ADMIN"
      ? "Admin"
      : userRole === "USER"
      ? "User"
      : null;

  const handleProfileClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="w-52 sm:w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl text-gray-200 py-3 animate-fadeIn text-center select-none no-underline">
      {userName ? (
        <>
          {/* Clickable user info block */}
          <div
            onClick={handleProfileClick}
            className="px-4 py-2 cursor-pointer hover:bg-gray-700 transition-colors duration-200 rounded-lg"
          >
            <p className="text-base font-semibold text-white">{userName}</p>
            <p className="text-sm text-gray-400">{userEmail}</p>
            {displayRole && (
              <p className="text-sm text-pink-400 mt-1 font-medium">
                {displayRole}
              </p>
            )}
          </div>

          <hr className="border-gray-700 my-2" />

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-4/5 mx-auto block text-center px-4 py-2 text-sm sm:text-base rounded-lg bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:opacity-90 transition duration-300 font-medium text-white focus:outline-none"
          >
            Logout
          </button>
        </>
      ) : (
        <div className="px-4 py-3">
          <Link
            to="/login"
            className="inline-block w-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-transform transform hover:scale-105 text-sm sm:text-base no-underline"
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default Profile;
