"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { EyeIcon, EyeOff, Check, X, ShieldCheck, AlertTriangle } from "lucide-react";
import Input from "../components/ui/input";
import { useToast } from "../hooks/use-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const passwordRules = [
    { label: "Min 8 characters", test: (p) => p.length >= 8 },
    { label: "1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "1 number", test: (p) => /[0-9]/.test(p) },
    { label: "1 special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const isPasswordValid = passwordRules.every((rule) => rule.test(password));
  const isConfirmPasswordValid = confirmPassword === password && confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description: data?.message || data?.error?.message || "Failed to reset password",
          variant: "destructive",
        });
        setError(data?.message || data?.error?.message || "Failed to reset password");
        return;
      }

      setSuccess(true);
      toast({ title: "Success", description: "Password reset successfully!" });
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // If no token is present in the URL, show an invalid link screen
  if (!token) {
    return (
      <div className="w-[90%] md:w-full rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 px-6 py-10 md:px-12 md:py-12 text-white shadow-2xl">
        <div className="flex flex-col items-center gap-6 animate-in fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/10 text-amber-400 mb-2">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-2xl font-semibold text-center tracking-tight">
            Invalid Reset Link
          </h2>
          <p className="text-center text-white/70 text-sm leading-relaxed">
            This password reset link is invalid or has expired.<br />
            Please request a new one from the forgot password page.
          </p>
          <div className="w-full flex flex-col gap-3 mt-2">
            <Link href="/forgot-password" className="w-full">
              <button className="w-full bg-lime-400 text-black font-semibold py-3.5 rounded-xl hover:bg-lime-500 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                Request New Link
              </button>
            </Link>
            <Link href="/login" className="w-full">
              <button className="w-full bg-white/10 text-white font-semibold py-3.5 rounded-xl hover:bg-white/20 transition-all duration-300">
                Back to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[90%] md:w-full rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 px-6 py-10 md:px-12 md:py-12 text-white shadow-2xl">
      <h2 className="text-3xl font-semibold text-center mb-2 tracking-tight">
        Reset Password
      </h2>
      <p className="text-center text-white/70 text-sm mb-8">
        Enter your new password below.
      </p>

      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <p>{error}</p>
        </div>
      )}

      {success ? (
        <div className="flex flex-col items-center gap-6 animate-in fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime-400/10 text-lime-400 mb-2">
            <ShieldCheck size={28} />
          </div>
          <p className="text-center text-white/90">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Link href="/login" className="w-full">
            <button className="w-full mt-2 bg-lime-400 text-black font-semibold py-3.5 rounded-xl hover:bg-lime-500 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:-translate-y-0.5 transition-all duration-300">
              Go to Login
            </button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-in fade-in">

          <div>
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">New Password</label>
            <div className={`flex items-center gap-2 mt-2 border rounded-xl bg-white/5 px-4 py-3 focus-within:border-lime-400 focus-within:ring-1 focus-within:ring-lime-400 focus-within:bg-white/10 transition-all hover:bg-white/10 ${
              touched.password && !isPasswordValid ? "border-red-500/60" : "border-white/10"
            }`}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!touched.password) setTouched((prev) => ({ ...prev, password: true }));
                }}
                placeholder="••••••••"
                className="w-full bg-transparent focus:outline-none text-white placeholder:text-white/30"
              />
              {showPassword ? (
                <EyeIcon
                  size={18}
                  className="cursor-pointer text-white/60 hover:text-white transition-colors"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <EyeOff
                  size={18}
                  className="cursor-pointer text-white/60 hover:text-white transition-colors"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            {(touched.password || password.length > 0) && (
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {passwordRules.map((rule) => (
                  <div key={rule.label} className="flex items-center gap-1.5">
                    {rule.test(password) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    )}
                    <span className={`text-xs transition-colors ${
                      rule.test(password) ? "text-emerald-400" : "text-white/40"
                    }`}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">Confirm Password</label>
            <div className={`flex items-center gap-2 mt-2 border rounded-xl bg-white/5 px-4 py-3 focus-within:border-lime-400 focus-within:ring-1 focus-within:ring-lime-400 focus-within:bg-white/10 transition-all hover:bg-white/10 ${
              touched.confirmPassword && !isConfirmPasswordValid ? "border-red-500/60" : "border-white/10"
            }`}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (!touched.confirmPassword) setTouched((prev) => ({ ...prev, confirmPassword: true }));
                }}
                placeholder="••••••••"
                className="w-full bg-transparent focus:outline-none text-white placeholder:text-white/30"
              />
              {showConfirmPassword ? (
                <EyeIcon
                  size={18}
                  className="cursor-pointer text-white/60 hover:text-white transition-colors"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <EyeOff
                  size={18}
                  className="cursor-pointer text-white/60 hover:text-white transition-colors"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
            </div>
            {touched.confirmPassword && confirmPassword.length > 0 && !isConfirmPasswordValid && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">Passwords do not match</p>
            )}
            {touched.confirmPassword && isConfirmPasswordValid && (
              <p className="text-xs text-emerald-400 mt-1.5 ml-1 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Passwords match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid || !isConfirmPasswordValid}
            className="mt-4 bg-lime-400 text-black font-semibold py-3.5 rounded-xl hover:bg-lime-500 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p className="text-center text-sm text-white/60 mt-2">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-lime-400 hover:text-lime-300 hover:underline transition-colors"
            >
              Login
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center">
      {/* Background */}
      <Image
        src="/travel backdrop.avif"
        alt="Reset Password Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-8 py-5 my-auto w-full max-w-lg z-10">
        <div className="text-center px-10">
          <h1 className="text-xs md:text-sm tracking-[0.3em] font-medium text-white/80 uppercase">
            Find Your Tribe, travel together
          </h1>
        </div>

        <Suspense fallback={
          <div className="w-[90%] md:w-full rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 px-6 py-16 text-white shadow-2xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60 text-sm">Loading...</p>
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
