"use client";

import AdminSidebar from "../components/AdminSidebar";
import { useState, useEffect } from "react";
import { ToastProvider, ToastViewport } from "../components/ui/toast";
import AdminGuard from "../components/AdminGuard";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function AdminLayoutClient({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMounted) return null;

  return (
    <AdminGuard>
      <ToastProvider>
        <div className="flex h-screen w-full relative">
          {/* Mobile Overlay */}
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <AdminSidebar
            collapsed={collapsed}
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            toggle={() => {
              if (!isMobile) {
                setCollapsed(!collapsed);
              }
            }}
          />

          <div
            className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
              isMobile ? "ml-0" : collapsed ? "ml-16" : "ml-64"
            }`}
          >
            {/* Mobile Header */}
            {isMobile && (
              <header className="h-16 border-b border-gray-200 bg-white flex items-center px-4 shrink-0 justify-between">
                <Link href="/admin/dashboard" prefetch={false}>
                  <div className="flex items-center gap-2">
                    <img
                      src="/triptribe-logo-final.webp"
                      alt="TripTribe"
                      className="h-8 w-8 rounded-md"
                    />
                    <span className="font-bold text-lg text-slate-800">
                      TripTribe
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 -mr-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  aria-label="Open Menu"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </button>
              </header>
            )}

            <main className="flex-1 overflow-y-auto w-full">{children}</main>
          </div>
        </div>

        <ToastViewport />
      </ToastProvider>
    </AdminGuard>
  );
}
