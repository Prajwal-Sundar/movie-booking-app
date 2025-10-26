import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import Profile from "./Profile";
import { useAuth } from "./AuthContext";

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 0);
  };

  return (
    <header className="bg-gray-900 text-white shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 relative select-none">
        {/* Brand Section */}
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent hover:opacity-90 transition no-underline"
          style={{ textDecoration: "none" }}
        >
          MovieBookingApp
        </Link>

        {/* Profile Section */}
        <div className="relative">
          <button
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-shadow shadow-sm hover:shadow-lg focus:outline-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ textDecoration: "none" }}
          >
            <FaUserCircle className="text-xl sm:text-2xl" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 z-50"
              style={{ textDecoration: "none" }}
            >
              <Profile
                userName={user?.name}
                userEmail={user?.email}
                userRole={user?.role}
                onLogout={handleLogout}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
