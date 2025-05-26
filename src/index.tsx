import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createHashRouter, redirect, RouterProvider } from 'react-router-dom';
import './assets/css/index.css';
import ErrorPage from './extension/components/error';
import AuthLayout from './extension/layout/authLayout';
import TabLayout from './extension/layout/tabLayout';
import { authRoutes } from './extension/routes/authRoutes';
import { tabRoutes } from './extension/routes/tabRoutes';
import { initAuthStore } from './store'; // Import initAuthStore
import { logout } from './store/auth-slice';
import store from './store/store';

// Component wrapper để gọi initAuthStore
const App = () => {
  useEffect(() => {
    initAuthStore()
      .then(() => {
        console.log('App: initAuthStore completed');
      })
      .catch((error) => {
        console.error('App: initAuthStore error', error);
      });
  }, []);

  return <RouterProvider router={router} />;
};

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
    path: '*',
    element: <ErrorPage />,
  },
]);

const appContainer = document.createElement('div');
document.body.appendChild(appContainer);

const root = createRoot(appContainer);
root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
