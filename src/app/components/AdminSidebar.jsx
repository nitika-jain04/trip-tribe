"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Logs,
} from "lucide-react";
import { GoPeople } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { GrLocation } from "react-icons/gr";
import { usePathname } from "next/navigation";
import { BiComment } from "react-icons/bi";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useToast } from "../hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function AdminSidebar({
  collapsed,
  toggle,
  isMobile,
  sidebarOpen,
  setSidebarOpen,
}) {
  const [userProfile, setUserProfile] = useState({ name: "", email: "" });
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("rememberedEmail");
    Cookies.remove("rememberMe");
    Cookies.remove("user");

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
      variant: "success",
    });

    router.push("/");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;

        const res = await fetch(`${BASE_URL}/api/${API_VERSION}/auth/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        // if (!res.ok) throw new Error("Unauthorized");
        if (!res.ok) {
          toast({
            title: "Error",
            description: "Unauthorised",
            variant: "destructive",
          });
        }

        const data = await res.json();
        if (data.success) setUserProfile(data.result);
      } catch (err) {
        console.error("Profile fetch failed:", err);
      }
    };
    fetchUserProfile();
  }, []);

  const sidebarCollapsed = isMobile ? false : collapsed;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-linear-to-b from-slate-900 via-slate-900 to-slate-800 text-white
        shadow-2xl shadow-black/20 border-r border-slate-700/50
        transition-all duration-300 ease-in-out z-50
        ${
          isMobile
            ? sidebarOpen
              ? "w-64 translate-x-0"
              : "w-64 -translate-x-full"
            : sidebarCollapsed
              ? "w-16 translate-x-0"
              : "w-64 translate-x-0"
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src="/triptribe-logo-final.png"
            alt=""
            className={`h-12 w-12 rounded-md ${sidebarCollapsed ? "hidden" : "visible"}`}
          />
          {/* </div> */}

          <div
            className={`transition-all duration-300 overflow-hidden ${
              sidebarCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-40"
            }`}
          >
            <p className="text-base font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent whitespace-nowrap">
              TripTribe
            </p>
            <p className="text-xs text-gray-400 font-medium whitespace-nowrap">
              Admin Portal
            </p>
          </div>
        </div>

        <button
          onClick={toggle}
          className="hover:bg-white/10 p-2 rounded-lg border border-white/10 
  transition-all duration-200 hover:scale-105"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={18} className="text-gray-400" />
          ) : (
            <ChevronLeft size={18} className="text-gray-400" />
          )}
        </button>
      </div>

      <div className="border-b border-slate-700/50 mx-4 mb-6" />

      {/* Menu */}
      <nav className="flex flex-col gap-2 px-3">
        <SidebarLink
          href="/admin/dashboard"
          icon={<LayoutDashboard size={22} />}
          label="Dashboard"
          collapsed={sidebarCollapsed}
          isActive={pathname === "/admin/dashboard"}
          onClick={() => isMobile && setSidebarOpen(false)}
        />

        <SidebarLink
          href="/admin/operators"
          icon={<GoPeople size={22} />}
          label="Operators"
          collapsed={sidebarCollapsed}
          isActive={pathname.includes("/admin/operators")}
          onClick={() => isMobile && setSidebarOpen(false)}
        />
        <SidebarLink
          href="/admin/trips"
          icon={<GrLocation size={22} />}
          label="Trips"
          collapsed={sidebarCollapsed}
          isActive={pathname.includes("/admin/trips")}
          onClick={() => isMobile && setSidebarOpen(false)}
        />
        <SidebarLink
          href="/admin/enquiries"
          icon={<BiComment size={22} />}
          label="Enquiries"
          collapsed={sidebarCollapsed}
          isActive={pathname.includes("/admin/enquiries")}
          onClick={() => isMobile && setSidebarOpen(false)}
        />
        <SidebarLink
          href="/admin/audit-logs"
          icon={<Logs size={22} />}
          label="Audit Logs"
          collapsed={sidebarCollapsed}
          isActive={pathname === "/admin/audit-logs"}
          onClick={() => isMobile && setSidebarOpen(false)}
        />
        <SidebarLink
          href="/admin/settings"
          icon={<IoSettingsOutline size={22} />}
          label="Settings"
          collapsed={sidebarCollapsed}
          isActive={pathname.includes("/admin/settings")}
          onClick={() => isMobile && setSidebarOpen(false)}
        />

        <Button
          onClick={handleLogout}
          className="mt-auto flex gap-2 px-3 py-3"
          title="Logout"
        >
          <span>
            <LogOut />
          </span>
          {!sidebarCollapsed && <span>Logout</span>}
        </Button>
      </nav>

      {!sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-teal-400 to-teal-600 flex items-center justify-center text-sm font-semibold text-black">
              {userProfile.name?.charAt(0) || "A"}
            </div>

            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {userProfile.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userProfile.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function SidebarLink({ href, icon, label, collapsed, isActive, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl min-h-13
      transition-colors duration-200 relative group
      ${
        isActive
          ? "bg-linear-to-r from-teal-500/20 to-teal-500/5 text-teal-400"
          : "text-gray-400 hover:bg-slate-800/50 hover:text-gray-300"
      }
      ${collapsed ? "justify-center" : ""}`}
    >
      {/* Icon */}
      <span
        className={`flex items-center justify-center shrink-0 ${
          isActive ? "text-teal-400" : "text-gray-400 group-hover:text-gray-300"
        }`}
      >
        {icon}
      </span>

      {/* Label */}
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out
        ${collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100 ml-1"}
        ${isActive ? "text-teal-400 font-medium" : ""}`}
        title={label}
      >
        {label}
      </span>
    </Link>
  );
}
