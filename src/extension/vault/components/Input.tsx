import React, {useState, useEffect, useCallback} from "react";

interface InputProps {
  id?: string;
  value?: string;
  style?: React.CSSProperties;
  label?: string;
  icon?: string; // Path đến icon
  required?: boolean;
  keyboardType?: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  canCopy?: boolean;
  canLaunch?: boolean;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChangeText?: (text: string) => void;
  onPressCopyIcon?: () => void;
  onPressLaunchIcon?: () => void;
  secureTextEntry?: boolean; // Thêm prop secureTextEntry
}

const Input: React.FC<InputProps> = ({
  id = "Input",
  value = "",
  style,
  label,
  icon,
  keyboardType,
  disabled,
  placeholder = "",
  maxLength = 27,
  canCopy,
  canLaunch,
  onFocus,
  onBlur,
  onChangeText,
  onPressCopyIcon,
  onPressLaunchIcon,
  secureTextEntry = false, // Đặt mặc định là false
}) => {
  const [isFocused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showPassword, setShowPassword] = useState(false); // Thêm state để theo dõi hiển thị mật khẩu

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>, focus: boolean) => {
      setFocused(focus);
      focus && onFocus?.(event);
      !focus && onBlur?.(event);
    },
    [onFocus, onBlur],
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev); // Chuyển trạng thái mật khẩu
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setInputValue(text);
    onChangeText?.(text); // Thực thi khi thay đổi text
  };

  return (
    <div style={{...style, marginBottom: "1rem"}}>
      {label && <h5 className="font-semibold text-text mb-2">{label}</h5>}
      <div
        className={`bg-box flex items-center px-4 py-3 rounded-[20px] transition-all 
        ${disabled ? "bg-gray-200" : ""}`}
        style={{minHeight: "40px"}}>
        {icon && (
          <img src={icon} alt="icon" className="w-5 h-5 mr-3 object-contain" />
        )}
        <input
          id={id}
          type={secureTextEntry && !showPassword ? "password" : "text"}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          onFocus={event => handleFocus(event, true)}
          onBlur={event => handleFocus(event, false)}
          onChange={handleTextChange}
          className="flex-1 bg-transparent outline-none text-sm text-text border-none"
        />

        {canCopy && (
          <button
            type="button"
            onClick={onPressCopyIcon}
            className="ml-2 text-gray-600 hover:text-blue-500">
            <img src="./icons/copy.png" alt="Copy" className="w-4 h-4" />
          </button>
        )}
        {canLaunch && (
          <button
            type="button"
            onClick={onPressLaunchIcon}
            className="ml-2 text-gray-600 hover:text-blue-500">
            <img src="./icons/launch.png" alt="Launch" className="w-4 h-4" />
          </button>
        )}
        {secureTextEntry && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="ml-2 text-gray-600 hover:text-blue-500">
            <img
              src={
                showPassword
                  ? "./icons/hide-password.png"
                  : "./icons/show-password.png"
              }
              alt="Toggle Password Visibility"
              className="w-4 h-4"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
