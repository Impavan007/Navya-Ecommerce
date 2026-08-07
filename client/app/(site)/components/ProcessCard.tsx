"use client";

import Image from "next/image";
import { useState } from "react";

interface ProcessCardProps {
  imageSrc: string;
  title: string;
  description: string;
}

export default function ProcessCard({
  imageSrc,
  title,
  description,
}: ProcessCardProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc || "/assets/arrow-right.svg");

  return (
    <div className="
      bg-white rounded-2xl border border-[#E8E3DD] flex flex-col items-start self-stretch p-6 sm:p-8 gap-6 w-full flex-1 shadow-xs hover:shadow-md hover:border-[#C8A96A] transition-all duration-300
    ">
      {/* Icon */}
      <div className="
        flex items-center justify-center
        w-12 h-12 rounded-xl bg-[#F8F4EF] p-2.5 border border-[#E8E3DD]
      ">
        <Image
          src={currentImageSrc}
          alt={title}
          width={40}
          height={40}
          className="object-contain w-full h-full"
          onError={() => setCurrentImageSrc("/assets/arrow-right.svg")}
        />
      </div>

      <div className="flex flex-col items-start p-0 w-full gap-3">
        {/* Title */}
        <h3 className="font-serif font-bold text-[#18181B] text-xl leading-snug self-stretch">
          {title}
        </h3>

        {/* Description */}
        <p className="font-sans font-normal text-[#4B5563] text-sm leading-relaxed self-stretch">
          {description}
        </p>
      </div>
    </div>
  );
}
