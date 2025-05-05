// Popup.tsx
import React from 'react';
import Button from './Button';
import Input from './Input';

interface PopupProps {
  inputs: { id: string; label: string; placeholder: string; icon: string }[];
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ inputs, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-20">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Render danh sách Input */}
        {inputs.map((input, index) => (
          <div key={index} className="mt-4">
            <Input
              id={input.id}
              label={input.label}
              placeholder={input.placeholder}
              icon={input.icon}
              onChangeText={(text) => console.log(text)}
            />
          </div>
        ))}

        <div className="mt-4 flex justify-between">
          <Button label="Close" onClick={onClose} isActive={false} />
          <Button label="Add" onClick={onClose} isActive={true} />
        </div>
      </div>
    </div>
  );
};

export default Popup;
