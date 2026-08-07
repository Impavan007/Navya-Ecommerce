"use client";

import Image from "next/image";

interface Props {
  onNext: () => void;
}

export default function Step3SelfieIntro({ onNext }: Props) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-8 sm:py-12">

      {/* Content Wrapper */}
      <div className="text-center max-w-2xl w-full px-4 flex flex-col items-center">

        {/* Title */}
        <h1 className="text-2xl md:text-[32px] font-['canela'] font-semibold text-[#3D1126] mb-3">
          Take a quick selfie
        </h1>

        {/* Subtitle */}
        <p className="text-[#6D6D6D] font-poppins text-base md:text-lg mb-8 md:mb-14 max-w-md">
          We’ll compare your selfie with your ID to confirm it’s really you.
        </p>

        {/* Scan Frame Icon */}
        <div className="flex justify-center mb-8 md:mb-14">
          <div className="relative w-[160px] h-[160px] md:w-[200px] md:h-[200px]">
            <svg className="w-full h-full" viewBox="0 0 204 204" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.25 69.5895C22.134 51.7395 24.7775 40.6045 32.6995 32.6995C40.6045 24.7775 51.7395 22.134 69.5895 21.25M182.75 69.5895C181.866 51.7395 179.222 40.6045 171.3 32.6995C163.395 24.7775 152.26 22.134 134.41 21.25M134.41 182.75C152.26 181.866 163.395 179.222 171.3 171.3C179.222 163.395 181.866 152.26 182.75 134.41M69.5895 182.75C51.7395 181.866 40.6045 179.222 32.6995 171.3C24.7775 163.395 22.134 152.26 21.25 134.41M148.75 144.5L147.033 137.283C146.335 134.355 144.871 131.665 142.793 129.487C140.714 127.31 138.094 125.724 135.201 124.89L114.75 118.991V106.522C122.366 101.379 127.5 91.766 127.5 80.75C127.5 64.3195 116.076 51 102 51C87.9155 51 76.5 64.3195 76.5 80.75C76.5 91.766 81.6255 101.379 89.25 106.522V118.991L68.9265 124.942C66.1202 125.763 63.5733 127.295 61.5319 129.388C59.4905 131.482 58.0236 134.066 57.273 136.892L55.25 144.5" stroke="#3D1126" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

          </div>
        </div>

        {/* Button */}
        <button
          onClick={onNext}
          className="bg-[#1A1A1A] text-[#ffffff] w-full sm:max-w-md py-4 rounded-xl text-base sm:text-lg font-medium shadow-lg hover:opacity-95 transition-all active:scale-[0.98]"
        >
          Take Selfie
        </button>

        {/* Footer Text */}
        <div className="mt-12 md:mt-16 space-y-2">
          <p className="text-[#6D6D6D] text-xs sm:text-sm font-poppins">
            Your documents are encrypted and used only for identity verification
          </p>

          <p className="text-[#6D6D6D] text-xs sm:text-sm font-poppins">
            Having trouble?{" "}
            <button className="underline text-[#3D1126] font-medium hover:text-black transition-colors">
              Contact Support
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
