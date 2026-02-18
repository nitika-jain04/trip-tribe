"use client";

import AdminSidebar from "../components/AdminSidebar";
import { useState, useEffect } from "react";
import { ToastProvider, ToastViewport } from "../components/ui/toast";

export default function AdminLayoutClient({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Use useEffect instead of useState
  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  // if (!isMounted) {
  //   return (
  //     <div className="flex h-screen w-full items-center justify-center">
  //       <div className="text-center">
  //         <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
  //         <p className="text-gray-600">Verifying authentication...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <ToastProvider>
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

      {/* ToastViewport renders the actual toasts */}
      <ToastViewport />
    </ToastProvider>
  );
}
