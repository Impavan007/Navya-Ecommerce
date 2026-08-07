"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { waitlistApiService } from "../services/api/waitlist";
import { useAuthStore } from "../stores/authStore";
import {
  BecomeAlenderEmailIcon,
  FormEnterNameIcon,
  JoinNavyaaIcon1,
  JoinNavyaaIcon2,
  JoinNavyaaIcon3,
} from "../icons/icons";

interface BecomeLenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BecomeLenderModal({ isOpen, onClose }: BecomeLenderModalProps) {
  const { user, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({ name: "", email: "", city: "", PostalCode: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill from auth
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || prev.name,
        email: user.email,
      }));
    }
  }, [isAuthenticated, user]);

  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim())  { toast.error("Please enter your full name"); return; }
    if (!formData.email.trim()) { toast.error("Please enter your email"); return; }
    if (!formData.city.trim())  { toast.error("Please enter your city"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address"); return;
    }
    try {
      setIsSubmitting(true);
      const response = await waitlistApiService.createWaitlist({
        name: formData.name.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
        PostalCode: formData.PostalCode.trim(),
      });
      if (response.success) {
        toast.success(response.message || "Successfully joined the waitlist!");
        setFormData((prev) => ({ name: isAuthenticated ? prev.name : "", email: prev.email, city: "", PostalCode: "" }));
        onClose();
      } else {
        toast.error(response.message || "Failed to join waitlist. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div
              className="bg-white w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col lg:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-gray-100 transition-colors shadow-sm"
              >
                <X size={18} className="text-gray-600" />
              </button>

              {/* ── LEFT PANEL ── */}
              <div className="hidden lg:flex lg:w-[45%] bg-[#E7C8CC] px-10 py-12 flex-col justify-between flex-shrink-0">
                <div>
                  <h2 className="font-[canela] text-[48px] leading-[56px] text-[#3D1126] font-semibold">
                    Sell your fashion<br />on Navyaa<br />today.
                  </h2>
                  <p className="mt-5 font-['Poppins'] text-[16px] leading-[28px] text-[#3D1126]">
                    List your fresh, curated fashion pieces and connect with
                    thousands of buyers across India — all on one platform.
                  </p>
                  <p className="mt-8 font-['canela'] text-[20px] text-[#3D1126] font-medium">
                    We&apos;re launching Navyaa in select cities across India.
                  </p>
                </div>

                {/* Illustration */}
                <div className="flex justify-center mt-10">
                  <Image
                    src="/assets/becomealender.svg"
                    alt=""
                    width={280}
                    height={252}
                    className="mix-blend-color-burn rounded-lg"
                  />
                </div>

                {/* Benefits */}
                <div className="flex items-center justify-center gap-6 mt-10 text-[#3C3C3C] text-sm font-poppins">
                  <div className="flex justify-center items-center gap-2">
                    <JoinNavyaaIcon1 />
                    <span className="text-[12px]">List products free</span>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <JoinNavyaaIcon2 />
                    <span className="text-[12px]">Reach pan-India</span>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <JoinNavyaaIcon3 />
                    <span className="text-[12px]">Grow your sales</span>
                  </div>
                </div>
              </div>

              {/* ── RIGHT PANEL: existing form ── */}
              <div className="w-full lg:w-[55%] px-6 py-10 sm:px-10 lg:p-14 overflow-y-auto">
                <div className="flex items-center justify-center mb-8">
                  <span className="font-serif tracking-[0.2em] text-3xl font-bold bg-gradient-to-r from-[#BFA15F] to-[#E5C9A4] bg-clip-text text-transparent uppercase select-none">
                    NAVYAA
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your Full Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full border-b border-[#E0E0E0] py-4 bg-transparent text-[#3D1126] placeholder:text-[#8A8A8A] focus:border-[#3D1126] outline-none font-['Poppins']"
                      required
                    />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A8A8A8]">
                      <FormEnterNameIcon />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full border-b border-[#E0E0E0] py-4 bg-transparent text-[#3D1126] placeholder:text-[#8A8A8A] focus:border-[#3D1126] outline-none font-['Poppins'] disabled:opacity-60"
                      required
                      disabled={!!(isAuthenticated && user?.email)}
                    />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A8A8A8]">
                      <BecomeAlenderEmailIcon />
                    </div>
                  </div>

                  {/* City + Postcode */}
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                    <div className="relative w-full sm:w-1/2">
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="w-full border-b border-[#E0E0E0] py-4 bg-transparent text-[#3D1126] placeholder:text-[#8A8A8A] focus:border-[#3D1126] outline-none font-['Poppins']"
                        required
                      />
                    </div>
                    <div className="w-full sm:w-1/2">
                      <input
                        type="text"
                        placeholder="Postcode"
                        value={formData.PostalCode}
                        onChange={(e) => handleInputChange("PostalCode", e.target.value)}
                        className="w-full border-b border-[#E0E0E0] py-4 bg-transparent text-[#3D1126] placeholder:text-[#A8A8A8] focus:border-[#3D1126] outline-none font-['Poppins']"
                        required
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 mt-6">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="modal-terms"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-[#323232] checked:bg-[#323232] checked:border-[#323232] transition-all rounded-lg"
                        required
                      />
                      <svg
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        viewBox="0 0 14 14" fill="none"
                      >
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <label htmlFor="modal-terms" className="text-xs text-[#8A8A8A] font-['Poppins'] leading-tight mt-0.5">
                      I accept the{" "}
                      <Link href="/terms" className="underline text-[#8A8A8A]">Terms of Service</Link>
                      {" "}and{" "}
                      <Link href="/privacy" className="underline text-[#8A8A8A]">Privacy Policy</Link>
                      {" "}and agree to receive Navyaa updates.
                    </label>
                  </div>

                  {/* Submit */}
                  <div className="flex items-center justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-[80%] mx-auto bg-[#1A1A1A] rounded-lg text-[#ffffff] py-4 font-['Poppins'] text-sm font-medium hover:bg-black/80 transition-all mt-4 disabled:opacity-60"
                    >
                      {isSubmitting ? "Submitting…" : "Join Waitlist"}
                    </button>
                  </div>

                  {/* Info note */}
                  <div className="flex flex-col items-center gap-10 w-full pt-2">
                    <div className="xl:w-[90%] w-full bg-[#F3D6DC] p-5 rounded-xl flex items-start sm:items-center justify-center gap-4">
                      <div className="shrink-0 mt-1 sm:mt-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg">
                          <circle cx="10" cy="10" r="9" stroke="#3C3C3C" strokeWidth="1.2" />
                          <path d="M10 5V11" stroke="#3C3C3C" strokeWidth="1.2" strokeLinecap="round" />
                          <path d="M10 14V14.5" stroke="#3C3C3C" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="font-['Poppins'] text-sm text-[#5F5C54] leading-relaxed">
                        We&apos;ll send you a confirmation email once your seller account is approved and ready to go.
                      </p>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
