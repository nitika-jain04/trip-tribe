"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Mountain,
  LayoutDashboard,
  Users,
  MapPin,
  MessageSquare,
  Settings,
  LogOut,
  User,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

// ✅ Use env variables in production
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Operators", href: "/admin/operators", icon: Users },
  { name: "Trips", href: "/admin/trips", icon: MapPin },
  { name: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch profile from your backend API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/${API_VERSION}/auth/profile`,
          { headers: {
              Authorization: `Bearer ${token}`,
            },}
        );

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();

        if (data.success) {
          setUser(data.result);
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const isActive = (href) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) return null; // or skeleton loader

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="flex h-16 items-center px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 mr-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Mountain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">
            TripTribe Admin
          </span>
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {user?.name}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role?.name}
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}