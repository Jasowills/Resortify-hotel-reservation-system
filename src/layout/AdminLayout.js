import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminRoutes from "./AdminRoutes";

function AdminLayout() {
  return (
    <div className="ml-flex">
      <AdminSidebar />
      <AdminRoutes />
    </div>
  );
}

export default AdminLayout;
