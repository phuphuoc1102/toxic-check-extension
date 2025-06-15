import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { changePasswordApi } from '../../lib/services/auth.service';
import BackButton from '../vault/components/BackButton';
import Input from '../vault/components/Input';

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const codeParam = params.get('code');

    chrome.runtime.sendMessage({
      action: 'LOG',
      message: `[ResetPassword] Email: ${emailParam}, Code: ${codeParam}`,
    });
  }, [location]);

  const handleChangePassword = async () => {
    try {
      setError(null);
      if (!oldPassword || !password || !confirmPassword) {
        setError('Vui lòng điền đầy đủ thông tin.');
        return;
      }
      setIsSubmitting(true);
      if (confirmPassword !== password) {
        setError('Mật khẩu xác nhận không khớp.');
        return;
      }
      await changePasswordApi({ oldPassword, newPassword: password });
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
          <img src="./icons/logo.png" alt="1Key Logo" className="w-32" />
        </div>

        <h2 className="text-center text-lg font-semibold text-gray-800 mb-4">Đặt lại mật khẩu</h2>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <Input
          id="oldPassword"
          label="Mật khẩu cũ"
          value={oldPassword}
          placeholder="Mật khẩu cũ"
          secureTextEntry
          onChangeText={setOldPassword}
        />
        <Input
          id="password"
          label="Mật khẩu mới"
          value={password}
          placeholder="Mật khẩu mới"
          secureTextEntry
          onChangeText={setPassword}
        />
        <Input
          id="confirmPassword"
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          placeholder="Xác nhận mật khẩu mới"
          secureTextEntry
          onChangeText={setConfirmPassword}
        />

        <button
          id="resetPasswordButton"
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded mt-4 disabled:opacity-50"
          disabled={!password || isSubmitting}
          onClick={handleChangePassword}
        >
          {isSubmitting ? 'Đang gửi...' : 'Cập nhật mật khẩu'}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
