import { Outlet, RouteObject } from 'react-router-dom';
import SignIn from '../signIn/sign-in';
import Profile from '../vault/profile';

export const tabRoutes: RouteObject[] = [
  {
    path: '',
    Component: Outlet,
    children: [
      {
        path: '',
        Component: Profile,
      },
      {
        path: 'sign-in',
        Component: SignIn,
      },
    ],
  },
];
