import React from 'react';

const BackButton = ({handlePress, containerStyles}) => {
  return (
    <button
      onClick={handlePress}
      className={`${containerStyles} border-2 border-box p-2 rounded-full bg-white`}>
      <img
        src="./icons/left.png" 
        alt="back icon"
        className="w-4 h-4"
      />
    </button>
  );
};

export default BackButton;
