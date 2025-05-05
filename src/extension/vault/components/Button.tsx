import React from 'react';

interface ButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  width?: string | number;
}

const Button: React.FC<ButtonProps> = ({ label, isActive, onClick, width }) => {
  return (
    <button
      onClick={onClick}
      style={{ width }}
      className={`px-8 py-4 text-sm rounded-[25px] flex justify-center items-center transition-all ${
        isActive
          ? 'bg-button_active text-white hover:bg-blue-600'
          : 'bg-box text-gray-800 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );
};

export default Button;
