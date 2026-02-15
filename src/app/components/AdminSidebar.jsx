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
      className={`fixed left-0 top-0 h-screen bg-linear-to-b from-slate-900 via-slate-900 to-slate-800 text-white
      shadow-2xl shadow-black/20 border-r border-slate-700/50
      transition-all duration-300 ease-in-out z-50
      ${collapsed ? "w-28 transition-none duration-500" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-linear-to-br from-teal-400 to-teal-500 text-slate-900 p-2.5 rounded-xl shadow-lg shadow-teal-500/20 shrink-0">
            <LuMountain size={20} />
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-40"
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
          {collapsed ? (
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

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-teal-400 to-teal-500 flex items-center justify-center text-slate-900 font-bold text-sm">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200">Super Admin</p>
              <p className="text-xs text-gray-500">admin@triptribe.in</p>
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
      >
        {label}
      </span>

      {/* Tooltip */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-gray-200 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap border border-slate-700 shadow-lg z-50">
          {label}
        </div>
      )}
    </Link>
  );
}
