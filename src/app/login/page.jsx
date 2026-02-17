"use client";

import { EyeClosed, EyeClosedIcon, EyeIcon, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function TestLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const BACKEND_URL =
    "https://trip-tribe-backend.onrender.com/api/v1/auth/login";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      // ❌ Backend error handling
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Incorrect email / password");
      }

      setEmail("");
      setPassword("");

      const { token, user } = data.result;

      // In handleLogin, after successful login:
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      setEmail("");
      setPassword("");
      alert("Login failed");
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user previously chose "Remember me"
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberMeFlag = localStorage.getItem("rememberMe") === "true";

    if (rememberMeFlag && rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

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
      <div className="relative flex flex-col items-center gap-10 py-5 my-auto">
        <div className="max-w-xl text-white px-10">
          <p className="text-2xl lg:text-3xl text-center">
            THE GOAL OF LIFE IS LIVING IN AGREEMENT WITH NATURE.
          </p>
          <div className="w-full border-b-4 border-white mt-4" />
        </div>

        {/* Login Card */}
        <div className="w-75 md:w-90 lg:w-105 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 px-5 py-10 md:px-12 md:py-20 text-white shadow-xl">
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
                type={email}
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

        {/* Right Quote */}
        {/* <div className="max-w-xl text-white hidden lg:block">
          <p className="text-6xl text-center">
            THE GOAL OF LIFE IS LIVING IN AGREEMENT WITH NATURE.
          </p>
          <div className="w-full border-b-4 border-white mt-4" />
        </div> */}
      </div>
    </div>
  );
}

export default TestLogin;
