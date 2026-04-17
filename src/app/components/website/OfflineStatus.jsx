"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineStatus() {
  const [status, setStatus] = useState("idle"); // idle, offline, back-online

  useEffect(() => {
    const handleOnline = () => {
      setStatus("back-online");
      // Give the user a moment to see the 'Back Online' message before reloading
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };
    const handleOffline = () => setStatus("offline");

    // Initial check
    if (!navigator.onLine) setStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (status === "idle") return null;

  const isBackOnline = status === "back-online";

  return (
    <div className="fixed top-20 md:top-24 left-4 right-4 md:left-auto md:right-6 z-[200] flex justify-center md:justify-end animate-in slide-in-from-top-5 duration-300">
      <div
        className={`flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full md:rounded-2xl shadow-2xl border ring-4 transition-colors duration-500 w-auto max-w-[280px] ${
          isBackOnline
            ? "bg-emerald-600 text-white border-emerald-500/20 ring-emerald-600/10"
            : "bg-red-600 text-white border-red-500/20 ring-red-600/10"
        }`}
      >
        <div className="relative shrink-0">
          {isBackOnline ? (
            <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
              <span className="block w-2 w-2 md:w-2.5 md:h-2.5 bg-white rounded-full animate-bounce" />
            </div>
          ) : (
            <WifiOff className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </div>
        <p className="text-[10px] md:text-body-sm font-semibold uppercase whitespace-nowrap">
          <span className="md:hidden">
            {isBackOnline ? "Back Online!" : "Offline"}
          </span>
          <span className="hidden md:inline">
            {isBackOnline ? "Back Online!" : "You are currently offline"}
          </span>
        </p>
      </div>
    </div>
  );
}
