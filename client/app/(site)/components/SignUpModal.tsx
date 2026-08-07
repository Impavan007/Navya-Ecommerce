"use client";

import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import { BaseModal } from "./Modal";

interface SignUpModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
    if (!isOpen) return null;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose || (() => { })}
            size="4xl"
            className="overflow-hidden rounded-lg"
            data-auth-modal="true"
        >
            <div className="flex flex-col md:flex-row min-h-[500px]">
                {/* Left Column - Image (Hidden on small screens) */}
                <div className="hidden md:block md:w-1/2 relative min-h-[500px]">
                    <Image
                        src="/assets/girl.jpg"
                        alt="Sign up background"
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    {/* <div className="absolute inset-0 flex flex-col justify-end p-8 text-white text-left">
                        <h2 className="font-['Playfair_Display'] font-bold text-3xl mb-2">Join Navyaa</h2>
                        <p className="font-poppins text-sm opacity-90">
                            Create an account to browse exclusive collections and start your circular wardrobe journey.
                        </p>
                    </div> */}
                </div>

                {/* Right Column - Form */}
                <div className="w-full md:w-1/2 p-6 sm:p-10 relative bg-[#F3D6DC] overflow-auto">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close modal"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                        <span className="font-serif tracking-[0.2em] text-3xl font-bold bg-gradient-to-r from-[#BFA15F] to-[#E5C9A4] bg-clip-text text-transparent uppercase select-none mb-6">
                            NAVYAA
                        </span>

                    <SignUpForm onSuccess={onClose} />

                    {/* <div className="text-center mt-6 text-[14px]">
                        Already have an account?{" "}
                        <Link href="/auth/sign-in" onClick={onClose} className="underline font-medium hover:text-[#3D1126] transition-colors">
                            Sign in
                        </Link>
                    </div> */}
                </div>
            </div>
        </BaseModal>
    );
}
