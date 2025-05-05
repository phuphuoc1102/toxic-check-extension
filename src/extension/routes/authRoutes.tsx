import React from 'react';
import initAuthStore from '../../store';
import store from '../../store/store';
import SignIn from '../signIn/sign-in';

export const authRoutes = [{ path: 'sign-in', element: <SignIn /> }];

export const authLoader = async (): Promise<boolean> => {
  await initAuthStore();
  return !store.getState().auth.isLoggedIn;
};
