"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MdOutlineDashboard } from "react-icons/md";
import { GoPeople } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { GrLocation } from "react-icons/gr";
import { LuMountain } from "react-icons/lu";
import { usePathname } from "next/navigation";
import { BiComment } from "react-icons/bi";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function AdminSidebar({ collapsed, toggle }) {
  const [userProfile, setUserProfile] = useState({ name: "", email: "" });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const pathname = usePathname();

  // Detect small screens
  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth < 768;
      setIsSmallScreen(small);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;

        const res = await fetch(`${BASE_URL}/api/${API_VERSION}/auth/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (data.success) setUserProfile(data.result);
      } catch (err) {
        console.error("Profile fetch failed:", err);
      }
    };
    fetchUserProfile();
  }, []);

  // Determine sidebar width: collapse on small screens automatically
  const sidebarCollapsed = isSmallScreen ? true : collapsed;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-linear-to-b from-slate-900 via-slate-900 to-slate-800 text-white
        shadow-2xl shadow-black/20 border-r border-slate-700/50
        transition-all duration-300 ease-in-out z-50
        ${sidebarCollapsed ? "w-28" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-linear-to-br from-teal-400 to-teal-500 text-slate-900 p-2.5 rounded-xl shadow-lg shadow-teal-500/20 shrink-0">
            <LuMountain size={20} />
          </div>

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
          className="hover:bg-slate-700 p-1 rounded-lg border border-slate-700 transition-colors duration-200 shrink-0"
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
      <nav className="flex flex-col gap-1.5 px-3">
        <SidebarLink
          href="/admin/dashboard"
          icon={<MdOutlineDashboard size={22} />}
          label="Dashboard"
          collapsed={sidebarCollapsed}
          isActive={pathname === "/admin/dashboard"}
        />
        <SidebarLink
          href="/admin/operators"
          icon={<GoPeople size={22} />}
          label="Operators"
          collapsed={sidebarCollapsed}
          isActive={pathname === "/admin/operators"}
        />
        <SidebarLink
          href="/admin/trips"
          icon={<GrLocation size={22} />}
          label="Trips"
          collapsed={sidebarCollapsed}
          isActive={pathname === "/admin/trips"}
        />
        <SidebarLink
          href="/admin/enquiries"
          icon={<BiComment size={22} />}
          label="Enquiries"
          collapsed={sidebarCollapsed}
          isActive={pathname === "/admin/enquiries"}
        />
        <SidebarLink
          href="/admin/settings"
          icon={<IoSettingsOutline size={22} />}
          label="Settings"
          collapsed={sidebarCollapsed}
          isActive={pathname === "/admin/settings"}
        />
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200">
                {userProfile.name}
              </p>
              <p className="text-xs text-gray-500">{userProfile.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function SidebarLink({ href, icon, label, collapsed, isActive }) {
  return (
    <Link
      href={href}
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
        title={label} // show full text on hover
      >
        {label}
      </span>
    </Link>
  );
}
