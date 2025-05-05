import React from 'react';

interface MenuItemProps {
  icon: string; // icon là đường dẫn tới image
  title: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-200 rounded-md font-semibold cursor-pointer" // thêm cursor-pointer và hover:bg-gray-200
    >
      <img src={icon} alt={title} className="w-4 h-4" />
      <h5 className="text-text">{title}</h5>
    </div>
  );
};

export default MenuItem;
