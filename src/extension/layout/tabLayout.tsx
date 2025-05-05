import React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import TabBar from "../layout/component/TabBar";

const TabLayout = () => {
  const location = useLocation();

  const activePage = 'vault';
  
  return (
    <div className="app-layout flex flex-col h-screen">
      <div className="content flex-grow">
        <Outlet />
      </div>
      <TabBar activePage={activePage}/>
    </div>
  );
};
export default TabLayout;
