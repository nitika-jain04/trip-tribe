"use client";

import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { SearchIcon } from "lucide-react";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full">
      <AdminSidebar
        collapsed={collapsed}
        toggle={() => setCollapsed(!collapsed)}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-24" : "ml-64"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
