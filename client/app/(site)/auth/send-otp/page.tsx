"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useUIStore } from "../../stores/uiStore";

export const dynamic = 'force-dynamic';

function SendOtpInner() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { verifyOtpForgot, requestOtp } = useAuth(); // Move requestOtp here
  const { setApiLoading, isApiLoading } = useUIStore();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push('/auth/forgot');
    }
  }, [searchParams, router]);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: "" }));
    }

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // FIX 1: Add paste handler
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();

    // Validate pasted OTP (6 digits)
    if (/^\d{6}$/.test(pastedData)) {
      const pastedOtp = pastedData.split('');
      setOtp(pastedOtp);

      // Focus the last input after paste
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 0);
    } else {
      toast.error("Please paste a valid 6-digit OTP");
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join('');

    const newErrors: Record<string, string> = {};
    if (otpString.length !== 6) newErrors.otp = "Please enter all 6 digits";
    if (!/^\d{6}$/.test(otpString)) newErrors.otp = "Please enter valid OTP";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setApiLoading(true);

    try {
      const response = await verifyOtpForgot(email, otpString);

      if (response.success && response.data) {
        toast.success("OTP verified successfully!");
        router.push(`/auth/reset-password?token=${encodeURIComponent(response.data.token)}`);
      }
    } catch (error: any) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ otp: error.message || "Invalid OTP. Please try again." });
        toast.error(error.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setApiLoading(false);
    }
  };

  // FIX 2: Corrected resend OTP function
  const handleResendOtp = async () => {
    if (!email || !canResend) return;

    setApiLoading(true);
    try {
      ////
      const response = await requestOtp(email);

      if (response.success) {
        toast.success("OTP resent successfully!");
        setOtp(["", "", "", "", "", ""]);
        setErrors({});

        // Start resend timer (60 seconds)
        setCanResend(false);
        setResendTimer(60);

        // Focus first input
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.message || "Failed to resend OTP. Please try again.";
      setErrors({ otp: errorMessage });
      toast.error(errorMessage);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3D6DC] grid grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:block">
        <Image src="/assets/girl.jpg" alt="Navyaa model" fill className="object-cover" priority unoptimized />
      </div>

      <div className="flex items-center justify-center p-[32px] md:p-[48px]">
        <div className="w-full max-w-[420px]">
          <div className="mb-[32px] flex justify-center">
            <Link href="/">
              <span className="font-serif tracking-[0.2em] text-3xl font-bold bg-gradient-to-r from-[#BFA15F] to-[#E5C9A4] bg-clip-text text-transparent uppercase select-none">
                NAVYAA
              </span>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <h1 className="font-['Playfair_Display'] text-[40px] leading-[40px] text-[#3D1126] mb-[24px] text-center">Enter OTP</h1>
            <p className="font-poppins text-[12px] leading-[16px] text-[#6d6d6d] mb-[16px] text-center">
              We have sent a 6 digit OTP to <strong>{email}</strong>
            </p>

            <div className="grid grid-cols-6 gap-[8px] mb-[16px]">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i]}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onPaste={i === 0 ? handlePaste : undefined} // Only first input handles paste
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`h-[44px] text-center border-b border-[#6d6d6d] bg-transparent outline-none font-poppins text-[16px] ${errors.otp ? 'border-red-500' : ''
                    }`}
                />
              ))}
            </div>

            {errors.otp && (
              <p className="font-poppins text-[12px] leading-[16px] text-red-600 mb-[16px] text-center">
                {errors.otp}
              </p>
            )}

            <button
              type="submit"
              disabled={isApiLoading}
              className="w-full bg-[#1A1A1A] text-white font-poppins text-[14px] leading-[20px] py-[12px] mb-[24px] block text-center hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isApiLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResendOtp}
                disabled={isApiLoading}
                className="font-poppins text-[12px] leading-[16px] underline text-[#6d6d6d] hover:text-[#3D1126] disabled:opacity-50 transition-colors"
              >
                Resend OTP
              </button>
            ) : (
              <p className="font-poppins text-[12px] leading-[16px] text-[#6d6d6d]">
                Resend OTP in {resendTimer}s
              </p>
            )}
          </div>

          <div className="text-center mt-4">
            <Link href="/auth/sign-in" className="font-poppins text-[12px] leading-[16px] underline text-[#6d6d6d] hover:text-[#3D1126]">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SendOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#FAF6F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D1126] mx-auto"></div>
          <p className="mt-4 font-poppins text-[14px] text-[#6d6d6d]">Loading...</p>
        </div>
      </div>
    }>
      <SendOtpInner />
    </Suspense>
  );
}