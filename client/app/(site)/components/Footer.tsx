"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import apiServices from "../services/api";
import { FooterIcons1, FooterIcons2 } from "../icons/icons";
import { useSettings } from "../hooks/useSettings";
import { useWaitlistPopup } from "../hooks/useWaitlistPopup";
import { useAuthStore } from "../stores/authStore";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const { openPopup } = useWaitlistPopup();
  const { isAuthenticated } = useAuthStore();

  const handleSubscribe = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const response = await apiServices.newsletter.subscribe({ email });
      
      if (response && (response.success || response.message)) {
        
        toast.success(response.message || "Subscribed successfully!");
        setEmail("");
      } else {
        
        toast.error(response?.message || "Failed to subscribe");
      }
    } catch (error: any) {
      console.error('Newsletter Error:', error);
      toast.error(error.message || "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative w-full bg-[#18181B] text-[#F8F4EF] flex justify-center pt-12 pb-10 lg:pt-20 lg:pb-12 overflow-hidden border-t border-[#27272A]">
      {/* Editorial Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-4">
        <span className="font-serif tracking-[0.25em] text-[12vw] font-bold text-white opacity-[0.03] select-none uppercase">
          NAVYAA
        </span>
      </div>

      <div className="relative w-full max-w-7xl px-6 md:px-10 lg:px-12 flex flex-col justify-between gap-12">
        {/* Top Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1 */}
          <div>
            <h3 className="font-serif text-lg text-[#FFFCF8] mb-6 font-semibold tracking-wide">
              Navyaa Portal
            </h3>
            <div className="flex flex-col gap-3 text-sm text-[#7C7C7C] font-sans">
              <Link href="/#how-it-works" className="hover:text-[#C8A96A] transition-colors">Navyaa For Buyers</Link>
              <Link href="/?tab=lender#how-it-works" className="hover:text-[#C8A96A] transition-colors">Navyaa For Sellers</Link>
              <Link href="/productPage" className="hover:text-[#C8A96A] transition-colors">Finding The Right Fit</Link>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-serif text-lg text-[#FFFCF8] mb-6 font-semibold tracking-wide">
              Who We Are
            </h3>
            <div className="flex flex-col gap-3 text-sm text-[#7C7C7C] font-sans">
              <Link href="#" className="hover:text-[#C8A96A] transition-colors">Our Story</Link>
              <Link href="/pressPage" className="hover:text-[#C8A96A] transition-colors">Press</Link>
              <Link href="#" className="hover:text-[#C8A96A] transition-colors">Navyaa Creator Program</Link>
            </div>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-serif text-lg text-[#FFFCF8] mb-6 font-semibold tracking-wide">
              Support
            </h3>
            <div className="flex flex-col gap-3 text-sm text-[#7C7C7C] font-sans">
              <Link href="/Faq" className="hover:text-[#C8A96A] transition-colors">FAQ</Link>
              <Link href="/terms" className="hover:text-[#C8A96A] transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-[#C8A96A] transition-colors">Privacy Policy</Link>
            </div>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <h3 className="font-serif text-lg text-[#FFFCF8] mb-4 font-semibold tracking-wide">
              Newsletter
            </h3>
            <p className="text-xs text-[#7C7C7C] mb-4 leading-relaxed font-sans">
              Subscribe for exclusive couture drops, lender spot collections, and private event invites.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-[#27272A] border border-[#3F3F46] focus:border-[#C8A96A] rounded-full px-4 py-2.5 text-sm text-[#FFFCF8] placeholder:text-[#7C7C7C] outline-none transition-all"
                disabled={loading}
              />

              <button
                className="w-full bg-[#C8A96A] text-[#18181B] hover:bg-[#D8BC7E] font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#27272A] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-[#7C7C7C]">
          <p>© 2026 Navyaa Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-[#C8A96A] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#C8A96A] transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
