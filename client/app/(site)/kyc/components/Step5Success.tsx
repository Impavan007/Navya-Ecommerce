"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Step5Success() {
  const router = useRouter()
  const handleKyc = async () => {
    
    router.push('/auth/sign-in')
  }
  return (
    <div className="w-full min-h-screen bg-[#F6F3F1] flex flex-col items-center justify-center px-6 py-10">

      <div className="w-full max-w-2xl text-center flex flex-col items-center">

        {/* Navyaa Logo */}
        <div className="flex justify-center mb-10 md:mb-16">
          <span className="font-serif tracking-[0.2em] text-3xl font-bold bg-gradient-to-r from-[#BFA15F] to-[#E5C9A4] bg-clip-text text-transparent uppercase select-none">
            NAVYAA
          </span>
        </div>

        {/* Green Success Circle */}
        <div className="flex justify-center mb-8 md:mb-10">
          <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-[#1F8A2E] rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
            <svg
              className="w-10 h-10 md:w-12 md:h-12 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-['canela'] font-semibold text-[#1F8A2E] mb-4">
          Verification Successful
        </h1>

        {/* Subtitle */}
        <p className="text-[#6D6D6D] text-base md:text-lg mb-10 md:mb-14 leading-relaxed max-w-md font-poppins">
          Your identity has been verified. You’re all set to
          continue using Navyaa with complete peace of mind.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center w-full">
          <button
            className="bg-[#1A1A1A] text-[#FFFFFF] w-full sm:max-w-lg py-4 md:py-5 rounded-xl text-lg font-medium shadow-xl hover:bg-black transition-all active:scale-95"
            onClick={handleKyc}
          >
            Continue To Navyaa
          </button>
        </div>

      </div>
    </div>
  );
}
