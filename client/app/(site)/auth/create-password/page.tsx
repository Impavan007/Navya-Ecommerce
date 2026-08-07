"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { authApiService } from "../../services/api/auth";
import Link from "next/link";

function CreatePasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });



  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Extract token from query parameter 'ref'
    const refParam = searchParams.get('ref');
    if (refParam) {
      setToken(refParam);
    } else {
      // If no token, redirect to appropriate page or show error
      toast.error("Invalid or missing token. Please request a new password reset link.");
    }
  }, [searchParams]);

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!token) {
      toast.error("Invalid token. Please request a new password reset link.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApiService.createPassword(token, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        toast.success(response.message || "Password created successfully! Please sign in with your new password.");
        // Redirect to sign-in page after successful password creation
        router.push('/auth/sign-in');
      } else {
        throw new Error(response.message || "Failed to create password");
      }
    } catch (error: any) {
      console.error("Error creating password:", error);
      const errorMessage = error?.message || error?.response?.data?.message || "Failed to create password. Please try again.";
      toast.error(errorMessage);

      // Set field errors if provided
      if (error?.errors && typeof error.errors === 'object') {
        setErrors(error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3D6DC] grid grid-cols-1 md:grid-cols-2">
      {/* Left: Full height image */}
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
            {/* Welcome Text */}
            <div className="text-center mb-[32px]">
              <h1 className="font-['Playfair_Display'] font-bold text-[32px] leading-[48px] text-[#3D1126] mb-[4px]">
                Welcome to Navyaa
              </h1>
              <p className="font-poppins text-[16px] leading-[24px] text-[#3D1126]">
                Let's get you started — create a secure password to access your account.
              </p>
            </div>

            {/* Password Field */}
            <div className="mb-[16px]">
              <label className="sr-only">Password</label>
              <div className="border-b border-[#6d6d6d] flex items-center gap-[8px] py-[12px]">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new Password"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  className={`flex-1 bg-transparent outline-none font-poppins text-[16px] leading-[24px] text-[#3D1126] placeholder:text-[#8a8a8a] ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:opacity-70 transition-opacity"
                >
                  {showPassword ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5C7 5 3 9 3 12C3 15 7 19 12 19C17 19 21 15 21 12C21 9 17 5 12 5Z" stroke="#6D6D6D" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="3" stroke="#6D6D6D" strokeWidth="1.5" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5C7 5 3 9 3 12C3 15 7 19 12 19C17 19 21 15 21 12C21 9 17 5 12 5Z" stroke="#6D6D6D" strokeWidth="1.5" />
                      <path d="M3 3L21 21" stroke="#6D6D6D" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="font-poppins text-[12px] leading-[16px] text-[#a8a8a8] mt-[4px]">
                Choose a Password with at least 8 characters
              </p>
              {errors.password && (
                <p className="font-poppins text-[12px] leading-[16px] text-red-600 mt-[4px]">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-[40px]">
              <label className="sr-only">Confirm Password</label>
              <div className="border-b border-[#6d6d6d] flex items-center gap-[8px] py-[12px]">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  className={`flex-1 bg-transparent outline-none font-poppins text-[16px] leading-[24px] text-[#3D1126] placeholder:text-[#8a8a8a] ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 hover:opacity-70 transition-opacity"
                >
                  {showConfirmPassword ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5C7 5 3 9 3 12C3 15 7 19 12 19C17 19 21 15 21 12C21 9 17 5 12 5Z" stroke="#6D6D6D" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="3" stroke="#6D6D6D" strokeWidth="1.5" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5C7 5 3 9 3 12C3 15 7 19 12 19C17 19 21 15 21 12C21 9 17 5 12 5Z" stroke="#6D6D6D" strokeWidth="1.5" />
                      <path d="M3 3L21 21" stroke="#6D6D6D" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="font-poppins text-[12px] leading-[16px] text-[#a8a8a8] mt-[4px]">
                Choose a Password with at least 8 characters
              </p>
              {errors.confirmPassword && (
                <p className="font-poppins text-[12px] leading-[16px] text-red-600 mt-[4px]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Set Password Button */}
            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full bg-[#1A1A1A] text-white font-poppins font-medium text-[14px] leading-[20px] py-[12px] px-[16px] h-[44px] hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Password..." : "Set Password & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#FAF6F3] flex items-center justify-center">
        <p className="font-poppins text-[16px] text-[#6d6d6d]">Loading...</p>
      </div>
    }>
      <CreatePasswordInner />
    </Suspense>
  );
}
