"use client";

import { useRef, useEffect } from "react";

interface Props {
  onNext: () => void;
}

export default function Step4SelfieCapture({ onNext }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera access denied", error);
      }
    };

    startCamera();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 sm:py-10 px-4 sm:px-6">

      <div className="text-center flex flex-col items-center max-w-2xl w-full">

        {/* Title */}
        <h1 className="text-2xl md:text-[32px] font-['canela'] font-semibold text-[#3D1126] mb-8 md:mb-12">
          Center yourself on the screen
        </h1>

        {/* Circular Camera Frame */}
        <div className="flex justify-center mb-8 md:mb-14 w-full px-4">
          <div className="relative w-full max-w-[280px] sm:max-w-[360px] aspect-square rounded-full overflow-hidden bg-[#1A1A1A] border-8 border-white shadow-xl">
            {/* Outline overlay */}
            <div className="absolute inset-0 border-4 border-[#3D1126]/20 rounded-full z-10 pointer-events-none" />

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
        </div>

        {/* Capture Button */}
        <div className="w-full flex justify-center px-4">
          <button
            onClick={onNext}
            className="group bg-[#1A1A1A] text-white w-full sm:max-w-md py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#1E1B21] transition-all active:scale-95 shadow-lg"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_3742_18260)">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="#F1F1F1" />
                <path d="M20 4H16.83L15.59 2.65C15.22 2.24 14.68 2 14.12 2H9.88C9.32 2 8.78 2.24 8.4 2.65L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="#F1F1F1" />
              </g>
              <defs>
                <clipPath id="clip0_3742_18260">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>


          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 md:mt-16 space-y-2">
          <p className="text-[#6D6D6D] text-xs sm:text-sm font-poppins">
            Your image is processed securely and encrypted.
          </p>

          <p className="text-[#6D6D6D] text-xs sm:text-sm font-poppins">
            Camera not working?{" "}
            <button className="underline text-[#3D1126] font-medium hover:text-black transition-colors">
              Try Uploading
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
