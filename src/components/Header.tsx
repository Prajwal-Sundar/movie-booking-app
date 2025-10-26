import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Profile from "./Profile";
import { FaUserCircle } from "react-icons/fa";

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const token = localStorage.getItem("authToken");
  const userName = token ? "XYZ" : null;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.reload();
  };

  useEffect(() => {
    setDropdownOpen(false);
  }, [location]);

  return (
    <header className="bg-gray-900 text-white shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 relative">
        {/* Brand Section */}
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent hover:opacity-90 transition"
        >
          MovieBookingApp
        </Link>

        {/* Profile Section */}
        <div className="relative">
          <button
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-shadow shadow-sm hover:shadow-lg focus:outline-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaUserCircle className="text-xl sm:text-2xl" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 z-50">
              <Profile userName={userName} onLogout={handleLogout} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
