import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Profile from "./Profile";
import { FaUserCircle } from "react-icons/fa";

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const token = localStorage.getItem("authToken");
  const userName = token ? "John Doe" : null;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.reload();
  };

  useEffect(() => {
    setDropdownOpen(false);
  }, [location]);

  return (
    <header className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 relative">
        {/* Centered Brand with premium underline effect */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-2xl font-bold text-red-500 relative group cursor-pointer">
            Movie Booking App
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full"></span>
          </span>
        </div>

        {/* Right Profile Circle */}
        <div className="ml-auto relative">
          <button
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-shadow transition-colors shadow-sm hover:shadow-lg"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaUserCircle className="text-2xl" />
          </button>

          {dropdownOpen && (
            <Profile userName={userName} onLogout={handleLogout} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
