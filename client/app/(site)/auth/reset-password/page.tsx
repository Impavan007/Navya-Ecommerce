"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useUIStore } from "../../stores/uiStore";
import { SignupHidePasswordIcon, SignupPasswordIcon } from "../../icons/icons";

export const dynamic = 'force-dynamic';

function ResetPasswordInner() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showpassword, setShowpassword] = useState(false);
  const [newshowpassword, setnewShowpassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [token, setToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();


  const { resetPassword } = useAuth();
  const { setApiLoading, isApiLoading } = useUIStore();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      router.push("/auth/forgot");
    }
  }, [searchParams, router]);

  const handleInputChange = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: "",
        }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Basic checks
    if (!formData.newPassword)
      newErrors.newPassword = "New password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";

    // Strong password regex
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (
      formData.newPassword &&
      !strongPasswordRegex.test(formData.newPassword)
    ) {
      newErrors.newPassword =
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setApiLoading(true);

    try {
      const response = await resetPassword(
        formData.newPassword,
        formData.confirmPassword,
        token
      );

      if (response.success) {
        toast.success("Password reset successfully! Please sign in with your new password.");
        router.push("/auth/sign-in");
      }
    } catch (error: any) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({
          newPassword:
            error.message || "Failed to reset password. Please try again.",
        });
        toast.error(
          error.message || "Failed to reset password. Please try again."
        );
      }
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3D6DC] grid grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:block">
        <Image
          src="/assets/girl.jpg"
          alt="Navyaa model"
          fill
          className="object-cover"
          priority
          unoptimized
        />
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
            <h1 className="font-['Playfair_Display'] text-[40px] leading-[40px] text-[#3D1126] mb-[24px] text-center">
              Reset Password
            </h1>

            {/* New Password Field */}
            <div className="mb-[16px]">
              <label className="sr-only">New Password</label>
              <div className="border-b border-[#6d6d6d] flex items-center gap-[8px] py-[10px]">
                <input
                  type={showpassword ? "text" : "password"}
                  placeholder="Enter new Password"
                  value={formData.newPassword}
                  onChange={handleInputChange("newPassword")}
                  className={`flex-1 bg-transparent outline-none font-poppins text-[14px] leading-[20px] text-[#3D1126] placeholder:text-[#a8a8a8] ${errors.newPassword ? "border-red-500" : ""
                    }`}
                />
                {showpassword ? (
                  <span onClick={() => setShowpassword(false)} className="cursor-pointer" ><SignupPasswordIcon /></span>
                ) : (
                  <span onClick={() => setShowpassword(true)} className="cursor-pointer" ><SignupHidePasswordIcon /></span>
                )}
              </div>
              {errors.newPassword && (
                <p className="font-poppins text-[12px] leading-[16px] text-red-600 mt-[4px]">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-[16px]">
              <label className="sr-only">Confirm Password</label>
              <div className="border-b border-[#6d6d6d] flex items-center gap-[8px] py-[10px]">
                <input
                  type={newshowpassword ? "text" : "password"}
                  placeholder="Confirm new Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  className={`flex-1 bg-transparent outline-none font-poppins text-[14px] leading-[20px] text-[#3D1126] placeholder:text-[#a8a8a8] ${errors.confirmPassword ? "border-red-500" : ""
                    }`}
                />
                {newshowpassword ? (
                  <span onClick={() => setnewShowpassword(false)} className="cursor-pointer" ><SignupPasswordIcon /></span>
                ) : (
                  <span onClick={() => setnewShowpassword(true)} className="cursor-pointer" ><SignupHidePasswordIcon /></span>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="font-poppins text-[12px] leading-[16px] text-red-600 mt-[4px]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isApiLoading}
              className="w-full bg-[#1A1A1A] text-white font-poppins text-[14px] leading-[20px] py-[12px] mb-[24px] block text-center hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isApiLoading ? "Updating Password..." : "Update Password"}
            </button>
          </form>

          <div className="text-center">
            <Link
              href="/auth/sign-in"
              className="font-poppins text-[12px] leading-[16px] underline"
            >
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
