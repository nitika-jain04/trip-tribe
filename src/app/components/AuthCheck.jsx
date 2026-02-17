"use client";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthCheck() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const { exp } = jwtDecode(token);
      if (exp * 1000 < Date.now()) {
        localStorage.clear();
        router.replace("/");
      }
    } catch {
      localStorage.clear();
      router.replace("/");
    }
  });

  return null;
}
