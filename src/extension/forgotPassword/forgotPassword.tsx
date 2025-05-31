import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../../lib/services/auth.service';
import BackButton from '../vault/components/BackButton';
import Input from '../vault/components/Input';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgotPassword = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      await forgotPasswordApi(email);
      navigate(`/enter-pin-forgot-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Lỗi khi yêu cầu đặt lại mật khẩu', error);
      setError(
        error.response?.data?.message || 'Yêu cầu đặt lại mật khẩu thất bại. Vui lòng thử lại.',
      );
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
          <img src="./icons/logo.png" alt="1Key Logo" className="w-32" />
        </div>

        <h2 className="text-xl font-semibold text-center mb-4">Quên mật khẩu</h2>
        <p className="text-gray-600 text-center mb-6">Nhập email của bạn để nhận mã xác nhận.</p>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <Input id="email" label="Email" value={email} placeholder="Email" onChangeText={setEmail} />

        <button
          id="forgotPasswordButton"
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded mt-4 disabled:opacity-50"
          disabled={!email || isSubmitting}
          onClick={handleForgotPassword}
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
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

export default ForgotPassword;
