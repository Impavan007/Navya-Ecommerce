"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const [heroImage] = useState("/Images/ChatGPT%20Image%20Aug%207,%202026,%2005_43_51%20PM.png");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const slideContent = {
    title: "Source Premium <br /> Textiles Globally",
    subtitle:
      "Connect with top-tier fabric suppliers and <br /> manufacturers for your B2B production needs.",
  };

  useEffect(() => {
    setIsImageLoaded(true);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
        delay: 0.3,
      },
    },
  };

  return (
    <div className="overflow-hidden relative w-full bg-[#FAF6F3] aspect-[16/9] min-h-[240px] min-[768px]:aspect-auto min-[768px]:h-[720px] min-[800px]:h-[800px] min-[1500px]:h-screen">
      {/* Background image - Aspect Ratio Preserved on Mobile, Full Size on Laptop & Desktop */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Hero Background - Premium B2B Textiles"
          fill
          className={`object-cover object-top ${isImageLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
          priority
          unoptimized
          sizes="100vw"
          onLoad={() => setIsImageLoaded(true)}
        />
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
        )}
      </div>

      {/* Text block positioned right next to the model */}
      {isImageLoaded && (
        <motion.div
          className="absolute z-20 top-[22%] left-[54%] md:top-[38%] md:left-[55%] lg:left-[60%] xl:left-[65%] max-w-[42vw] md:max-w-[38vw] lg:max-w-[30vw] xl:max-w-[28vw] pr-2 sm:pr-4"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="flex flex-col gap-[1.5vw] md:gap-5 items-start w-full">
            <div className="flex flex-col gap-[0.8vw] md:gap-3 items-start w-full">
              {/* TITLE */}
              <motion.h1
                className="font-serif font-medium text-[#1E1E1E] m-0 text-left leading-[1.08] w-full text-[4vw] sm:text-[3.5vw] md:text-[32px] lg:text-[40px] xl:text-[48px] whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                dangerouslySetInnerHTML={{ __html: slideContent.title }}
              />

              {/* SUBTITLE */}
              <motion.p
                className="font-sans font-normal text-[#373737] m-0 text-left leading-relaxed w-full text-[1.5vw] sm:text-[1.2vw] md:text-sm lg:text-base xl:text-lg max-w-max whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                dangerouslySetInnerHTML={{ __html: slideContent.subtitle }}
              />
            </div>

            {/* CTA BUTTON */}
            <div className="flex items-center mt-[0.5vw] md:mt-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <button
                  onClick={() => router.push('/productPage')}
                  className="bg-[#18181B] text-[#FFFCF8] hover:bg-[#C8A96A] hover:text-white transition-all duration-300 rounded-full px-[2.5vw] py-[1.2vw] text-[1.4vw] sm:px-6 sm:py-2.5 sm:text-xs md:px-8 md:py-3.5 md:text-sm lg:px-10 lg:py-4 lg:text-base font-semibold tracking-wider uppercase shadow-md hover:shadow-xl cursor-pointer whitespace-nowrap"
                >
                  Explore Fabrics →
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
