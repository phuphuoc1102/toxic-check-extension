import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyPinApi } from '../../lib/services/auth.service';
import BackButton from '../vault/components/BackButton';

const EnterPin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    const emailParam = params.get('email');
    setRedirectUrl(redirect);
    setEmail(emailParam || '');
    chrome.runtime.sendMessage({
      action: 'LOG',
      message: `[EnterPin] Redirect URL: ${redirect}, Email: ${emailParam}`,
    });
    // Focus ô đầu tiên khi component mount
    inputRefs.current[0]?.focus();
  }, [location]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every((digit) => digit !== '') && index === 5) {
      handleVerifyPin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setPin(pastedData.split(''));
      handleVerifyPin(pastedData);
    }
  };

  const handleVerifyPin = async (pinCode: string) => {
    try {
      setError(null);
      if (!email) {
        setError('Không tìm thấy email. Vui lòng thử lại.');
        return;
      }
      await verifyPinApi({ code: pinCode, email });
      if (redirectUrl) {
        chrome.tabs.update({ url: redirectUrl });
      } else {
        navigate('/sign-in');
      }
    } catch (error: any) {
      console.error('Lỗi khi xác nhận PIN:', error);
      setError(error.response?.data?.message || 'Mã PIN không hợp lệ. Vui lòng thử lại.');
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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

        <h2 className="text-center text-lg font-semibold text-gray-800 mb-4">Nhập mã PIN</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Vui lòng nhập mã PIN 6 số được gửi đến email của bạn.
        </p>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <div className="flex justify-between mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-10 h-10 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <button
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded disabled:opacity-50"
          disabled={pin.some((digit) => digit === '') || !email}
          onClick={() => handleVerifyPin(pin.join(''))}
        >
          Xác nhận
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

export default EnterPin;
