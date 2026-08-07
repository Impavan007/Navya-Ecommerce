"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CategoryCardProps {
  id?: string;
  imageSrc: string;
  title: string;
  description?: string;
}

export default function CategoryCard({
  id,
  imageSrc,
  title,
  description = "Explore the new Season Arrivals"
}: CategoryCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc || "/Images/premium_b2b_textiles.png");

  // Create URL-friendly slug from title
  const slug = id || title.toLowerCase().replace(/\s+/g, '-');

  // Encode category data in URL params
  const categoryUrl = `/productPage?category=${slug}`;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Link href={categoryUrl} className="basis-0 content-stretch flex flex-col gap-[12px] grow items-start min-h-px min-w-px relative shrink-0 w-[374px] cursor-pointer hover:opacity-90 transition-opacity">
      <div className="h-[389px] overflow-clip relative shrink-0 w-full">
        <Image
          src={currentImageSrc}
          alt={title}
          fill
          className="object-cover object-top"
          unoptimized
          onError={() => setCurrentImageSrc("/Images/premium_b2b_textiles.png")}
        />
        <button
          onClick={handleLikeClick}
          className="absolute bg-white left-[314px] overflow-clip rounded-[100px] size-[40px] top-[20px] flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <div className="size-[20px] flex items-center justify-center">
            {isLiked ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-black"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-600"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            )}
          </div>
        </button>
      </div>
      <div className="flex flex-col w-full gap-3">
        {/* Title */}
        <p className="capitalize font-poppins font-medium text-[16px] leading-[24px] text-black border-b-[0.25px] border-gray-300 pb-4">
          {title}
        </p>

        {/* Divider (centered between title & description) */}


        {/* Description */}
        <p className="capitalize font-poppins text-[16px] leading-[24px] text-black">
          {description}
        </p>
      </div>

      <p className="underline [text-underline-position:from-font] capitalize decoration-solid font-poppins leading-[24px] not-italic relative shrink-0 text-[16px] text-black text-nowrap whitespace-pre">
        Explore Now
      </p>
    </Link>
  );
}

