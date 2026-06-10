"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { EyeIcon, EyeOff } from "lucide-react";
import Cookies from "js-cookie";
import Input from "../components/ui/input";
import PhoneInput from "../components/ui/PhoneInput";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp";
import { useToast } from "../hooks/use-toast";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const [loginMethod, setLoginMethod] = useState("PHONE"); // "PHONE" or "EMAIL"
  const [step, setStep] = useState("PHONE_INPUT"); // "PHONE_INPUT" or "OTP_INPUT" for phone method

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    const remBool = Cookies.get("rememberMe");
    const remEmail = Cookies.get("rememberedEmail");
    if (remBool) {
      setEmail(remEmail);
      setRememberMe(true);
      setLoginMethod("EMAIL");
    }
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/customer/auth/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: phoneNumber }),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description:
            data?.message || data?.error?.message || "Failed to send OTP",
          variant: "destructive",
        });
        setError(data?.message || data?.error?.message || "Failed to send OTP");
        return;
      }

      toast({
        title: "Success",
        description: "Verification code sent to your phone.",
      });
      setStep("OTP_INPUT");
      setResendTimer(30);
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      console.log("Verifying OTP for phone number:", phoneNumber);
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/customer/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: phoneNumber, otp }),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description: data?.message || data?.error?.message || "Invalid OTP",
          variant: "destructive",
        });
        setError(data?.message || data?.error?.message || "Invalid OTP");
        setOtp("");
        return;
      }

      const token = data.result?.token || data.result?.csrfToken;
      const user = data.result?.user;

      if (!token || !user) {
        toast({
          title: "Error",
          description: "Invalid server response",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      Cookies.set("token", token, { expires: 1, path: "/", sameSite: "lax" });
      Cookies.set("user", JSON.stringify(user), {
        expires: 1,
        path: "/",
        sameSite: "strict",
      });

      router.push("/");
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      console.log("Resending OTP to phone number:", phoneNumber);
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/customer/auth/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: phoneNumber }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description: data?.message || "Failed to resend OTP",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Verification code sent." });
        setResendTimer(30);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description:
            data?.message ||
            data?.error?.message ||
            "Incorrect email / password",
          variant: "destructive",
        });
        setPassword("");
        return;
      }

      const token = data.result?.token || data.result?.csrfToken;
      const user = data.result?.user;

      if (!token || !user) {
        toast({
          title: "Error",
          description: "Invalid server response",
          variant: "destructive",
        });
        return;
      }

      const roleName = user.role?.name || user.role;

      if (
        roleName === "ADMIN" ||
        roleName === "SUPER_ADMIN" ||
        roleName === "CUSTOMER"
      ) {
        Cookies.set("token", token, { expires: 1, path: "/", sameSite: "lax" });
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
        roleName === "ADMIN" || roleName === "SUPER_ADMIN"
          ? "/admin/dashboard"
          : "/",
      );
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center">
      {/* Background */}
      <Image
        // src="/loginimg.jpeg"
        src="/travel backdrop.avif"
        alt="Login Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-8 py-5 my-auto w-full max-w-lg z-10">
        <div className="text-center px-10">
          <h1 className="text-xs md:text-sm tracking-[0.3em] font-medium text-white/80 uppercase">
            Welcome Back
          </h1>
        </div>

        {/* Card */}
        <div className="w-[90%] md:w-full rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 px-6 py-10 md:px-12 md:py-12 text-white shadow-2xl">
          <h2 className="text-3xl font-semibold text-center mb-8 tracking-tight">
            Login
          </h2>

          {error && (
            <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {step === "PHONE_INPUT" && (
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === "PHONE" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                onClick={() => setLoginMethod("PHONE")}
              >
                Phone
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === "EMAIL" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                onClick={() => setLoginMethod("EMAIL")}
              >
                Email
              </button>
            </div>
          )}

          {loginMethod === "PHONE" && step === "PHONE_INPUT" && (
            <form
              onSubmit={handleSendOtp}
              className="flex flex-col gap-5 animate-in fade-in"
            >
              <div>
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">
                  Phone Number
                </label>
                <div className="mt-2 h-[52px] auth-phone-container">
                  <PhoneInput
                    value={phoneNumber}
                    onChange={(val) => setPhoneNumber(val)}
                    className="w-full text-white"
                    inputClassName="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-lime-400 focus-visible:border-lime-400 transition-all hover:bg-white/10"
                    countrySelectorStyleProps={{
                      buttonClassName:
                        "bg-white/5 border-white/10 text-white focus-within:border-lime-400 transition-all hover:bg-white/10",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length < 5}
                className="mt-6 bg-lime-400 text-black font-semibold py-3.5 rounded-xl hover:bg-lime-500 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? "Sending OTP..." : "Continue"}
              </button>

              <p className="text-center text-sm text-white/60 mt-4">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-lime-400 hover:text-lime-300 hover:underline transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          )}

          {loginMethod === "PHONE" && step === "OTP_INPUT" && (
            <form
              onSubmit={handleVerifyOtp}
              className="flex flex-col gap-8 items-center animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime-400/10 text-lime-400 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <p className="text-sm text-white/70">
                  We've sent an SMS with a 6-digit code to <br />
                  <span className="font-medium text-white">{phoneNumber}</span>
                </p>
              </div>

              <div className="w-full flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup className="gap-3">
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="border border-white/10 rounded-xl bg-white/5 text-white focus:border-lime-400 focus:ring-1 focus:ring-lime-400 h-12 w-12 text-lg !border-l transition-all"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="w-full space-y-4 mt-2">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-lime-400 text-black font-semibold py-3.5 rounded-xl hover:bg-lime-500 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>

                <div className="flex justify-between w-full">
                  <button
                    type="button"
                    onClick={() => setStep("PHONE_INPUT")}
                    disabled={loading}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Change Number
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    className="text-sm text-lime-400 hover:text-lime-300 transition-colors disabled:text-white/30"
                  >
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : "Resend Code"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {loginMethod === "EMAIL" && step === "PHONE_INPUT" && (
            <form
              onSubmit={handleEmailLogin}
              className="flex flex-col gap-5 animate-in fade-in"
            >
              <div>
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // placeholder="Enter your email"
                  className="w-full mt-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 focus:bg-white/10 text-white transition-all placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="flex items-center gap-2 mt-2 border border-white/10 rounded-xl bg-white/5 px-4 py-3 focus-within:border-lime-400 focus-within:ring-1 focus-within:ring-lime-400 focus-within:bg-white/10 transition-all hover:bg-white/10">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center gap-2 opacity-80">
                  <input
                    type="checkbox"
                    className="accent-lime-400 w-4 h-4 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-white/80">Remember me</span>
                </div>

                <Link
                  href="/forgot-password"
                  className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 bg-lime-400 text-black font-semibold py-3.5 rounded-xl hover:bg-lime-500 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-sm text-white/60 mt-4">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-lime-400 hover:text-lime-300 hover:underline transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
