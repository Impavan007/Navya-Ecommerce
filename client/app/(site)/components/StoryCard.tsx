"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface StoryCardProps {
  id?: string;
  imageSrc: string;
  title: string;
  author: string;
}

export default function StoryCard({
  id,
  imageSrc,
  title,
  author,
}: StoryCardProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc || "/Images/premium_b2b_textiles.png");

  const Card = (
    <div className="relative w-full h-[461px] overflow-hidden bg-white">

      {/* Image */}
      <div className="relative w-full h-[379px]">
        <Image
          src={currentImageSrc}
          alt={title}
          fill
          className="object-cover object-top"
          unoptimized
          onError={() => setCurrentImageSrc("/Images/premium_b2b_textiles.png")}
        />
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 h-[82px] bg-[#F3D6DC] flex flex-col items-center justify-center px-4 text-center">

        <p className="font-['Canela'] text-[20px] leading-[26px] text-[#3D1126] line-clamp-1">
          {title}
        </p>

        <p className="font-poppins text-[13px] leading-[18px] text-[#3D1126] mt-1">
          By {author}
        </p>

      </div>
    </div>
  );

  return id ? <Link href={`/stories/${id}`}>{Card}</Link> : Card;
}
