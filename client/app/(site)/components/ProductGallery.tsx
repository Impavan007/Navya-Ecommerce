"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlistStore } from "../stores/wishlistStore";

interface ProductGalleryProps {
  images: string[];
  coverImage: string;
  productId?: string;
}

export default function ProductGallery({ images, coverImage, productId }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const { isInWishlist, addToWishlist, removeFromWishlist, isLoading } = useWishlistStore();

  const isLiked = productId ? isInWishlist(productId) : false;

  // Combine cover image with other images
  const allImages = [coverImage, ...images];

  const [validImages, setValidImages] = useState<Record<number, string>>({});

  const handleImageError = (index: number) => {
    setValidImages(prev => ({
      ...prev,
      [index]: "/Images/premium_b2b_textiles.png"
    }));
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;

    try {
      if (isLiked) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-[20px] items-start w-full lg:max-w-[751px]">

      {/* Thumbnails */}
      <div className="flex lg:flex-col flex-row w-full lg:w-[128px] gap-2 lg:gap-[20px] overflow-x-auto lg:overflow-visible py-2">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative shrink-0 h-[80px] sm:h-[100px] lg:h-[194px] w-[80px] sm:w-[100px] lg:w-[128px] cursor-pointer transition-all duration-200 ${selectedImage === index
              ? "opacity-100 ring-2 ring-black ring-offset-2"
              : "opacity-60 hover:opacity-80"
              }`}
          >
            <Image
              src={validImages[index] || image}
              alt={`Product ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
              onError={() => handleImageError(index)}
            />
            {/* Show cover badge for the first image */}
            {index === 0 && (
              <div className="absolute top-1 left-1 bg-black text-white text-xs px-1 py-0.5 rounded">
                Cover
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative lg:max-w-[603px] w-full h-[400px] sm:h-[500px] lg:h-[844px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full h-full"
          >
            <Image
              src={validImages[selectedImage] || allImages[selectedImage]}
              alt="Product"
              fill
              className="object-cover object-center"
              unoptimized
              priority={selectedImage === 0} // Prioritize loading cover image
              onError={() => handleImageError(selectedImage)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {selectedImage + 1} / {allImages.length}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          disabled={!productId}
          className={`absolute bg-white flex items-center justify-center right-6 top-4 p-2 rounded-full w-[60px] h-[60px] cursor-pointer hover:bg-gray-50 transition-colors ${!productId ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          <div className="relative flex items-center justify-center w-7 h-7">
            {isLiked ? (
              <svg
                width="30"
                height="30"
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
                width="30"
                height="30"
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
    </div>
  );
}