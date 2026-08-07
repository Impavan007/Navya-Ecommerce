"use client";

import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface HowItWorksStepProps {
  stepNumber: string;
  title: string;
  description: string;
  imageSrc: string;
  isMobile?: boolean;
}

export default function HowItWorksStep({
  stepNumber,
  title,
  description,
  imageSrc,
  isMobile = false,
}: HowItWorksStepProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc || "/Images/premium_b2b_textiles.png");
  const controls = useAnimation();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.25, // start animation when 25% of card visible
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  // Animations
  const scrollVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };
////
  const hoverVariants = {
    hover: { y: -30, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      ref={ref}
      className="relative size-full group overflow-hidden "
      initial={isMobile ? "hidden" : false}
      animate={isMobile ? controls : undefined}
      whileHover={!isMobile ? "hover" : undefined}
      variants={isMobile ? scrollVariants : undefined}
    >
      {/* Step number background */}
<div
  className="
    absolute top-0 z-20 pointer-events-none select-none
    right-3 translate-x-0
    sm:left-1/2 sm:-translate-x-1/2 sm:right-auto
  "
>
  <motion.p
    className="font-poppins font-thin text-[#3D1126] text-[25vw] lg:text-[420px] leading-none text-center"
    variants={!isMobile ? { hover: { color: "#E1DAC8" } } : undefined}
  >
    {stepNumber}
  </motion.p>

</div>


      {/* Image Reveal */}
      <motion.div
        className="absolute inset-0"
        initial={isMobile ? { opacity: 0 } : { opacity: 0, x: 0}}
        variants={
    isMobile
      ? {
          visible: {
            opacity: 1,
            transition: {
              duration: 0.8,
              ease: "easeOut",
            },
          },
        }
      : {
          hover: {
            opacity: 1,
            transition: {
              duration: 0.45,
              ease: "easeOut",
            },
          },
        }
  }
      >
        <Image
          src={currentImageSrc}
          alt={`Step ${stepNumber}`}
          fill
          className="object-cover"
          unoptimized
          onError={() => setCurrentImageSrc("/Images/premium_b2b_textiles.png")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </motion.div>

      {/* Text content */}
      <motion.div
        className="absolute flex flex-col gap-3 items-start px-6 sm:px-2 lg:left-[44px] lg:top-[476px] lg:w-[189px] text-left"
        variants={!isMobile ? hoverVariants : undefined}
      >
        <motion.h3
          className="font-['Playfair_Display']  text-[6vw] sm:text-[5vw] md:text-[28px] lg:text-[32px] leading-tight text-white lg:text-[#3D1126]"
          dangerouslySetInnerHTML={{ __html: title }}
          initial={{ color: isMobile ? "#ffffff" : "#3D1126" }}
          variants={!isMobile ? { hover: { color: "#FAF6F3" } } : undefined}
          transition={{ duration: 0.3 }}
        />
        <motion.p
          className="font-poppins text-[3.5vw] sm:text-[2.8vw] md:text-[16px] leading-[24px] text-white lg:text-[#3D1126]"
          initial={{ color: isMobile ? "#ffffff" : "#3D1126" }}
          variants={!isMobile ? { hover: { color: "#ffffff" } } : undefined}
          transition={{ duration: 0.3 }}
        >
          {description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}