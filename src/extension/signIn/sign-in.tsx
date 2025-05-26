import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { googleLoginApi, loginApi } from '../../lib/services/auth.service';
import initAuthStore from '../../store';
import { setItemStorage } from '../../store/utils';
import './css/sign-in.css';

const SignIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    // Lấy redirect URL từ query params
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    setRedirectUrl(redirect);
    chrome.runtime.sendMessage({
      action: 'LOG',
      message: `[SignIn] Redirect URL: ${redirect}`,
    });
  }, [location]);

  const handleSignIn = async () => {
    try {
      setError(null);
      const response = await loginApi(email, password);
      await setItemStorage('access_token', response.data.access_token);
      await setItemStorage('refresh_token', response.data.refresh_token);
      await initAuthStore(email, password);

      if (redirectUrl) {
        chrome.tabs.update({ url: redirectUrl });
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Lỗi khi đăng nhập', error);
      setError(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      if (!chrome || !chrome.identity) {
        throw new Error('Chrome Identity API không khả dụng.');
      }

      // Lấy access token từ Chrome Identity API
      const accessToken = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(token);
          }
        });
      });
      console.log('Google access token:', accessToken);

      // Gọi Google People API để lấy thông tin người dùng
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Không thể lấy thông tin người dùng từ Google.');
      }
      const userInfo = await userInfoResponse.json();
      console.log('User info:', userInfo);

      const email = userInfo.email;
      const name = userInfo.name;
      const photo = userInfo.picture;

      if (!email) {
        throw new Error('Không thể lấy email từ Google.');
      }

      // Tạo deviceId duy nhất cho tiện ích
      const deviceId = await new Promise<string>((resolve) => {
        chrome.storage.local.get(['deviceId'], (result) => {
          if (result.deviceId) {
            resolve(result.deviceId);
          } else {
            const newDeviceId = crypto.randomUUID();
            chrome.storage.local.set({ deviceId: newDeviceId }, () => {
              resolve(newDeviceId);
            });
          }
        });
      });
      console.log('Device ID:', deviceId);

      const userAgent = 'Chrome';
      console.log('User Agent:', userAgent);

      // Gửi thông tin người dùng đến backend
      const response = await googleLoginApi({
        email,
        name,
        photo,
        userAgent,
        deviceId,
      });
      console.log('Google login response:', response);

      await setItemStorage('access_token', response.data.access_token);
      await setItemStorage('refresh_token', response.data.refresh_token);
      await initAuthStore(response.data.email, null);

      if (redirectUrl) {
        chrome.tabs.update({ url: redirectUrl });
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Lỗi khi đăng nhập bằng Google:', error);
      setError(error.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="bg-white h-screen flex flex-col px-5 w-[58vh]">
      <div className="bg-white p-8 rounded-lg mt-4">
        <div className="logo flex justify-center mb-6">
          <img src="./icons/logo.png" alt="1Key Logo" className="w-32" />
        </div>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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

        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <div className="password-container relative flex items-center mt-1 mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Mật khẩu"
            required
            value={password}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span
            id="togglePassword"
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            <img
              src="./icons/show-password.png"
              alt="Hiển thị mật khẩu"
              id="toggleIcon"
              className="h-4 w-4"
            />
          </span>
        </div>

        <button
          id="signInButton"
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded mt-4 disabled:opacity-50"
          disabled={!email || !password}
          onClick={handleSignIn}
        >
          Đăng nhập
        </button>

        <p className="text-center mt-6 text-gray-600">
          Chưa sử dụng 1Key?{' '}
          <a href="#" className="text-blue-500" onClick={() => navigate('/signup')}>
            Tạo tài khoản
          </a>
        </p>

        <div className="flex items-center my-4">
          <span className="flex-grow border-t border-gray-300"></span>
          <span className="px-4 text-gray-500">hoặc</span>
          <span className="flex-grow border-t border-gray-300"></span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded"
        >
          <img src="./icons/google.png" alt="Google Logo" className="h-5 mr-2" /> Đăng nhập với
          Google
        </button>
      </div>
    </div>
  );
};

export default SignIn;
