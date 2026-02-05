"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MdOutlineDashboard } from "react-icons/md";
import { GoPeople } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { GrLocation } from "react-icons/gr";
import { LuMountain } from "react-icons/lu";
import { usePathname } from "next/navigation";

export default function AdminSidebar({ collapsed, toggle }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 text-white
      transition-all duration-300 ease-in-out
      ${collapsed ? "w-24" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-teal-400 text-black p-2 rounded-lg shrink-0">
            <LuMountain size={20} />
          </div>

          {/* Text fades like YouTube */}
          <div
            className={`transition-all duration-300 ${
              collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            }`}
          >
            <p className="text-sm font-semibold">TripTribe</p>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>

        {/* Toggle */}
        <button onClick={toggle} className="bg-gray-800 p-1 rounded-md">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="border-b border-gray-700 mb-4" />

      {/* Menu */}
      <nav className="flex flex-col gap-1 px-2">
        <SidebarLink
          href="/admin/dashboard"
          icon={<MdOutlineDashboard size={22} />}
          label="Dashboard"
          collapsed={collapsed}
          isActive={pathname === "/admin/dashboard"}
        />
        <SidebarLink
          href="/admin/operators"
          icon={<GoPeople size={22} />}
          label="Operators"
          collapsed={collapsed}
          isActive={pathname === "/admin/operators"}
        />
        <SidebarLink
          href="/admin/trips"
          icon={<GrLocation size={22} />}
          label="Trips"
          collapsed={collapsed}
          isActive={pathname === "/admin/trips"}
        />
        <SidebarLink
          href="/admin/settings"
          icon={<IoSettingsOutline size={22} />}
          label="Settings"
          collapsed={collapsed}
          isActive={pathname === "/admin/settings"}
        />
      </nav>
    </aside>
  );
}

function SidebarLink({ href, icon, label, collapsed, isActive }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg
      transition-all duration-300
      ${
        isActive
          ? "bg-slate-800 text-admin-aqua"
          : "text-gray-400 hover:bg-slate-800 hover:text-gray-300"
      }
      ${collapsed ? "justify-center" : ""}`}
    >
      <span className={isActive ? "text-admin-aqua" : ""}>{icon}</span>

      {/* Label hides like YouTube */}
      <span
        className={`transition-all duration-300 ${
          collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
        } ${isActive ? "text-admin-aqua font-medium" : ""}`}
      >
        {label}
      </span>
    </Link>
  );
}
