"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OfferBanner from "./OfferBanner";
import AIStylistChat from "./AIStylistChat";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Define routes that should not show Navbar and Footer
  const noNavRoutes = ["/auth", "/kyc"];
  const shouldHideNav = noNavRoutes.some((route) => pathname?.startsWith(route));

  return (
    <div className="relative w-full min-h-screen bg-[#FAF6F3]">
      <div className={`flex flex-col w-full ${!shouldHideNav ? 'pt-[70px] md:pt-[91px]' : ''}`}>
        {!shouldHideNav && (
          <>
            <Navbar />
            <OfferBanner />
          </>
        )}
        {children}
        {!shouldHideNav && (
          <>
            <Footer />
            <AIStylistChat />
          </>
        )}
      </div>
    </div>
  );
}
