"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Input from "../components/ui/input";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`, // required
          },
          body: JSON.stringify({
            token,
            password,
            confirmPassword,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Password reset failed");
      }

      setMessage("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-96 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Reset Password
        </h2>

        {message && (
          <p className="text-green-600 text-center mb-3">{message}</p>
        )}

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <Input
            type="password"
            placeholder="New Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Confirm Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="bg-black text-white py-2 rounded-md"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
