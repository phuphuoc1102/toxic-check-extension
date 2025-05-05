import React from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, redirect, RouterProvider } from 'react-router-dom'; // Sử dụng createHashRouter và RouterProvider

import { Provider } from 'react-redux';
import './assets/css/index.css';
import ErrorPage from './extension/components/error';
import AuthLayout from './extension/layout/authLayout';
import TabLayout from './extension/layout/tabLayout';
import { authRoutes } from './extension/routes/authRoutes';
import { tabRoutes } from './extension/routes/tabRoutes';
import { logout } from './store/auth-slice';
import store from './store/store';

const router = createHashRouter([
  {
    id: 'root',
    path: '/',
    Component: TabLayout,
    children: [...tabRoutes],
  },
  {
    path: '/auth',
    Component: AuthLayout,
    children: [...authRoutes],
  },
  {
    path: '/logout',
    action: () => {
      store.dispatch(logout());
      return redirect('/auth');
    },
  },
  {
    path: '*', // Trang 404
    element: <ErrorPage />,
  },
]);

const appContainer = document.createElement('div');
document.body.appendChild(appContainer);

const root = createRoot(appContainer);
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>,
);
