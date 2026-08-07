"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useUIStore } from "../../stores/uiStore";
import type { SignInRequest } from "../../types/api";
import { authApiService } from "../../services/api/auth";
import { GoogleIcon, HideEyeIcon, ShoweyeIcon } from "../../icons/icons";
import { useSettings } from "../../hooks/useSettings";
import { BaseModal, ModalHeader, ModalBody, ModalFooter } from "../../components/Modal";

export default function SignInPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const [formData, setFormData] = useState<SignInRequest>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showpassword, setShowpassword] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { signIn } = useAuth();
  const { setApiLoading, isApiLoading } = useUIStore();

  // 🔹 Step 1: Extract token from URL and store it
  useEffect(() => {
    // Try both query string and hash fragment (handle both OAuth patterns)
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const token = searchParams.get("token") || hashParams.get("access_token");
    const role = searchParams.get("role") || hashParams.get("role");
    const email = searchParams.get("email") || hashParams.get("email");
    const name = searchParams.get("name") || hashParams.get("name");
    const message = searchParams.get("message") || hashParams.get("message");
    const switch_account = searchParams.get("switch_account") || hashParams.get("switch_account");

    // Handle message case (user not authenticated/no account)
    if (message) {
      setModalMessage(message);
      setShowMessageModal(true);

      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Handle successful authentication with token
    if (token) {
      localStorage.setItem("auth_token", token);
      if (role) localStorage.setItem("role", role);
      if (email) localStorage.setItem("user_email", email);
      if (name) localStorage.setItem("user_name", name);
      if (switch_account) localStorage.setItem("switch_account", switch_account);

      const expiryDays = 7;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      document.cookie = `auth_token=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax;`;

      if (role) {
        document.cookie = `user_role=${role}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax;`;
      }
      if (email) {
        document.cookie = `user_email=${email}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax;`;
      }
      if (name) {
        document.cookie = `user_name=${name}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax;`;
      }

      toast.success("Login successful!");

      // Clean up the URL (remove token from it)
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect user to buyer homepage by default (unless admin)
      const normalizedRole = role ? role.toLowerCase() : "";
      window.location.href = normalizedRole === 'admin' ? '/admin' : '/';
    }
  }, []);

  const handleInputChange = (field: keyof SignInRequest) =>
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
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setApiLoading(true);

    try {
      await signIn(formData);
      toast.success("Signed in successfully!");
    } catch (error: any) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        toast.error(error.message || "Sign in failed. Please try again.");
      }
    } finally {
      setApiLoading(false);
    }
  };

  const handleSignupWithGoogle = async () => {
    try {
      setIsGoogleLoading(true);
      const response = await authApiService.getGoogleOAuthUrl();

      if (response.success && response.data?.url) {
        // //
        window.location.href = response.data.url;
      } else {
        toast.error(response.message || "Failed to get Google OAuth URL");
      }
    } catch (error: any) {
      console.error("Error getting Google OAuth URL:", error);
      toast.error(error?.message || "Failed to initiate Google sign-in.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleMessageModalClose = () => {
    setShowMessageModal(false);
    setModalMessage("");
    // Redirect to signup form when user clicks OK
    router.push('/auth/Sign-up');
  };

  return (
    <div className="min-h-screen w-full bg-[#F3D6DC] grid grid-cols-1 md:grid-cols-2">
      {/* Left image */}
      <div className="relative hidden md:block">
        <Image src="/assets/girl.jpg" alt="Navyaa model" fill className="object-cover" priority unoptimized />
      </div>

      {/* Right form */}
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
            {/* Email input */}
            <div className="mb-[16px]">
              <label className="sr-only">Email</label>
              <div className="border-b border-[#6d6d6d] flex items-center gap-[8px] py-[10px]">
                <input
                  type="email"
                  placeholder="Enter your Email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  className={`flex-1 bg-transparent outline-none font-poppins text-[14px] leading-[20px] text-[#3D1126] placeholder:text-[#a8a8a8] ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="font-poppins text-[12px] text-red-600 mt-[4px]">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password input */}
            <div className="mb-[8px]">
              <label className="sr-only">Password</label>
              <div className="border-b border-[#6d6d6d] flex items-center gap-[8px] py-[10px]">
                <input
                  type={showpassword ? "text" : "password"}
                  placeholder="Enter your Password"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  className={`flex-1 bg-transparent outline-none font-poppins text-[14px] leading-[20px] text-[#3D1126] placeholder:text-[#a8a8a8] ${errors.password ? 'border-red-500' : ''}`}
                />
                {showpassword ? (
                  <span onClick={() => setShowpassword(false)} className="cursor-pointer" ><ShoweyeIcon /></span>
                ) : (
                  <span onClick={() => setShowpassword(true)} className="cursor-pointer" ><HideEyeIcon /></span>
                )}
              </div>
              {errors.password && (
                <p className="font-poppins text-[12px] text-red-600 mt-[4px]">
                  {errors.password}
                </p>
              )}
            </div>
            <div className="flex justify-end mb-[16px]">
              <Link href="/auth/forgot" className="text-[#6d6d6d] text-[12px] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isApiLoading}
              className="w-full rounded-lg bg-[#1A1A1A] text-white text-[14px] py-[12px] mb-[24px] hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
            >
              {isApiLoading ? "Signing in..." : "Sign in"}
            </button>

            <div className="text-center">
              <span className="text-[#6d6d6d] text-[12px] mr-[6px]">New to Navyaa?</span>
              <Link
                href="/auth/Sign-up"
                className="text-[12px] underline hover:text-black transition-colors"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Account Not Found Modal */}
      <BaseModal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} size="md" showCloseButton>
        <ModalHeader title="Account Not Found" onClose={() => setShowMessageModal(false)} />
        <ModalBody>
          <p className="text-[#3D1126] font-poppins text-center py-4 px-2">
            {modalMessage || "We couldn't find an account associated with this email address. Please check your email or sign up for a new account."}
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                setShowMessageModal(false);
                router.push('/auth/Sign-up');
              }}
              className="w-full bg-black text-white py-4 font-poppins font-medium hover:bg-gray-800 transition-colors"
            >
              Sign Up
            </button>
            <button
              onClick={() => setShowMessageModal(false)}
              className="w-full border border-black text-black py-4 font-poppins font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </ModalFooter>
      </BaseModal>
    </div>
  );
}