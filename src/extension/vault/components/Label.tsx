import React from 'react';

interface LabelProps {
  text: string;
  bgColor: string;
}

const Label: React.FC<LabelProps> = ({text, bgColor}) => {
  return (
    <div
      className={`flex h-full justify-center items-center p-4 rounded-[14px] ${bgColor}`}
      style={{minWidth: '80px'}}>
      <p className="font-semibold text-center text-text text-xs leading-none m-0">
        {text}
      </p>
    </div>
  );
};

export default Label;
