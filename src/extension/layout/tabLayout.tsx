import React from 'react';
import { Outlet } from 'react-router-dom';

const TabLayout = () => {
  return (
    <div className="app-layout flex flex-col h-screen">
      <div className="content flex-grow">
        <Outlet />
      </div>
    </div>
  );
};
export default TabLayout;
