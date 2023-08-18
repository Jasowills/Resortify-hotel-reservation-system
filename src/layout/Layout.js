import React from "react";
import Routes from "./Routes";
import Sidebar from "../components/Sidebar";

function Layout() {
  return (
    <div className="ml-flex">
      <Sidebar />
      <Routes />
    </div>
  );
}

export default Layout;
