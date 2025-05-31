import React, { useCallback, useEffect, useState } from 'react';

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
  secureTextEntry?: boolean; // Prop để xác định input là password
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChangeText?: (text: string) => void;
}

const Input: React.FC<InputProps> = ({
  id = 'Input',
  value = '',
  style,
  label,
  icon,
  disabled,
  placeholder = '',
  maxLength = 27,
  secureTextEntry = false,
  onFocus,
  onBlur,
  onChangeText,
}) => {
  const [actualValue, setActualValue] = useState(value); // Actual input value
  const [displayValue, setDisplayValue] = useState(value); // Value shown in input (masked or actual)
  const [showPassword, setShowPassword] = useState(false); // State để toggle show/hide password

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>, focus: boolean) => {
      if (focus && onFocus) {
        onFocus(event);
      } else if (!focus && onBlur) {
        onBlur(event);
      }
    },
    [onFocus, onBlur],
  );

  useEffect(() => {
    setActualValue(value);
    // Update display value based on showPassword and secureTextEntry
    setDisplayValue(secureTextEntry && !showPassword ? '●'.repeat(value.length) : value);
  }, [value, secureTextEntry, showPassword]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    // If secureTextEntry and not showing password, extract the actual input by comparing lengths
    if (secureTextEntry && !showPassword) {
      // Since the display value is asterisks, we assume the user typed the last character
      // This is a simplification; in a real app, you might need more robust logic
      const newChar = text.length > actualValue.length ? text.slice(-1) : '';
      const newActualValue =
        text.length < actualValue.length
          ? actualValue.slice(0, text.length) // Handle deletion
          : actualValue + newChar; // Handle addition
      setActualValue(newActualValue);
      setDisplayValue('●'.repeat(text.length));
      onChangeText?.(newActualValue);
    } else {
      setActualValue(text);
      setDisplayValue(text);
      onChangeText?.(text);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => {
      const newShowPassword = !prev;
      // Update display value when toggling
      setDisplayValue(
        secureTextEntry && !newShowPassword ? '●'.repeat(actualValue.length) : actualValue,
      );
      return newShowPassword;
    });
  };
  return (
    <div style={{ ...style, marginBottom: '1rem' }}>
      {label && <h5 className="font-semibold text-text mb-2">{label}</h5>}
      <div
        className={`bg-box flex items-center px-4 py-3 rounded-[8px] transition-all 
        ${disabled ? 'bg-gray-200' : ''}`}
        style={{ minHeight: '40px' }}
      >
        {icon && <img src={icon} alt="icon" className="w-5 h-5 mr-3 object-contain" />}
        <input
          id={id}
          type={'text'}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          onFocus={(event) => handleFocus(event, true)}
          onBlur={(event) => handleFocus(event, false)}
          onChange={handleTextChange}
          className="flex-1 bg-transparent outline-none text-sm text-text border-none"
        />
        {secureTextEntry && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className="ml-3 focus:outline-none"
            style={{ width: '20px', height: '20px' }} // Kích thước cố định cho button
          >
            <img
              src={showPassword ? './icons/hide-password.png' : './icons/show-password.png'}
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
