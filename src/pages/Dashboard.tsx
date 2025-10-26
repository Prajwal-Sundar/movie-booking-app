import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../components/AuthContext";

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null; // Prevent flash before redirect

  // 🧠 Role-based rendering logic
  const isAppOwner = user?.role === "APP_OWNER";
  const isTheatreOwner = user?.role === "THEATRE_OWNER";

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 mt-8">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
          User Dashboard
        </h1>

        {/* 👤 User Info Card */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-gray-200 rounded-xl shadow-sm p-6 mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome, {user.name || "User"} 👋
          </h2>
          <p className="text-gray-600">{user.email}</p>
          <span className="inline-block mt-3 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white text-sm font-medium shadow">
            {user.role || "User"}
          </span>
        </div>

        {/* 🧭 Role-Based Dashboard Options */}
        {isAppOwner ? (
          // 🎭 APP OWNER VIEW
          <div className="grid grid-cols-1 gap-6">
            <div
              onClick={() => navigate("/theatres")}
              className="cursor-pointer bg-gray-100 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🏛️ Theatres
              </h3>
              <p className="text-gray-600 text-sm">
                Organize and manage all theatres registered within the
                application.
              </p>
            </div>
          </div>
        ) : isTheatreOwner ? (
          // 🎬 THEATRE OWNER VIEW
          <div className="grid grid-cols-1 gap-6">
            <div
              onClick={() => navigate("/shows")}
              className="cursor-pointer bg-gray-100 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🎬 Shows
              </h3>
              <p className="text-gray-600 text-sm">
                Organize and manage all shows registered with theatres owned by
                you.
              </p>
            </div>
          </div>
        ) : (
          // 👥 OTHER USERS VIEW
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-100 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🎟️ My Bookings
              </h3>
              <p className="text-gray-600 text-sm">
                View and manage your booked shows.
              </p>
            </div>

            <div className="bg-gray-100 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🏛️ Theatres
              </h3>
              <p className="text-gray-600 text-sm">
                Explore nearby theatres and upcoming shows.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
