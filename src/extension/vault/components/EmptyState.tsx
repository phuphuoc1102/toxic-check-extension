import React from "react";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <img
        src="./icons/empty.png"
        alt="No items"
        className="w-32 h-32 mb-4"
      />
      <h6 className="text-lg text-gray-600">No items found</h6>
    </div>
  );
};

export default EmptyState;
