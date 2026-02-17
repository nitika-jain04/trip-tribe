"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      router.replace("/");
      return;
    }

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  });

  return children;
}
