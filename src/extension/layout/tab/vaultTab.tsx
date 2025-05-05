import React from "react";
import { Outlet } from "react-router-dom";

const VaultTab = () => {
    return (
        <div>
            <Outlet />
        </div>
    )
};

export default VaultTab;