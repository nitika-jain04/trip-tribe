"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EyeIcon, EyeOff } from "lucide-react";
import Cookies from "js-cookie";

export default function TestLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Incorrect email / password");
      }

      const { token, user } = data.result;

      // ✅ Save cookies only for /admin routes
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        Cookies.set("token", token, {
          expires: 1, // 1 day
          path: "/",
          sameSite: "lax",
        });
        Cookies.set("user", JSON.stringify(user), {
          expires: 1,
          path: "/",
          sameSite: "strict",
        });
      }

      if (rememberMe) {
        Cookies.set("rememberedEmail", email, {
          expires: 1,
          sameSite: "strict",
          path: "/",
        });

        Cookies.set("rememberMe", "true", {
          expires: 1,
          sameSite: "strict",
          path: "/",
        });
      } else {
        Cookies.remove("rememberedEmail", { path: "/" });
        Cookies.remove("rememberMe", { path: "/" });
      }

      router.push(
        user.role === "ADMIN" || user.role === "SUPER_ADMIN"
          ? "/admin/dashboard"
          : "/",
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setPassword(""); // clear password after attempt
    }
  };

  useEffect(() => {
    const remBool = Cookies.get("rememberMe");
    const remEmail = Cookies.get("rememberedEmail");

    if (remBool) {
      setEmail(remEmail);
      setRememberMe(true);
    }
  });

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background */}
      <Image
        src="/loginimg.jpeg"
        alt="Login Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-14 py-5 my-auto">
        <div className="max-w-xl text-white px-10">
          <h1 className="text-2xl lg:text-3xl text-center font-semibold">
            THE GOAL OF LIFE IS LIVING IN AGREEMENT WITH NATURE.
          </h1>
          <div className="w-full border-b-4 border-white mt-4" />
        </div>

        {/* Login Card */}
        <div className="w-85 md:w-90 lg:w-105 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 px-5 py-16 md:px-12 md:py-20 text-white shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Login to Your Account
          </h2>

          {error && (
            <p className="mb-4 text-center text-sm font-display font-semibold text-error">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 rounded-md bg-transparent border border-white/40 px-3 py-2 focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="text-sm">Password</label>
              <div className="flex items-center gap-2 border border-white/40 rounded-md bg-transparent px-3 py-2 ">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 focus:outline-none focus:border-white"
                />
                {showPassword ? (
                  <EyeOff
                    size={18}
                    onClick={() => {
                      setShowPassword(false);
                    }}
                  />
                ) : (
                  <EyeIcon
                    size={18}
                    onClick={() => {
                      setShowPassword(true);
                    }}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm opacity-80">
              <input
                type="checkbox"
                className="accent-lime-400"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />{" "}
              <span>Remember me</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-white text-black font-semibold py-2 rounded-md hover:bg-lime-300 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>

            {/* <p className="text-center text-sm opacity-70 hover:underline cursor-pointer">
              Forgot Password?
            </p> */}
          </form>
        </div>
      </div>
    </div>
  );
}
