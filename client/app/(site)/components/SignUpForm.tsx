"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUIStore } from "../stores/uiStore";
import { authApiService } from "../services/api/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";
import type { User } from "../types/api";
import { GoogleIcon, HideEyeIcon, ShoweyeIcon, SignupEmailIcon, SignupHidePasswordIcon, SignupPasswordIcon, SignupUserIcon } from "../icons/icons";

interface SignUpFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function SignUpForm({ onSuccess, className = "" }: SignUpFormProps) {
    const { isApiLoading, setApiLoading } = useUIStore();
    const router = useRouter()
    const { signIn: storeSignIn } = useAuthStore();
    const icons = [SignupHidePasswordIcon, SignupPasswordIcon, SignupUserIcon, SignupEmailIcon]
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",


        agreed: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = field === "agreed" ? e.target.checked : e.target.value;

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.fullName) newErrors.fullName = "Full name is required";
        if (!formData.password) newErrors.password = "Password is required";
        if (formData.password.length < 8)
            newErrors.password = "Minimum 8 characters required";
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        if (!formData.agreed)
            newErrors.agreed = "You must agree to terms";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setApiLoading(true);

            const response = await authApiService.signUp({
                email: formData.email,
                password: formData.password,
                name: formData.fullName,

                confirm_password: formData.confirmPassword,
            });

            if (response.success) {
                toast.success("Account created successfully!");

                if (response.data?.user && response.data?.token) {
                    const apiUser = response.data.user;
                    const token = response.data.token;
                    const apiRole = apiUser.role || 'buyer';

                    const frontendRole = (apiRole.toLowerCase() === 'lender' || apiRole.toLowerCase() === 'seller') ? 'seller' : (apiRole.toLowerCase() === 'admin' ? 'admin' : 'buyer');
                    const dbRole = (apiRole.toLowerCase() === 'lender' || apiRole.toLowerCase() === 'seller') ? 'seller' : (apiRole.toLowerCase() === 'admin' ? 'admin' : 'buyer');

                    // Create a User object that matches the store interface
                    // defaulting missing fields required by the User type
                    const userData: User = {
                        id: apiUser.id,
                        email: apiUser.email,
                        name: apiUser.name,
                        firstName: apiUser.name?.split(' ')[0] || '',
                        lastName: apiUser.name?.split(' ').slice(1).join(' ') || '',
                        preferences: {
                            currency: 'INR',
                            language: 'en',
                            notifications: {
                                email: true,
                                sms: false,
                                push: true,
                                marketing: false,
                                bookingUpdates: true,
                                reviewReminders: true,
                            },
                            privacy: {
                                profileVisibility: 'public',
                                showInSearch: true,
                                allowMessages: true,
                            },
                        },
                        isEmailVerified: true,
                        isPhoneVerified: false,
                        role: dbRole as any,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        switch_account: Boolean(apiUser.switch_account),
                        isSwitched: Boolean(apiUser.is_switched),
                    };

                    // Save token and role same as sign-in
                    storeSignIn(userData, token, frontendRole);

                    const redirectPath = frontendRole === 'seller' ? '/lender' : frontendRole === 'admin' ? '/admin' : '/';
                    window.location.href = redirectPath;
                } else {
                    window.location.href = '/';
                }

                if (onSuccess) onSuccess();
            }
            else {
                toast.error(response.message || "Signup failed");
            }
        } catch (error: any) {
            toast.error(error?.message || "Signup failed");
        } finally {
            setApiLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            setIsGoogleLoading(true);
            const response = await authApiService.getGoogleOAuthUrl();

            if (response.success && response.data?.url) {
                window.location.href = response.data.url;
            } else {
                toast.error("Failed to initiate Google sign-up");
            }
        } catch (error: any) {
            toast.error(error?.message || "Google sign-up failed");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className={`w-full ${className}`}>
            <form onSubmit={handleSubmit}>
                {/* EMAIL */}
                <div className="mb-6">
                    <div className="border-b border-[#9c8f8f] flex items-center py-3">
                        <input
                            type="email"
                            placeholder="Enter your Email"
                            value={formData.email}
                            onChange={handleChange("email")}
                            className="flex-1 bg-transparent outline-none text-[14px] text-[#3D1126]"
                        />
                        <SignupEmailIcon />
                    </div>
                    {errors.email && (
                        <p className="text-red-600 text-[12px] mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* FULL NAME */}
                <div className="mb-6">
                    <div className="border-b border-[#9c8f8f] flex items-center py-3">
                        <input
                            type="text"
                            placeholder="Enter your Full Name"
                            value={formData.fullName}
                            onChange={handleChange("fullName")}
                            className="flex-1 bg-transparent outline-none text-[14px] text-[#3D1126]"
                        />
                        <SignupUserIcon />
                    </div>
                    {errors.fullName && (
                        <p className="text-red-600 text-[12px] mt-1">
                            {errors.fullName}
                        </p>
                    )}
                </div>

                {/* CITY AND POSTAL CODE */}


                {/* PASSWORD */}
                <div className="mb-4">
                    <div className="border-b border-[#9c8f8f] flex items-center py-3">
                        <input
                            type={!showPassword ? "password" : "text"}
                            placeholder="Enter your Password"
                            value={formData.password}
                            onChange={handleChange("password")}
                            className="flex-1 bg-transparent outline-none text-[14px]"
                        />
                        {showPassword ? (
                            <span onClick={() => setShowPassword(false)} className="cursor-pointer" ><SignupPasswordIcon /></span>
                        ) : (
                            <span onClick={() => setShowPassword(true)} className="cursor-pointer" ><SignupHidePasswordIcon /></span>
                        )}
                    </div>
                    <p className="text-[12px] text-[#8f8f8f] mt-1">
                        Choose a Password with at least 8 characters
                    </p>
                    {errors.password && (
                        <p className="text-red-600 text-[12px] mt-1">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="mb-6">
                    <div className="border-b border-[#9c8f8f] flex items-center py-3">
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange("confirmPassword")}
                            className="flex-1 bg-transparent outline-none text-[14px]"
                        />
                        {showConfirm ? (
                            <span onClick={() => setShowConfirm(false)} className="cursor-pointer" ><SignupPasswordIcon /></span>

                        ) : (
                            <span onClick={() => setShowConfirm(true)} className="cursor-pointer" ><SignupHidePasswordIcon /></span>
                        )}
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-600 text-[12px] mt-1">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* TERMS */}
                <div className="flex items-start justify-center gap-2 mb-6">
                    <input
                        type="checkbox"
                        checked={formData.agreed}
                        onChange={handleChange("agreed")}
                        className="w-4 h-4 border border-black bg-transparent appearance-none cursor-pointer
               checked:bg-transparent checked:border-black
               checked:after:content-['✔'] checked:after:text-black 
               checked:after:flex checked:after:items-center checked:after:justify-center
               checked:after:text-[10px]"
                    />
                    <p className="text-[12px] text-[#3D1126]">
                        By Proceeding, you agree to the{" "}
                        <Link href="/terms" className="underline text-blue-500">
                            Terms and conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline text-blue-500">
                            Privacy Policy
                        </Link>
                    </p>
                </div>

                {/* SUBMIT */}
                <button
                    type="submit"
                    disabled={isApiLoading}
                    className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg mb-6 hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                >
                    {isApiLoading ? "Creating Account..." : "Sign Up"}
                </button>

                <div className="text-center mt-6 text-[14px]">
                    Already have an account?{" "}
                    <Link href="/auth/sign-in" className="underline font-regular hover:text-[#3D1126] transition-colors">
                        Sign in
                    </Link>
                </div>
            </form>
        </div>
    );
}
