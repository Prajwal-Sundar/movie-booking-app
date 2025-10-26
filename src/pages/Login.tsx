import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiCaller, ApiEndpoint } from "../apiCaller";
import PopupModal from "../components/PopupModal";
import { useAuth } from "../components/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.type]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiCaller(ApiEndpoint.LOGIN_USER, {
        email: formData.email.trim(),
        password: formData.password,
      });

      // ✅ Successful login
      if (response?.token) {
        login(response.token, response.user);
        setPopup({
          show: true,
          type: "success",
          title: "Login Successful",
          message: "Redirecting to dashboard in 3 seconds...",
        });
        setCountdown(3);
      } else {
        // ❌ Backend returned error JSON (custom message)
        setPopup({
          show: true,
          type: "error",
          title: "Login Failed",
          message:
            response?.message || "Invalid credentials. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Login Error:", error);

      let message = "Internal Server Error - Please contact admin";

      if (error.response?.status === 404) {
        message = "No account found with this email.";
      } else if (error.response?.status === 401) {
        message = "Incorrect password. Please try again.";
      } else if (error.response?.status === 400) {
        message = "Email and password are required.";
      }

      setPopup({
        show: true,
        type: "error",
        title: "Login Failed",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Countdown logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setPopup((prev) => ({ ...prev, show: false }));
      navigate("/dashboard");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
      setPopup((prev) => ({
        ...prev,
        message: `Redirecting to dashboard in ${countdown - 1} second${
          countdown - 1 !== 1 ? "s" : ""
        }...`,
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <>
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent text-center mb-8">
            Login
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold py-3 rounded-xl shadow-lg transform transition ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-gray-600 text-center mt-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-pink-500 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </motion.div>

      {/* ✅ Popup modal */}
      <PopupModal
        show={popup.show}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
      />
    </>
  );
};

export default Login;
