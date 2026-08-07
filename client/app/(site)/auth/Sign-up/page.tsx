"use client";

import Image from "next/image";
import SignUpForm from "../../components/SignUpForm";
import { useSettings } from "../../hooks/useSettings";
import Link from "next/link";

export default function SignUpPage() {
  const { settings } = useSettings();
  return (
    <div className="min-h-screen w-full bg-[#F3D6DC] grid grid-cols-1 md:grid-cols-2">
      {/* LEFT IMAGE */}
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

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center p-[32px] md:p-[48px]">
        <div className="w-full max-w-[420px]">
          <div className="mb-[32px] flex justify-center">
            <Link href="/">
              <span className="font-serif tracking-[0.2em] text-3xl font-bold bg-gradient-to-r from-[#BFA15F] to-[#E5C9A4] bg-clip-text text-transparent uppercase select-none">
                NAVYAA
              </span>
            </Link>
          </div>

          <SignUpForm onSuccess={() => window.location.href = "/"} />
        </div>
      </div>
    </div>
  );
}
