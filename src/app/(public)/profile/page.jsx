"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Calendar, 
  LogOut, 
  ArrowLeft,
  Shield,
  Key,
  ShieldAlert,
  X
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/app/components/ui/input-otp";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verification states
  const [verifyingType, setVerifyingType] = useState(null); // 'email' | 'phone' | null
  const [otp, setOtp] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
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

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      router.push("/login");
    } else {
      try {
        setUser(JSON.parse(userCookie));
      } catch (e) {
        console.error("Failed to parse user cookie:", e);
        Cookies.remove("user");
        Cookies.remove("token");
        router.push("/login");
      }
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("user", { path: "/" });
    window.location.href = "/";
  };

  const handleStartVerification = async (type) => {
    setVerifyingType(type);
    setOtp("");
    setResendTimer(30);

    const isEmail = type === "email";
    const endpoint = isEmail 
      ? `${BASE_URL}/api/${API_VERSION}/customer/auth/resend-verification`
      : `${BASE_URL}/api/${API_VERSION}/customer/auth/resend-phone-verification`;
    
    const body = isEmail 
      ? { email: user.email }
      : { phone_number: user.phone_number };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description: data?.message || `Failed to send verification code to your ${type}.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Verification code sent to your ${type}.`,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong sending the code.",
        variant: "destructive",
      });
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(30);

    const isEmail = verifyingType === "email";
    const endpoint = isEmail 
      ? `${BASE_URL}/api/${API_VERSION}/customer/auth/resend-verification`
      : `${BASE_URL}/api/${API_VERSION}/customer/auth/resend-phone-verification`;
    
    const body = isEmail 
      ? { email: user.email }
      : { phone_number: user.phone_number };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description: data?.message || `Failed to resend verification code.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Verification code resent.`,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (verificationLoading) return;
    setVerificationLoading(true);

    const isEmail = verifyingType === "email";
    const endpoint = isEmail 
      ? `${BASE_URL}/api/${API_VERSION}/customer/auth/verify-email`
      : `${BASE_URL}/api/${API_VERSION}/customer/auth/verify-phone`;
    
    const body = isEmail 
      ? { email: user.email, otp }
      : { phone_number: user.phone_number, otp };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description: data?.message || "Verification failed. Please try again.",
          variant: "destructive",
        });
        setOtp("");
      } else {
        toast({
          title: "Success",
          description: `${isEmail ? "Email" : "Phone number"} verified successfully!`,
        });
        
        const updatedUser = {
          ...user,
          [isEmail ? "email_verified" : "phone_verified"]: true,
        };
        setUser(updatedUser);
        Cookies.set("user", JSON.stringify(updatedUser), {
          expires: 1,
          path: "/",
          sameSite: "strict",
        });
        
        setVerifyingType(null);
        setOtp("");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong during verification.",
        variant: "destructive",
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted/20 to-background pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors group animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Profile Card */}
        <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-xl animate-fade-up">
          
          {/* Decorative Cover Gradient */}
          <div className="h-36 bg-linear-to-r from-primary/80 via-primary-aqua to-primary-blue relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg text-3xl font-semibold border-4 border-card">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
            </div>
          </div>

          {/* Profile Details Content */}
          <div className="pt-14 pb-8 px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  {user.name || "User Profile"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" />
                  Role: <span className="font-semibold text-foreground/80">{user.role?.name || user.role || "Customer"}</span>
                </p>
              </div>
              <div>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="w-full md:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 hover:border-red-300 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid gap-6">
              {/* Email Address */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40 border border-border/20 transition-all duration-300 hover:bg-muted/60">
                <div className="p-3 bg-primary/10 rounded-xl text-primary mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</p>
                  <p className="text-base text-foreground font-medium mt-1 truncate">{user.email || "Not Provided"}</p>
                </div>
                {user.email && (
                  <div className="self-center flex items-center gap-2">
                    {user.email_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          Pending
                        </span>
                        <Button 
                          onClick={() => handleStartVerification("email")}
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2.5 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                        >
                          Verify
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40 border border-border/20 transition-all duration-300 hover:bg-muted/60">
                <div className="p-3 bg-primary/10 rounded-xl text-primary mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</p>
                  <p className="text-base text-foreground font-medium mt-1 truncate">{user.phone_number || "Not Provided"}</p>
                </div>
                {user.phone_number && (
                  <div className="self-center flex items-center gap-2">
                    {user.phone_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          Pending
                        </span>
                        <Button 
                          onClick={() => handleStartVerification("phone")}
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2.5 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                        >
                          Verify
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Account Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Auth Provider */}
                {/* <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/30">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Sign-in Method: </span>
                    <span className="font-semibold text-foreground/80">{user.auth_provider || "LOCAL"}</span>
                  </div>
                </div> */}

                {/* Joined Date */}
                {joinedDate && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/30">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Member Since: </span>
                      <span className="font-semibold text-foreground/80">{joinedDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {verifyingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border/60 p-6 md:p-8 text-foreground shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setVerifyingType(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6 items-center">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                  {verifyingType === "email" ? (
                    <Mail className="w-8 h-8" />
                  ) : (
                    <Phone className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-xl font-bold">
                  Verify {verifyingType === "email" ? "Email Address" : "Phone Number"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit code to <br />
                  <span className="font-medium text-foreground">
                    {verifyingType === "email" ? user.email : user.phone_number}
                  </span>
                </p>
              </div>

              <div className="w-full flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup className="gap-2">
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="border border-border rounded-xl bg-muted/45 text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-12 w-12 text-lg !border-l transition-all"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="w-full space-y-4 mt-2">
                <Button
                  type="submit"
                  disabled={verificationLoading || otp.length !== 6}
                  className="w-full btn-primary"
                >
                  {verificationLoading ? "Verifying..." : "Verify"}
                </Button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || verificationLoading}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors disabled:text-muted-foreground/30 cursor-pointer"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive a code? Resend"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
