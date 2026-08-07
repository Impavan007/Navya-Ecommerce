"use client";

import { useState } from "react";
import Image from "next/image";
import { StarIcon } from "../icons/icons";

interface ReviewCardProps {
  userName: string;
  userAvatar: string;
  rating: number;
  sizeRented: string;
  reviewTitle: string;
  timeAgo: string;
  isLastReview?: boolean;
}

export default function ReviewCard({
  userName,
  userAvatar,
  rating,
  sizeRented,
  reviewTitle,
  timeAgo,
  isLastReview = false
}: ReviewCardProps) {
  const [currentAvatar, setCurrentAvatar] = useState(userAvatar || "/assets/girl.jpg");

  ////
  return (
    <div className={`${!isLastReview ? "border-[#A8A8A8] border-b-[0.5px] border-solid" : ""} flex flex-col gap-[16px] py-[32px] w-full font-['Poppins']`}>
      <div className="flex flex-row items-start gap-[32px] md:gap-[100px] lg:gap-[200px] w-full">
        {/* Left Col: Avatar, Name, Stars */}
        <div className="flex items-center gap-[16px] shrink-0 min-w-[180px] md:min-w-[220px] lg:min-w-[260px]">
          <div className="relative rounded-full shrink-0 size-[56px] overflow-hidden">
            <Image
              src={currentAvatar}
              alt={userName}
              fill
              className="object-cover"
              unoptimized
              onError={() => setCurrentAvatar("/assets/girl.jpg")}
            />
          </div>
          <div className="flex flex-col gap-[4px]">
            <p className="font-bold text-[16px] text-black">
              {userName}
            </p>
            <div className="flex gap-[4px] items-center">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="size-[18px]">
                  <StarIcon 
                    size={18} 
                    color={index < rating ? "#000000" : "#d1d1d1"} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Title and Time */}
        <div className="flex flex-col gap-[4px] pt-[2px]">
          <p className="font-medium text-[#3D1126] text-[16px]">
            {reviewTitle}
          </p>
          <p className="text-[#6D6D6D] text-[14px]">
            {timeAgo}
          </p>
        </div>
      </div>

      {/* Bottom Row: Size */}
      <div className="w-full">
        <p className="text-[14px] text-black">
          Size rented : {sizeRented}
        </p>
      </div>
    </div>
  );
}

