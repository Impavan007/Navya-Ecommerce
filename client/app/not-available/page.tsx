"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PrimaryButtonLight from "../(site)/components/PrimaryButtonLight";

function NotAvailableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const isPermissionDenied = reason === "permission-denied";

  const handleTryAgain = () => {
    // 1. Clear any local flags
    if (typeof window !== "undefined") {
      localStorage.removeItem("hasVerifiedCity");
      document.cookie = "city_verified=; max-age=0; path=/";
      
      // 2. Force a full reload to the landing page to restart the flow
      window.location.href = "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden px-4 text-center bg-[#FAF6F3] w-full">
      <div className="max-w-[800px] flex flex-col items-center gap-6">
        <h1 className="font-['canela'] font-medium text-black text-[36px] sm:text-[48px] md:text-[64px] leading-[1.1]">
          {isPermissionDenied ? "Location Access Required" : "Not Available in Your City"}
        </h1>
        <p className="font-['Poppins'] font-normal text-gray-700 text-[16px] md:text-[18px] max-w-[600px] leading-[1.6]">
          {isPermissionDenied 
            ? "Please close the tab and try again or provide permission to access the location."
            : "Navyaa is not yet available in your area. We are continuously expanding and hope to see you visit when we expand in your city soon."}
        </p>

        {isPermissionDenied && (
          <div className="mt-4">
            <PrimaryButtonLight 
              text="Try Again" 
              onClick={handleTryAgain}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotAvailablePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#FAF6F3]">Loading...</div>}>
      <NotAvailableContent />
    </Suspense>
  );
}
