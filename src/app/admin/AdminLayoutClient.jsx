"use client";

import AdminSidebar from "../components/AdminSidebar";
import { useState, useEffect } from "react";
import { ToastProvider, ToastViewport } from "../components/ui/toast";

export default function AdminLayoutClient({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // ✅ FORCE COLLAPSED ON MOBILE
      if (mobile) {
        setCollapsed(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMounted) return null;

  return (
    <ToastProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar
          collapsed={collapsed}
          toggle={() => {
            // optional: prevent expanding on mobile
            if (!isMobile) {
              setCollapsed(!collapsed);
            }
          }}
        />

        <div
          className={`flex-1 transition-all duration-300 ${
            collapsed ? "ml-16" : "ml-64"
          }`}
        >
          {children}
        </div>
      </div>

      <ToastViewport />
    </ToastProvider>
  );
}
