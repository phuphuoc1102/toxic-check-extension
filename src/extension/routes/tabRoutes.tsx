import {Outlet, RouteObject} from 'react-router-dom';
import Vault from '../vault/vault';
import AddPassword from '../vault/add-pasword';
import {Generator} from '../generator/generator';
import {Setting} from '../setting/setting';
import Profile from '../vault/profile';

export const tabRoutes: RouteObject[] = [
  {
    path: '',
    Component: Outlet,
    children: [
      {
        path: '',
        Component: Vault,
      },
      {
        path: 'add-password',
        Component: AddPassword,
      },
      {
        path: 'profile',
        Component: Profile,
      },
    ],
  },
  {
    path: 'generator',
    Component: Outlet,
    children: [
      {
        path: '',
        Component: Generator,
      },
    ],
  },
  {
    path: 'setting',
    Component: Outlet,
    children: [
      {
        Component: Setting,
      },
    ],
  },
];
