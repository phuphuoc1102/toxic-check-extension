import { Outlet, RouteObject } from 'react-router-dom';
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
    ],
  },
];
