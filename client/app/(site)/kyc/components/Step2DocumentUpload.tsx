"use client";
import Image from "next/image";
import { useState } from "react";

interface Props {
  onNext: () => void;
}

export default function Step2Document({ onNext }: Props) {
  const [documentType, setDocumentType] = useState("");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const validate = () => {
    if (!documentType) return alert("Select document type");
    if (!front || !back) return alert("Upload both sides");
    if (front.size > 10_000_000 || back.size > 10_000_000)
      return alert("Max 10MB per image");
    if (!confirmed) return alert("Please confirm declaration");
    onNext();
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#F6F3F1] py-6 sm:py-8">

      {/* Content */}
      <div className="w-full flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-3xl w-full text-center">

          {/* Title */}
          <h1 className="text-2xl md:text-[32px] font-['canela'] font-semibold text-[#3D1126] mb-3">
            Choose your identity document & Upload
          </h1>

          <p className="text-[#6D6D6D] text-sm sm:text-base font-poppins mb-8 sm:mb-12">
            Please select one valid government-issued document.
          </p>

          {/* Document Dropdown */}
          <div className="text-left mb-8 md:mb-10 w-full max-w-2xl mx-auto">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full bg-transparent border-b border-[#BDBDBD] pb-3 text-[#3D1126] focus:outline-none font-poppins text-sm sm:text-base"
            >
              <option value="">Select an identity document</option>
              <option value="passport">Passport</option>
              <option value="id">National ID Card</option>
              <option value="license">Driving License</option>
            </select>
            <p className="text-[11px] text-[#9A9A9A] mt-2">
              Make sure the document is valid and not expired.
            </p>
          </div>

          {/* Upload Section */}
          <div className="text-left mb-8 md:mb-10 w-full max-w-2xl mx-auto">
            <h3 className="text-[#3D1126] text-sm sm:text-base font-semibold mb-6">
              Upload your document
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Front */}
              <label className="group border-2 border-dashed border-[#DADADA] rounded-2xl p-6 sm:p-8 text-center cursor-pointer hover:border-[#3D1126] hover:bg-white/50 transition-all flex flex-col items-center">
                <div className="mb-3 w-12 h-12  flex items-center justify-center ">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_3742_18146)">
                      <path d="M25.8 13.3863C24.8933 8.78634 20.8533 5.33301 16 5.33301C12.1467 5.33301 8.8 7.51967 7.13333 10.7197C3.12 11.1463 0 14.5463 0 18.6663C0 23.0797 3.58667 26.6663 8 26.6663H25.3333C29.0133 26.6663 32 23.6797 32 19.9997C32 16.4797 29.2667 13.6263 25.8 13.3863ZM18.6667 17.333V22.6663H13.3333V17.333H9.33333L15.5333 11.133C15.8 10.8663 16.2133 10.8663 16.48 11.133L22.6667 17.333H18.6667Z" fill="#323232" />
                    </g>
                    <defs>
                      <clipPath id="clip0_3742_18146">
                        <rect width="32" height="32" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>

                </div>
                <p className="text-sm font-medium text-[#3D1126] mb-4">
                  {front ? front.name : "Upload front side"}
                </p>

                <div className="flex items-center gap-2 bg-transparent border border-[#3D1126] text-[#3D1126] px-4 py-2 rounded-lg text-xs font-medium transition-transform active:scale-95">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.66665 10.6665H9.33331C9.69998 10.6665 9.99998 10.3665 9.99998 9.99982V6.66648H11.06C11.6533 6.66648 11.9533 5.94648 11.5333 5.52648L8.47331 2.46648C8.21331 2.20648 7.79331 2.20648 7.53331 2.46648L4.47331 5.52648C4.05331 5.94648 4.34665 6.66648 4.93998 6.66648H5.99998V9.99982C5.99998 10.3665 6.29998 10.6665 6.66665 10.6665ZM3.99998 11.9998H12C12.3666 11.9998 12.6666 12.2998 12.6666 12.6665C12.6666 13.0332 12.3666 13.3332 12 13.3332H3.99998C3.63331 13.3332 3.33331 13.0332 3.33331 12.6665C3.33331 12.2998 3.63331 11.9998 3.99998 11.9998Z" fill="#323232" />
                  </svg>

                  Choose File
                </div>

                <input
                  type="file"
                  hidden
                  accept="image/png,image/jpeg"
                  onChange={(e) => setFront(e.target.files?.[0] || null)}
                />
              </label>

              {/* Back */}
              <label className="group border-2 border-dashed border-[#DADADA] rounded-2xl p-6 sm:p-8 text-center cursor-pointer hover:border-[#3D1126] hover:bg-white/50 transition-all flex flex-col items-center">
                <div className="mb-3 w-12 h-12  flex items-center justify-center ">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_3742_18146)">
                      <path d="M25.8 13.3863C24.8933 8.78634 20.8533 5.33301 16 5.33301C12.1467 5.33301 8.8 7.51967 7.13333 10.7197C3.12 11.1463 0 14.5463 0 18.6663C0 23.0797 3.58667 26.6663 8 26.6663H25.3333C29.0133 26.6663 32 23.6797 32 19.9997C32 16.4797 29.2667 13.6263 25.8 13.3863ZM18.6667 17.333V22.6663H13.3333V17.333H9.33333L15.5333 11.133C15.8 10.8663 16.2133 10.8663 16.48 11.133L22.6667 17.333H18.6667Z" fill="#323232" />
                    </g>
                    <defs>
                      <clipPath id="clip0_3742_18146">
                        <rect width="32" height="32" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>

                </div>
                <p className="text-sm font-medium text-[#3D1126] mb-4">
                  {back ? back.name : "Upload back side"}
                </p>

                <div className="flex items-center gap-2 bg-transparent border border-[#3D1126] text-[#3D1126] px-4 py-2 rounded-lg text-xs font-medium transition-transform active:scale-95">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.66665 10.6665H9.33331C9.69998 10.6665 9.99998 10.3665 9.99998 9.99982V6.66648H11.06C11.6533 6.66648 11.9533 5.94648 11.5333 5.52648L8.47331 2.46648C8.21331 2.20648 7.79331 2.20648 7.53331 2.46648L4.47331 5.52648C4.05331 5.94648 4.34665 6.66648 4.93998 6.66648H5.99998V9.99982C5.99998 10.3665 6.29998 10.6665 6.66665 10.6665ZM3.99998 11.9998H12C12.3666 11.9998 12.6666 12.2998 12.6666 12.6665C12.6666 13.0332 12.3666 13.3332 12 13.3332H3.99998C3.63331 13.3332 3.33331 13.0332 3.33331 12.6665C3.33331 12.2998 3.63331 11.9998 3.99998 11.9998Z" fill="#323232" />
                  </svg>

                  Choose File
                </div>

                <input
                  type="file"
                  hidden
                  accept="image/png,image/jpeg"
                  onChange={(e) => setBack(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <p className="text-[11px] text-[#9A9A9A] mt-5 italic">
              * Upload clear photos of your chosen document. All details must be visible.
            </p>
          </div>

          {/* File Requirements */}
          <div className="bg-[#EEEAE7] rounded-2xl p-6 text-left mb-8 md:mb-10 w-full max-w-2xl mx-auto shadow-sm">
            <h4 className="text-sm font-bold text-[#3D1126] mb-4 uppercase tracking-wider">File Requirements</h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6D6D6D]">Accepted formats :</span>
                <span className="text-[#3D1126] font-semibold">JPG, PNG</span>
              </div>

              <div className="w-full h-px bg-[#D9D9D9]" />

              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6D6D6D]">Maximum size :</span>
                <span className="text-[#3D1126] font-semibold">10 MB per image</span>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="flex items-center justify-center gap-3 mb-10 w-full max-w-2xl mx-auto px-1">
            <input
              type="checkbox"
              id="declaration"
              checked={confirmed}
              onChange={() => setConfirmed(!confirmed)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#3D1126] focus:ring-[#1A1A1A]"
            />
            <label htmlFor="declaration" className="text-sm text-[#3D1126] text-left leading-snug cursor-pointer">
              I confirm that the information provided is accurate and belongs to me.
            </label>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center w-full">
            <button
              onClick={validate}
              className="bg-[#1A1A1A] text-[#ffffff] w-full max-w-xl py-4 rounded-xl text-base font-medium shadow-md hover:bg-[#1E1B21] transition-all active:scale-[0.98]"
            >
              Continue
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 md:mt-16 space-y-2">
            <p className="text-[#6D6D6D] text-xs sm:text-sm">
              Your documents are encrypted and used only for identity verification
            </p>

            <p className="text-[#6D6D6D] text-xs sm:text-sm">
              Having trouble?{" "}
              <button className="underline text-[#3D1126] font-medium hover:text-black transition-colors">
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
