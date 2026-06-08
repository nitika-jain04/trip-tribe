"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Input from "../components/ui/input";
import { useToast } from "../hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description: data?.message || data?.error?.message || "Failed to send reset link",
          variant: "destructive",
        });
        setError(data?.message || data?.error?.message || "Failed to send reset link");
        return;
      }

      setSuccess(true);
      toast({ title: "Success", description: "Password reset link sent to your email." });
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center">
      {/* Background */}
      <Image
        src="/loginimg.jpeg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-8 py-5 my-auto w-full max-w-lg z-10">
        {/* Card */}
        <div className="w-[90%] md:w-full rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 px-6 py-10 md:px-12 md:py-12 text-white shadow-2xl">
          <h2 className="text-3xl font-semibold text-center mb-4 tracking-tight">
            Forgot Password
          </h2>
          <p className="text-center text-white/70 text-sm mb-8">
            Enter your email address and we'll send you a link to reset your password.
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <p className="text-center text-white/90">
                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
              </p>
              <Link href="/login" className="w-full">
                <button className="w-full mt-2 bg-white/10 text-white font-semibold py-3.5 rounded-xl hover:bg-white/20 transition-all duration-300">
                  Return to Login
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-in fade-in">
              <div>
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">Email Address</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@triptribe.com"
                  className="w-full mt-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 focus:bg-white/10 text-white transition-all placeholder:text-white/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="mt-4 bg-lime-400 text-black font-semibold py-3.5 rounded-xl hover:bg-lime-500 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <Link href="/login" className="text-center mt-2 text-sm text-white/60 hover:text-white transition-colors">
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
