import React from "react";
import SignIn from "../signIn/sign-in";
import initAuthStore from "../../store";
import store from "../../store/store";
import { redirect } from "react-router-dom";

export const authRoutes = [
  { path: "sign-in", element: <SignIn /> },
]

export const authLoader = async (): Promise<boolean> => {
  await initAuthStore();
  return !store.getState().auth.isLoggedIn;
}