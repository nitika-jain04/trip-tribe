"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { EyeIcon, EyeOff, Check, X } from "lucide-react";
import Input from "../components/ui/input";
import PhoneInput from "../components/ui/PhoneInput";
import { useToast } from "../hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp";

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const [step, setStep] = useState("REGISTER"); // REGISTER, EMAIL_VERIFICATION, PHONE_VERIFICATION
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Track which fields have been interacted with for real-time validation
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false,
  });

  // Password validation rules
  const passwordRules = [
    { label: "Min 8 characters", test: (p) => p.length >= 8 },
    { label: "1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "1 number", test: (p) => /[0-9]/.test(p) },
    { label: "1 special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const isPasswordValid = passwordRules.every((rule) => rule.test(password));
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isNameValid = name.trim().length >= 2;
  const isPhoneValid = phoneNumber.length >= 7;
  const isConfirmPasswordValid =
    confirmPassword === password && confirmPassword.length > 0;
  const isFormValid =
    isNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    agreedToTerms;

  const [otp, setOtp] = useState("");

  // Timers for resend OTP
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const endpoint = `${BASE_URL}/api/${API_VERSION}/customer/auth/register`;
      console.log("Register API endpoint:", endpoint);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone_number: phoneNumber,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description:
            data?.message || data?.error?.message || "Registration failed",
          variant: "destructive",
        });
        setError(
          data?.message || data?.error?.message || "Registration failed",
        );
        return;
      }

      toast({
        title: "Success",
        description: "Registered successfully! Please verify your email.",
      });
      setStep("EMAIL_VERIFICATION");
      setOtp("");
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

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/customer/auth/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description:
            data?.message ||
            data?.error?.message ||
            "Email verification failed",
          variant: "destructive",
        });
        setError(
          data?.message || data?.error?.message || "Email verification failed",
        );
        setOtp("");
        return;
      }

      toast({
        title: "Success",
        description: "Email verified! Please verify your phone number.",
      });
      setStep("PHONE_VERIFICATION");
      setOtp("");
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

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      console.log("Verifying phone number:", phoneNumber);
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/customer/auth/verify-phone`,
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
          description:
            data?.message ||
            data?.error?.message ||
            "Phone verification failed",
          variant: "destructive",
        });
        setError(
          data?.message || data?.error?.message || "Phone verification failed",
        );
        setOtp("");
        return;
      }

      toast({
        title: "Success",
        description: "Phone verified successfully! You can now log in.",
      });

      // Redirect to login
      router.push("/login");
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

  const handleResendEmail = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/customer/auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description: data?.message || "Failed to resend email verification",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Verification code sent to email.",
        });
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

  const handleResendPhone = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      console.log("Resending verification to phone number:", phoneNumber);
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/customer/auth/resend-phone-verification`,
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
          description: data?.message || "Failed to resend phone verification",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Verification code sent to phone.",
        });
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

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center">
      {/* Background */}
      <Image
        // src="/loginimg.jpeg"
        src="/travel backdrop.avif"
        alt="Register Background"
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

        {/* Card */}
        <div className="w-[90%] md:w-full rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 px-6 py-10 md:px-12 md:py-8 text-white shadow-2xl">
          <h2 className="text-3xl font-semibold text-center mb-4 tracking-tight">
            {step === "REGISTER" && "Create Account"}
            {step === "EMAIL_VERIFICATION" && "Check Your Email"}
            {step === "PHONE_VERIFICATION" && "Check Your Phone"}
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

          {step === "REGISTER" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              {/* Name Field */}
              <div>
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">
                  Name
                </label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!touched.name)
                      setTouched((prev) => ({ ...prev, name: true }));
                  }}
                  // placeholder="John Doe"
                  className={`w-full mt-2 rounded-xl bg-white/5 border px-4 py-3 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 focus:bg-white/10 text-white transition-all placeholder:text-white/30 ${
                    touched.name && !isNameValid
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                />
                {touched.name && !isNameValid && (
                  <p className="text-xs text-red-400 mt-1.5 ml-1">
                    Name must be at least 2 characters
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!touched.email)
                      setTouched((prev) => ({ ...prev, email: true }));
                  }}
                  // placeholder="john@example.com"
                  className={`w-full mt-2 rounded-xl bg-white/5 border px-4 py-3 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 focus:bg-white/10 text-white transition-all placeholder:text-white/30 ${
                    touched.email && !isEmailValid
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                />
                {touched.email && !isEmailValid && (
                  <p className="text-xs text-red-400 mt-1.5 ml-1">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">
                  Phone Number
                </label>
                <div className="mt-2">
                  <PhoneInput
                    value={phoneNumber}
                    onChange={(val) => {
                      setPhoneNumber(val);
                      if (!touched.phoneNumber)
                        setTouched((prev) => ({ ...prev, phoneNumber: true }));
                    }}
                    className="w-full text-white"
                    inputClassName="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-lime-400 focus-visible:border-lime-400 transition-all hover:bg-white/10"
                    countrySelectorStyleProps={{
                      buttonClassName:
                        "bg-white/5 border-white/10 text-white focus-within:border-lime-400 transition-all hover:bg-white/10",
                    }}
                  />
                </div>
                <style jsx global>{`
                  .react-international-phone-input {
                    background: transparent !important;
                    color: white !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    border-left-color: transparent !important;
                    border-top-right-radius: 0.75rem !important;
                    border-bottom-right-radius: 0.75rem !important;
                    height: 52px !important;
                    font-size: 1rem !important;
                  }
                  .react-international-phone-country-selector-button {
                    background: transparent !important;
                    color: white !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    border-top-left-radius: 0.75rem !important;
                    border-bottom-left-radius: 0.75rem !important;
                    height: 52px !important;
                  }
                  .react-international-phone-country-selector-button__dropdown-arrow {
                    border-top-color: rgba(255, 255, 255, 0.6) !important;
                  }
                  .react-international-phone-country-selector-dropdown {
                    background-color: #1a1a1a !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    border-radius: 0.75rem !important;
                  }
                  .react-international-phone-country-selector-dropdown__list-item {
                    color: white !important;
                  }
                  .react-international-phone-country-selector-dropdown__list-item:hover,
                  .react-international-phone-country-selector-dropdown__list-item--selected {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                  }
                `}</style>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">
                  Password
                </label>
                <div
                  className={`flex items-center gap-2 mt-2 border rounded-xl bg-white/5 px-4 py-3 focus-within:border-lime-400 focus-within:ring-1 focus-within:ring-lime-400 focus-within:bg-white/10 transition-all hover:bg-white/10 ${
                    touched.password && !isPasswordValid
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!touched.password)
                        setTouched((prev) => ({ ...prev, password: true }));
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

                {/* Password Requirements */}
                {(touched.password || password.length > 0) && (
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {passwordRules.map((rule) => (
                      <div
                        key={rule.label}
                        className="flex items-center gap-1.5"
                      >
                        {rule.test(password) ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-white/30 shrink-0" />
                        )}
                        <span
                          className={`text-xs transition-colors ${
                            rule.test(password)
                              ? "text-emerald-400"
                              : "text-white/40"
                          }`}
                        >
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider ml-1">
                  Confirm Password
                </label>
                <div
                  className={`flex items-center gap-2 mt-2 border rounded-xl bg-white/5 px-4 py-3 focus-within:border-lime-400 focus-within:ring-1 focus-within:ring-lime-400 focus-within:bg-white/10 transition-all hover:bg-white/10 ${
                    touched.confirmPassword && !isConfirmPasswordValid
                      ? "border-red-500/60"
                      : "border-white/10"
                  }`}
                >
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (!touched.confirmPassword)
                        setTouched((prev) => ({
                          ...prev,
                          confirmPassword: true,
                        }));
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
                {touched.confirmPassword &&
                  confirmPassword.length > 0 &&
                  !isConfirmPasswordValid && (
                    <p className="text-xs text-red-400 mt-1.5 ml-1">
                      Passwords do not match
                    </p>
                  )}
                {touched.confirmPassword && isConfirmPasswordValid && (
                  <p className="text-xs text-emerald-400 mt-1.5 ml-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Passwords match
                  </p>
                )}
              </div>

              {/* T&C Agreement */}
              <div className="flex items-start gap-3 mt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="accent-lime-400 w-4 h-4 rounded mt-0.5 shrink-0 cursor-pointer"
                />
                <label
                  htmlFor="agree-terms"
                  className="text-xs text-white/60 leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    href="/termsofuse"
                    target="_blank"
                    className="text-lime-400 hover:text-lime-300 underline underline-offset-2 transition-colors"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-lime-400 hover:text-lime-300 underline underline-offset-2 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="mt-4 bg-lime-400 text-black font-semibold py-3.5 rounded-xl hover:bg-lime-500 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-white/60 mt-4">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-lime-400 hover:text-lime-300 hover:underline transition-colors"
                >
                  Login
                </Link>
              </p>
            </form>
          )}

          {step === "EMAIL_VERIFICATION" && (
            <form
              onSubmit={handleVerifyEmail}
              className="flex flex-col gap-8 items-center animate-in fade-in slide-in-from-bottom-4 duration-500"
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
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <p className="text-sm text-white/70">
                  We've sent a 6-digit code to <br />
                  <span className="font-medium text-white">{email}</span>
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
                  {loading ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendTimer > 0 || loading}
                  className="w-full text-sm text-white/60 hover:text-lime-400 transition-colors disabled:text-white/30"
                >
                  {resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : "Didn't receive a code? Resend"}
                </button>
              </div>
            </form>
          )}

          {step === "PHONE_VERIFICATION" && (
            <form
              onSubmit={handleVerifyPhone}
              className="flex flex-col gap-8 items-center animate-in fade-in slide-in-from-bottom-4 duration-500"
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
                  {loading ? "Verifying..." : "Verify Phone"}
                </button>

                <button
                  type="button"
                  onClick={handleResendPhone}
                  disabled={resendTimer > 0 || loading}
                  className="w-full text-sm text-white/60 hover:text-lime-400 transition-colors disabled:text-white/30"
                >
                  {resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : "Didn't receive a code? Resend"}
                </button>

                <div className="flex items-center justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("EMAIL_VERIFICATION");
                      setOtp("");
                    }}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    Didn't receive OTP? Go back to email verification
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
