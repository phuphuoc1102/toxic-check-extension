import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../../lib/services/auth.service';
import BackButton from '../vault/components/BackButton';
import Input from '../vault/components/Input';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const codeParam = params.get('code');
    setEmail(emailParam || '');
    setCode(codeParam || '');
    chrome.runtime.sendMessage({
      action: 'LOG',
      message: `[ResetPassword] Email: ${emailParam}, Code: ${codeParam}`,
    });
  }, [location]);

  const handleResetPassword = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      if (!email || !code) {
        setError('Thiếu thông tin email hoặc mã PIN.');
        return;
      }
      await resetPasswordApi({ email, confirmPassword: password, password });
      navigate('/sign-in');
    } catch (error: any) {
      console.error('Lỗi khi đặt lại mật khẩu:', error);
      setError(error.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
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

        <h2 className="text-center text-lg font-semibold text-gray-800 mb-4">Đặt lại mật khẩu</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <Input
          id="password"
          label="Mật khẩu mới"
          value={password}
          placeholder="Mật khẩu mới"
          secureTextEntry
          onChangeText={setPassword}
        />

        <button
          id="resetPasswordButton"
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded mt-4 disabled:opacity-50"
          disabled={!password || isSubmitting}
          onClick={handleResetPassword}
        >
          {isSubmitting ? 'Đang gửi...' : 'Cập nhật mật khẩu'}
        </button>

        <p className="text-center mt-6 text-gray-600">
          Quay lại{' '}
          <button className="text-blue-500 underline" onClick={() => navigate('/sign-in')}>
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
