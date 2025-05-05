import React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, redirect, RouterProvider } from "react-router-dom"; // Sử dụng createHashRouter và RouterProvider

import { Provider } from 'react-redux';
import "./assets/css/index.css";
import AuthLayout from "./extension/layout/authLayout";
import { authLoader, authRoutes } from "./extension/routes/authRoutes";
import { tabRoutes } from "./extension/routes/tabRoutes";
import store from "./store/store";
import ProtectedRoute from "./extension/routes/component/ProtectedRoute";
import ErrorPage from "./extension/components/error";
import { logout } from "./store/auth-slice";
import TabLayout from "./extension/layout/tabLayout";

const router = createHashRouter([
  {
    id: "root",
    path: "/",
    loader: authLoader,
    Component: ProtectedRoute,
    children: [
      {
        path: "",
        Component: TabLayout,
        children: [...tabRoutes],
      },
    ],
  },
  {
    path: "/auth",
    Component: AuthLayout,
    children: [...authRoutes],
  },
  {
    path: "/logout",
    action: () => {
      store.dispatch(logout());
      return redirect("/auth");
    },
  },
  {
    path: "*", // Trang 404
    element: <ErrorPage />,
  },
]);

const appContainer = document.createElement("div");
document.body.appendChild(appContainer);

const root = createRoot(appContainer);
root.render(
  <Provider store={store}> 
    <RouterProvider router={router}/>
  </Provider>
);