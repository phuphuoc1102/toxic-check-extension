import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerApi } from '../../lib/services/auth.service';
import BackButton from '../vault/components/BackButton';
import Input from '../vault/components/Input';
import './css/sign-in.css';

const SignUp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    setRedirectUrl(redirect);
    chrome.runtime.sendMessage({
      action: 'LOG',
      message: `[SignUp] Redirect URL: ${redirect}`,
    });
  }, [location]);

  const handleSignUp = async () => {
    try {
      setError(null);

      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.');
        return;
      }

      await registerApi({ email, password, confirmPassword });

      const query = new URLSearchParams();
      query.set('email', email);
      if (redirectUrl) {
        query.set('redirect', redirectUrl);
      }
      navigate(`/enter-pin?${query.toString()}`);
    } catch (error: any) {
      console.error('Lỗi khi đăng ký:', error);
      setError(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="bg-white h-screen flex flex-col px-5 w-[65vh]">
      <div className="self-start py-2">
        <BackButton handlePress={() => navigate('/')} />
      </div>

      <div className="bg-white p-2 rounded-lg">
        <div className="logo flex justify-center mb-6">
          <img src="./icons/logo.png" alt="P3 Logo" className="w-32" />
        </div>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <Input id="email" label="Email" value={email} placeholder="Email" onChangeText={setEmail} />

        <Input
          id="password"
          label="Mật khẩu"
          value={password}
          placeholder="Mật khẩu"
          secureTextEntry
          onChangeText={setPassword}
        />

        <Input
          id="confirm_password"
          label="Xác nhận mật khẩu"
          value={password}
          placeholder="Xác nhận mật khẩu"
          secureTextEntry
          onChangeText={setConfirmPassword}
        />
        <button
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded mt-4 disabled:opacity-50"
          disabled={!email || !password || !confirmPassword}
          onClick={handleSignUp}
        >
          Tạo tài khoản
        </button>

        <p className="text-center mt-6 text-gray-600">
          Đã có tài khoản?{' '}
          <button className="text-blue-500 underline" onClick={() => navigate('/sign-in')}>
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
