// import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const ProtectedRoute = ({ allowedRoles = [] }:{allowedRoles:string[]}) => {
  const { user } = useAuth();

//   if (loading) {
//     return null;
//   }

  // 🔐 Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
