// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  requiredRoles?: string[]; // optional role check
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { isAuthenticated, user } = useAuth();

  // 🔒 Not logged in → go to 401
  if (!isAuthenticated) {
    return <Navigate to="/401" replace />;
  }

  // 🚫 Logged in but lacks role → go to 403
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = user?.role;
    if (!userRole || !requiredRoles.includes(userRole)) {
      return <Navigate to="/403" replace />;
    }
  }

  // ✅ Authorized → render the protected page
  return <Outlet />;
};

export default ProtectedRoute;
