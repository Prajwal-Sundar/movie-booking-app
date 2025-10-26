// src/App.tsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Outlet,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Error401 from "./errors/Error401";
import Error403 from "./errors/Error403";
import Error404 from "./errors/Error404";

import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard"; // Replace with your real component
// import AdminPanel from "./pages/AdminPanel"; // Replace with your real component

// 🧱 Layout wrapper for Header/Footer animations
const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <Header />
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-white shadow-inner mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

// 🎬 AnimatedRoutes handles all route transitions
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          {/* 🌐 Public Routes */}
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ❌ Error Pages */}
          <Route path="/401" element={<Error401 />} />
          <Route path="/403" element={<Error403 />} />
          <Route path="*" element={<Error404 />} />

          {/* 🔒 Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* 🧑‍💼 Role-Protected Routes */}
          <Route element={<ProtectedRoute requiredRoles={["APP_OWNER"]} />}>
            <Route
              path="/admin"
              element={<div>Admin Panel (create this page)</div>}
            />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

// 🏁 Main App
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
