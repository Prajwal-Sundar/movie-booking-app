import React, { useState, useEffect } from "react";
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

  // popup now includes title + message so we can keep the title steady
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  const [countdown, setCountdown] = useState<number | null>(null);

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
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setPopup({ show: true, title, message, type });
  };

  const handleClosePopup = () => {
    // Close behavior: if success and countdown active, keep it; otherwise hide
    if (popup.type === "success" && countdown !== null) {
      // allow countdown flow to handle redirect; just hide if user explicitly closes
      setPopup((prev) => ({ ...prev, show: false }));
      setCountdown(null);
      navigate("/login");
    } else {
      setPopup((prev) => ({ ...prev, show: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      showPopup("Error", "Please fill in all required fields.", "error");
      return;
    }

    if (!isValidEmail(formData.email.trim())) {
      showPopup("Error", "Please enter a valid email address.", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showPopup("Error", "Passwords do not match.", "error");
      return;
    }

    if (!isStrongPassword(formData.password)) {
      showPopup(
        "Error",
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
        // set title separately so it stays visible while message updates
        setPopup({
          show: true,
          title: "Registration successful",
          message: "Redirecting to login in 3 seconds...",
          type: "success",
        });
        setCountdown(3);
      } else if (res.message === "Email is already registered") {
        // show error with a link rendered in popup body (handled where the PopupModal is rendered)
        setPopup({
          show: true,
          title: "Registration failed",
          message: "Email is already registered",
          type: "error",
        });
      } else {
        setPopup({
          show: true,
          title: "Registration failed",
          message: res.message || "An error occurred during registration.",
          type: "error",
        });
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      setPopup({
        show: true,
        title: "Registration failed",
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Countdown logic identical to Login.tsx but updates only message (title stays)
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setPopup((prev) => ({ ...prev, show: false }));
      setCountdown(null);
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => {
        const next = prev !== null ? prev - 1 : null;
        if (next !== null) {
          setPopup((prevPopup) => ({
            ...prevPopup,
            message: `Redirecting to login in ${next} second${
              next !== 1 ? "s" : ""
            }...`,
          }));
        }
        return next;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <>
      <PopupModal
        show={popup.show}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={handleClosePopup}
      >
        {/* Special handling for duplicate-email to show the clickable 'here' link */}
        {popup.message === "Email is already registered" ? (
          <p className="text-center text-sm text-gray-800 whitespace-pre-line">
            Email is already registered with us — Please{" "}
            <span
              onClick={() => {
                setPopup((prev) => ({ ...prev, show: false }));
                navigate("/login");
              }}
              className="text-pink-500 font-semibold cursor-pointer hover:underline"
            >
              click here
            </span>{" "}
            to login, or use an alternate email address to register.
          </p>
        ) : null}
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
            {/* Full Name */}
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
