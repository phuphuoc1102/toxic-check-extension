import { Outlet, RouteObject } from 'react-router-dom';
import ChangePassword from '../changePassword/changePassword';
import TurnOnSecurity from '../enterNewSecurityCode/enter-new-security-code';
import EnterPin from '../enterPin/enter-pin';
import EnterPinForgotPassword from '../enterPinForgotPassword/enter-pin-forgot-password';
import ForgotPassword from '../forgotPassword/forgotPassword';
import ResetPassword from '../resetPassword/resetPassword';
import SignIn from '../signIn/sign-in';
import SignUp from '../signUp/sign-up';
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
      {
        path: 'sign-up',
        Component: SignUp,
      },
      {
        path: 'enter-pin',
        Component: EnterPin,
      },
      {
        path: 'forgot-password',
        Component: ForgotPassword,
      },
      {
        path: 'enter-pin-forgot-password',
        Component: EnterPinForgotPassword,
      },
      {
        path: 'reset-password',
        Component: ResetPassword,
      },
      {
        path: 'toggle-security',
        Component: TurnOnSecurity,
      },
      {
        path: 'change-password',
        Component: ChangePassword,
      },
    ],
  },
];
