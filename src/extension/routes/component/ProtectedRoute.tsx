import React from "react";
import { Navigate, Outlet, useLocation, useRouteLoaderData } from "react-router-dom";
import store from "../../../store/store";

const ProtectedRoute = () => {
  const location = useLocation();
  let isLoggedIn = useRouteLoaderData("root");
  return isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/sign-in" state={{ from: location }} replace />
  );
}

export default ProtectedRoute;