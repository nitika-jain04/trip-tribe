"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading

  useEffect(() => {
    const token = Cookies.get("token");
    const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

    // Wrap navigation + state in a setTimeout to avoid sync state change warning
    setTimeout(() => {
      if (!token || !user) {
        router.replace("/"); // redirect if no token
        return;
      }

      if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        router.replace("/dashboard"); // redirect if not admin
        return;
      }

      // If we reach here, user is authorized
      setIsAuthorized(true);
    }, 0);
  }, [router]);

  // Show nothing while loading or unauthorized
  if (isAuthorized === null) return null;
  if (!isAuthorized) return null;

  return children;
}
