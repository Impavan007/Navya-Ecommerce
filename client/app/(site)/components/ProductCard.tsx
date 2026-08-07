"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "../stores/wishlistStore";
import { StarIcon, StarOutlineIcon } from "../icons/icons";
import { useAuthStore } from "../stores/authStore";
import { useWaitlistPopup } from "../hooks/useWaitlistPopup";

interface ProductCardProps {
  id?: string;
  imageSrc: string;
  productName: string;
  price: string;
  sizes: string;
  brand: string;
  rating?: number;
  rating_count?: number;
  className?: string;
}

export default function ProductCard({
  id = "1",
  imageSrc,
  productName,
  price,
  sizes,
  brand,
  rating = 4,
  rating_count = 0,
  className = "",
}: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist, isLoading } =
    useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { openPopup } = useWaitlistPopup();
  
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc || "/Images/premium_b2b_textiles.png");

  // Check if this product is in wishlist
  const isLiked = isInWishlist(id);
  const isProductLoading = isLoading(id);

  // Encode product data in URL params
  const productUrl = `/product/${id}?image=${encodeURIComponent(imageSrc)}&productName=${encodeURIComponent(productName)}&brand=${encodeURIComponent(brand)}&price=${encodeURIComponent(price)}&sizes=${encodeURIComponent(sizes)}&rating=${rating}`;

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openPopup();
      return;
    }

    if (isProductLoading) return; // Prevent multiple clicks during loading

    try {
      if (isLiked) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  return (
    <Link
      href={productUrl}
      className={`group flex flex-col bg-white rounded-2xl border border-[#E8E3DD] hover:border-[#C8A96A] transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md cursor-pointer ${className}`}
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F8F4EF]">
        <Image
          src={currentImageSrc}
          alt={brand}
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
          unoptimized
          onError={() => setCurrentImageSrc("/Images/premium_b2b_textiles.png")}
        />
        <button
          onClick={handleLikeClick}
          disabled={isProductLoading}
          className={`absolute bg-white/80 backdrop-blur-xs hover:bg-white text-[#18181B] right-3 top-3 rounded-full size-9 flex items-center justify-center transition-all shadow-xs ${isProductLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          <div className="size-4 flex items-center justify-center">
            {isLiked ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#C0392B]"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#18181B]"
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

      <div className="flex flex-col p-4 gap-2 w-full">
        {/* Brand & Rating */}
        <div className="flex items-center justify-between w-full text-xs font-sans text-[#7C7C7C]">
          <span className="uppercase font-semibold tracking-wider text-[#C8A96A]">{brand}</span>
          <div className="flex items-center gap-1">
            <StarIcon size={12} color="#C8A96A" />
            <span className="font-medium text-[#18181B]">{rating}</span>
            <span>({rating_count})</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-serif font-semibold text-base text-[#18181B] truncate leading-tight group-hover:text-[#C8A96A] transition-colors">
          {productName}
        </h3>

        {/* Sizes & Price */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E3DD]/60 mt-1">
          <span className="text-xs font-sans text-[#7C7C7C] font-medium">{sizes}</span>
          <div className="flex items-center gap-1.5 text-xs font-sans">
            <span className="text-[#7C7C7C]">Price</span>
            <span className="font-bold text-sm text-[#18181B]">{price} <span className="font-normal text-xs text-[#7C7C7C]">/ meter</span></span>
          </div>
        </div>
      </div>
    </Link>
  );
}
