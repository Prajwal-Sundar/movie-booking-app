import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiCaller, ApiEndpoint } from "../apiCaller";
import { Role } from "../../server/models/user";
import PopupModal from "../components/PopupModal";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: Role.USER,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "info" as "success" | "error" | "info",
    showLoginLink: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isStrongPassword = (password: string): boolean => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return strongRegex.test(password);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const showPopup = (
    message: string,
    type: "success" | "error" | "info" = "info",
    showLoginLink = false
  ) => {
    setPopup({ show: true, message, type, showLoginLink });
  };

  const handleClosePopup = () => {
    if (popup.type === "success") {
      window.location.reload(); // Refresh page after successful registration
    } else {
      setPopup((prev) => ({ ...prev, show: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      showPopup("Please fill in all required fields.", "error");
      return;
    }

    if (!isValidEmail(formData.email.trim())) {
      showPopup("Please enter a valid email address.", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showPopup("Passwords do not match.", "error");
      return;
    }

    if (!isStrongPassword(formData.password)) {
      showPopup(
        "Password must include uppercase, lowercase, number, and special character (min 8 chars).",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiCaller(ApiEndpoint.REGISTER_USER, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      if (res.success) {
        showPopup(res.message || "Registration successful!", "success", true);
      } else if (res.message === "Email is already registered") {
        // ⚠️ Custom message with login link
        showPopup(
          "Email is already registered!", // <- keep this generic
          "error",
          true // show login link
        );
      } else {
        showPopup(
          res.message || "An error occurred during registration.",
          "error"
        );
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      showPopup(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PopupModal
        show={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={handleClosePopup}
      >
        {popup.showLoginLink &&
        popup.message === "Email is already registered!" ? (
          <p className="text-center text-sm text-gray-800 whitespace-pre-line">
            Email is already registered with us — Please{" "}
            <span
              onClick={() => {
                handleClosePopup();
                navigate("/login");
              }}
              className="text-pink-500 font-semibold cursor-pointer hover:underline"
            >
              click here
            </span>{" "}
            to login, or use an alternate email address to register.
          </p>
        ) : (
          <p className="text-center text-sm text-gray-800 whitespace-pre-line">
            {popup.message}
          </p>
        )}
      </PopupModal>

      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent text-center mb-8">
            Register
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="text"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />

              {/* Fancy toggle switch */}
              <label className="flex items-center gap-3 mt-2 cursor-pointer select-none">
                <div
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                    showPassword
                      ? "bg-gradient-to-r from-pink-500 to-purple-500"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      showPassword ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></span>
                </div>
                <span className="text-sm text-gray-600">Show Password</span>
              </label>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />

              {/* Fancy toggle switch */}
              <label className="flex items-center gap-3 mt-2 cursor-pointer select-none">
                <div
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                    showConfirmPassword
                      ? "bg-gradient-to-r from-pink-500 to-purple-500"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      showConfirmPassword ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></span>
                </div>
                <span className="text-sm text-gray-600">
                  Show Confirm Password
                </span>
              </label>
            </div>

            {/* Role */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value={Role.USER}>User</option>
                <option value={Role.THEATRE_OWNER}>Theatre Owner</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:scale-105 transform transition disabled:opacity-70"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-gray-600 text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-500 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default Register;
