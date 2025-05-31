import React from 'react';
import initAuthStore from '../../store';
import store from '../../store/store';
import SignIn from '../signIn/sign-in';
import SignUp from '../signUp/sign-up';

export const authRoutes = [
  { path: 'sign-in', element: <SignIn /> },
  { path: 'sign-up', element: <SignUp /> },
];

export const authLoader = async (): Promise<boolean> => {
  await initAuthStore();
  return store.getState().auth.isLoggedIn;
};
