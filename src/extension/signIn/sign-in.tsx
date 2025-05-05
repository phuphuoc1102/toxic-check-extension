/*global chrome*/
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginApi } from "../../lib/services/auth.service";
import initAuthStore from "../../store";
import { setItemStorage } from "../../store/utils";
import "./css/sign-in.css";

const SignIn = ({route}: any) => {
  const location = useLocation();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = e => setEmail(e.target.value);
  const handlePasswordChange = e => setPassword(e.target.value);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    // Get redirect URL from query params
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    setRedirectUrl(redirect);
    chrome.runtime.sendMessage({
      action: "LOG",
      message: `[SignIn] Redirect URL: ${redirect}`,
    });
  }, [location]);

  const navigate = useNavigate();
  const handleSignIn = async () => {
    try {
      const response = await loginApi(email, password);
      await setItemStorage("access_token", response.data.access_token);
      await setItemStorage("refresh_token", response.data.refresh_token);
      await initAuthStore(email, password);

      if (redirectUrl) {
        chrome.tabs.update({url: redirectUrl});
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error while signing in", error);
    }
  };

  return (
    <div className="bg-gray-200 flex items-center justify-center min-h-screen">
      <div className="container w-400px mx-auto">
        <div className="bg-white p-8 rounded-lg  mt-4">
          <div className="logo flex justify-center mb-6">
            <img src="./icons/logo.png" alt="1Key Logo" className="w-32" />
          </div>

          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            required
            value={email}
            onChange={handleEmailChange}
            className="mt-1 mb-4 w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="password-container relative flex items-center mt-1 mb-4">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Master password"
              required
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              id="togglePassword"
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              onClick={togglePasswordVisibility}>
              <img
                src="./icons/show-password.png"
                alt="Show Password Icon"
                id="toggleIcon"
                className="h-4 w-4"
              />
            </span>
          </div>

          <button
            id="signInButton"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded mt-4 disabled:opacity-50"
            disabled={!email || !password}
            onClick={handleSignIn}>
            Sign In
          </button>

          <p className="text-center mt-6 text-gray-600">
            Not using 1Key yet?{" "}
            <a href="#" className="text-blue-500">
              Create an account
            </a>
          </p>

          <div className="flex items-center my-4">
            <span className="flex-grow border-t border-gray-300"></span>
            <span className="px-4 text-gray-500">or</span>
            <span className="flex-grow border-t border-gray-300"></span>
          </div>

          <button className="flex items-center justify-center w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded">
            <img
              src="./icons/google.png"
              alt="Google Logo"
              className="h-5 mr-2"
            />{" "}
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
