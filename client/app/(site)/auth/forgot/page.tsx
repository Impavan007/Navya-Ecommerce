"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useUIStore } from "../../stores/uiStore";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();


  const { requestOtp } = useAuth();
  const { setApiLoading, isApiLoading } = useUIStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear field error when user starts typing
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "Email is required";
    if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setApiLoading(true);

    try {
      const response = await requestOtp(email);

      if (response.success) {
        toast.success("OTP sent successfully! Please check your email.");
        // Navigate to send-otp page with email parameter
        router.push(`/auth/send-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      // Handle API errors
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ email: error.message || "Failed to send OTP. Please try again." });
        toast.error(error.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3D6DC] grid grid-cols-1 md:grid-cols-2">
      {/* Left: Full height image */}
      <div className="relative hidden md:block">
        <Image src="/assets/girl.jpg" alt="Navyaa model" fill className="object-cover" priority unoptimized />
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-[32px] md:p-[48px]">
        <div className="w-full max-w-[420px]">
          {/* Brand */}
          <div className="mb-[32px] flex justify-center">
            <Link href="/">
              <span className="font-serif tracking-[0.2em] text-3xl font-bold bg-gradient-to-r from-[#BFA15F] to-[#E5C9A4] bg-clip-text text-transparent uppercase select-none">
                NAVYAA
              </span>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-[16px]">
              <label className="sr-only">Email</label>
              <div className="border-b border-[#6d6d6d] flex items-center gap-[8px] py-[10px]">
                <input
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={handleInputChange}
                  className={`flex-1 bg-transparent outline-none font-poppins text-[14px] leading-[20px] text-[#3D1126] placeholder:text-[#a8a8a8] ${errors.email ? 'border-red-500' : ''}`}
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C20.55 4 21 4.45 21 5V19C21 19.55 20.55 20 20 20H4C3.45 20 3 19.55 3 19V5C3 4.45 3.45 4 4 4Z" stroke="#6D6D6D" strokeWidth="1.5" />
                  <path d="M21 5L12 12L3 5" stroke="#6D6D6D" strokeWidth="1.5" />
                </svg>
              </div>
              {errors.email && (
                <p className="font-poppins text-[12px] leading-[16px] text-red-600 mt-[4px]">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Send OTP button */}
            <button
              type="submit"
              disabled={isApiLoading}
              className="w-full bg-[#1A1A1A] text-white font-poppins text-[14px] leading-[20px] py-[12px] mb-[24px] block text-center hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isApiLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <div className="text-center">
            <span className="font-poppins text-[12px] leading-[16px] text-[#6d6d6d] mr-[6px]">Remember your password?</span>
            <Link href="/auth/sign-in" className="font-poppins text-[12px] leading-[16px] underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}