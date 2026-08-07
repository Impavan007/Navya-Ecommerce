"use client";

import React from "react";

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

// Base shimmer component
export const Shimmer: React.FC<ShimmerProps> = ({ className = "", children }) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}>
      {children}
    </div>
  );
};

// Shimmer for text lines
interface ShimmerTextProps {
  lines?: number;
  className?: string;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({ lines = 1, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Shimmer
          key={index}
          className={`h-4 rounded ${index === lines - 1 ? "w-3/4" : "w-full"
            }`}
        />
      ))}
    </div>
  );
};

// Shimmer for product cards
export const ShimmerProductCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`border border-[#6d6d6d] border-solid ${className}`}>
      <div className="p-[20px]">
        <div className="flex gap-[20px] items-center">
          {/* Product Image Shimmer */}
          <Shimmer className="w-[80px] h-[80px] rounded" />

          {/* Product Details Shimmer */}
          <div className="flex gap-[341px] items-start flex-1">
            <div className="flex flex-col gap-[4px] w-[188px]">
              <Shimmer className="h-6 w-full rounded" />
              <Shimmer className="h-4 w-3/4 rounded" />
            </div>

            {/* Price Shimmer */}
            <Shimmer className="h-6 w-32 rounded" />

            {/* Delete Button Shimmer */}
            <div className="flex flex-col gap-[7px] items-end w-[178px]">
              <Shimmer className="w-[24px] h-[24px] rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shimmer for wishlist items
export const ShimmerWishlistItems: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="flex flex-col gap-[20px] w-full">
      {Array.from({ length: count }).map((_, index) => (
        <ShimmerProductCard key={index} />
      ))}
    </div>
  );
};

// Shimmer for product cards (grid layout)
// Individual Product Item Shimmer
export const ShimmerProductItem: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col gap-[16px] items-start relative shrink-0 w-full ${className}`}>
      {/* Image Shimmer with correct aspect ratio */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded">
        <Shimmer className="absolute inset-0 w-full h-full" />
      </div>

      {/* Content Shimmer */}
      <div className="flex flex-col gap-[8px] items-start w-full">
        <div className="border-[#d5d5d5] border-b border-solid flex flex-col gap-[4px] items-start pb-[24px] pt-0 px-0 w-full">
          <div className="flex items-center justify-between w-full">
            <Shimmer className="h-6 w-32 rounded" />
          </div>
          <div className="flex items-center justify-between w-full">
            <Shimmer className="h-4 w-24 rounded" />
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <Shimmer className="h-5 w-20 rounded" />
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, starIndex) => (
              <Shimmer key={starIndex} className="w-4 h-4 rounded" />
            ))}
            <Shimmer className="w-8 h-4 rounded ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Shimmer for product cards (grid layout)
export const ShimmerProductGrid: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 4, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] lg:gap-[32px] w-full ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ShimmerProductItem key={index} />
      ))}
    </div>
  );
};


// Shimmer for search bar
export const ShimmerSearchBar: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex justify-end ${className}`}>
      <div className="border-b border-black border-solid flex gap-[16px] items-center w-[364px]">
        <Shimmer className="flex-1 h-6 rounded" />
        <Shimmer className="w-[40px] h-[40px] rounded" />
      </div>
    </div>
  );
};

// Shimmer for pagination
export const ShimmerPagination: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex gap-[6px] items-start ${className}`}>
      <Shimmer className="h-[36px] w-16 rounded" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Shimmer key={index} className="h-[36px] w-8 rounded" />
      ))}
      <Shimmer className="h-[36px] w-16 rounded" />
    </div>
  );
};

// Shimmer for category cards
export const ShimmerCategoryCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`basis-0 content-stretch flex flex-col gap-[12px] grow items-start min-h-px min-w-px relative shrink-0 w-[374px] ${className}`}>
      <Shimmer className="h-[389px] w-full rounded" />
      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
        <div className="border-[0px_0px_0.25px] border-black border-solid box-border content-stretch flex flex-col gap-[8px] items-start pb-[20px] pt-0 px-0 relative shrink-0 w-full">
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            <Shimmer className="h-6 w-32 rounded" />
          </div>
        </div>
        <div className="content-stretch flex gap-[150px] items-center relative shrink-0">
          <Shimmer className="h-6 w-48 rounded" />
        </div>
      </div>
      <Shimmer className="h-6 w-24 rounded" />
    </div>
  );
};

// Shimmer for category grid
export const ShimmerCategoryGrid: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = ""
}) => {
  return (
    <div className={`basis-0 content-stretch flex gap-[27px] grow items-center min-h-px min-w-px relative shrink-0 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ShimmerCategoryCard key={index} />
      ))}
    </div>
  );
};

// Shimmer for cart item card
export const ShimmerCartItemCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`bg-[#FAF6F3] border border-[#e3e3e3] border-solid box-border content-stretch flex flex-col gap-[24px] items-start p-[24px] relative shrink-0 w-full ${className}`}>
      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
        {/* Product Details */}
        <div className="border-[#d5d5d5] border-[0px_0px_0.7px] border-solid box-border content-stretch flex gap-[28px] items-start pb-[16px] pt-0 px-0 relative shrink-0 w-full">
          {/* Product Image */}
          <Shimmer className="h-[128px] w-[128px] rounded" />

          {/* Product Info */}
          <div className="basis-0 content-stretch flex flex-col grow h-[157px] items-start justify-between min-h-px min-w-px relative shrink-0">
            <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
              {/* Brand and Details */}
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[118px]">
                <Shimmer className="h-6 w-24 rounded" />
                <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0">
                  <Shimmer className="h-5 w-20 rounded" />
                  <Shimmer className="h-5 w-16 rounded" />
                  <Shimmer className="h-5 w-24 rounded" />
                </div>
              </div>

              {/* RRP */}
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
                <Shimmer className="h-6 w-8 rounded" />
                <Shimmer className="h-5 w-12 rounded" />
              </div>

              {/* Date */}
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[48px]">
                <Shimmer className="h-6 w-8 rounded" />
                <Shimmer className="h-5 w-16 rounded" />
              </div>

              {/* Total */}
              <div className="content-stretch flex flex-col gap-[16px] items-end relative shrink-0">
                <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
                  <Shimmer className="h-6 w-12 rounded" />
                  <Shimmer className="h-5 w-5 rounded" />
                </div>
                <Shimmer className="h-5 w-16 rounded" />
              </div>
            </div>

            {/* Action Links */}
            <div className="content-stretch flex gap-[24px] items-start relative shrink-0">
              <Shimmer className="h-5 w-8 rounded" />
              <Shimmer className="h-5 w-12 rounded" />
              <Shimmer className="h-5 w-20 rounded" />
            </div>
          </div>
        </div>

        {/* Lender Info */}
        <div className="content-stretch flex gap-[182px] items-center relative shrink-0 w-full">
          <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
              <Shimmer className="h-7 w-7 rounded-full" />
              <Shimmer className="h-6 w-24 rounded" />
            </div>
            {/* Top Lender Badge - conditional shimmer */}
            <Shimmer className="h-6 w-20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Shimmer for cart items list
export const ShimmerCartItems: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = ""
}) => {
  return (
    <div className={`content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ShimmerCartItemCard key={index} />
      ))}
    </div>
  );
};

// Shimmer for the entire Cart Page layout
export const ShimmerCartPage: React.FC = () => {
  return (
    <div className="w-full">
      <div className="bg-[#FAF6F3] box-border content-stretch flex flex-col gap-[32px] items-center overflow-clip pb-20 lg:pb-[104px] pt-[40px] px-[20px] sm:px-[24px] lg:px-[40px] relative shrink-0 w-full">
        {/* Cart Header Shimmer */}
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start py-0 relative shrink-0 w-full">
          <div className="flex items-center justify-between w-full">
            <Shimmer className="h-8 w-48 rounded" />
            <Shimmer className="h-10 w-32 rounded" />
          </div>
          <div className="bg-[#C7C7C7] h-px shrink-0 w-full" />
        </div>

        <div className="box-border content-stretch flex flex-col lg:flex-row gap-[20px] items-start pb-[100px] pt-0 relative shrink-0 w-full">
          {/* Left Column */}
          <div className="lg:basis-0 content-stretch flex flex-col gap-[20px] lg:grow items-end min-h-px min-w-px relative shrink-0 w-full lg:w-auto">
            {/* Address Shimmer */}
            <Shimmer className="w-full h-[76px] rounded" />
            <ShimmerCartItems count={3} />
          </div>
          {/* Right Column - Price Details Shimmer */}
          <div className="w-full lg:w-1/3">
            <Shimmer className="h-[430px] w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Shimmer for review list (generic rows)
export const ShimmerReviewList: React.FC<{ count?: number; className?: string }> = ({ count = 3, className = "" }) => {
  return (
    <div className={`content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-full p-4 border border-[#eee]">
          <Shimmer className="h-[14px] w-[40%] rounded mb-2" />
          <Shimmer className="h-[12px] w-[70%] rounded mb-2" />
          <Shimmer className="h-[12px] w-[55%] rounded" />
        </div>
      ))}
    </div>
  );
};

// Global shimmer wrapper for different layouts
interface ShimmerWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  shimmerComponent: React.ReactNode;
  className?: string;
}

export const ShimmerWrapper: React.FC<ShimmerWrapperProps> = ({
  isLoading,
  children,
  shimmerComponent,
  className = ""
}) => {
  if (isLoading) {
    return <div className={className}>{shimmerComponent}</div>;
  }

  return <>{children}</>;
};

// Shimmer for process cards (How It Works)
export const ProcessCardShimmer: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`bg-[#F3D6DC] p-[32px_24px] flex flex-col items-start gap-[32px] w-full md:w-[259.2px] h-full md:h-[343px] ${className}`}>
      <Shimmer className="w-[54px] h-[54px] rounded-lg" />
      <div className="flex flex-col items-start p-0 gap-[16px] w-full">
        <Shimmer className="h-[32px] w-3/4 rounded" />
        <div className="space-y-2 w-full">
          <Shimmer className="h-4 w-full rounded" />
          <Shimmer className="h-4 w-5/6 rounded" />
          <Shimmer className="h-4 w-4/6 rounded" />
        </div>
      </div>
    </div>
  );
};

// Shimmer for Hero Section (LandinPageSection3)
export const HeroSectionShimmer: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <section className={`w-full bg-[#F3D6DC] flex justify-center py-[80px] ${className}`}>
      <div className="w-full max-w-[1740px] px-4 md:px-8 lg:px-[80px] min-h-[640px] flex flex-col justify-center">
        <div className="flex flex-col lg:flex-row h-full gap-8 lg:gap-[48px]">
          {/* LEFT SIDE */}
          <div className="w-full lg:w-[35%] flex flex-col justify-start">
            <div className="flex flex-col justify-between gap-8">
              <div>z
                <Shimmer className="h-10 md:h-12 w-3/4 rounded mb-2" />
                <Shimmer className="h-10 md:h-12 w-1/2 rounded mb-6" />
                <Shimmer className="h-6 w-2/3 rounded mt-4" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Shimmer className="h-4 w-full rounded" />
                  <Shimmer className="h-4 w-full rounded" />
                  <Shimmer className="h-4 w-2/3 rounded" />
                </div>
                <div className="space-y-2">
                  <Shimmer className="h-4 w-full rounded" />
                  <Shimmer className="h-4 w-1/2 rounded" />
                </div>
              </div>
            </div>
          </div>
          {/* RIGHT SIDE */}
          <div className="w-full lg:w-[65%] h-full flex items-start justify-center lg:justify-end mt-8 lg:mt-0">
            <Shimmer className="w-full max-w-[800px] aspect-[800/493] rounded" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Shimmer for product detail information (right side)
export const ShimmerProductDetail: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col gap-[22px] w-full ${className}`}>
      {/* Header Info Shimmer (Lender info & Message button) */}
      <div className="flex flex-row w-full justify-between items-center gap-2">
        <div className="flex flex-row items-center gap-4">
          <Shimmer className="h-4 w-32 rounded" />
          <Shimmer className="h-6 w-24 rounded" />
        </div>
        <Shimmer className="h-10 w-36 rounded-lg" />
      </div>

      {/* Brand and Rating Shimmer */}
      <div className="flex flex-wrap gap-4 items-center">
        <Shimmer className="h-6 w-40 rounded" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Shimmer key={i} className="w-5 h-5 rounded" />
          ))}
        </div>
      </div>

      {/* Title and Description Shimmer */}
      <div className="flex flex-col gap-[12px] w-full">
        <div className="flex flex-col gap-2">
          <Shimmer className="h-10 w-full rounded-md" />
          <div className="space-y-2">
            <Shimmer className="h-5 w-full rounded" />
            <Shimmer className="h-5 w-5/6 rounded" />
          </div>
        </div>
        <Shimmer className="h-4 w-1/2 rounded italic" />
      </div>

      {/* Selection Box Shimmer (Pricing, Sizes, Dates) */}
      <div className="bg-white mt-4 flex flex-col gap-6 w-full py-6 px-7 border border-[#eee]">
        {/* Rent Selection */}
        <div className="flex gap-2 items-center">
          <Shimmer className="w-5 h-5 rounded-full" />
          <Shimmer className="h-6 w-16 rounded" />
        </div>

        {/* Pricing Info */}
        <div className="space-y-3">
          <Shimmer className="h-8 w-[60%] rounded" />
          <div className="flex gap-5">
            <Shimmer className="h-4 w-24 rounded" />
            <Shimmer className="h-4 w-24 rounded text-red-100" />
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-2">
          <Shimmer className="h-6 w-24 rounded" />
          <div className="flex gap-10 items-center">
            <Shimmer className="h-4 w-48 rounded" />
            <Shimmer className="h-4 w-20 rounded" />
          </div>
        </div>

        {/* Rental Period Banner */}
        <Shimmer className="h-[30px] w-full rounded bg-green-50" />

        {/* Rental Period Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
          {[...Array(4)].map((_, i) => (
            <Shimmer key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-[12px] w-full mt-2">
          <Shimmer className="h-12 w-full rounded-md" />
          <Shimmer className="h-12 w-full rounded-md bg-[#F3D6DC]/30" />
        </div>

        <Shimmer className="h-4 w-full rounded opacity-50" />
      </div>
    </div>
  );
};

// Shimmer for booking cards in BookingsPage
export const ShimmerBookingCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`border-[#6D6D6D] border-[0.25px] p-[16px] md:p-[20px] rounded-[4px] flex flex-col gap-[12px] w-full ${className}`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-[16px] md:gap-[24px] w-full">
        {/* Product Image and Details Group Shimmer */}
        <div className="flex flex-row items-center gap-[16px] md:gap-[20px] flex-1 w-full lg:w-auto">
          {/* Product Image Shimmer */}
          <Shimmer className="relative flex-shrink-0 w-[60px] h-[60px] md:w-[80px] md:h-[80px] lg:w-[100px] lg:h-[100px] rounded overflow-hidden" />

          {/* Product Details Group Shimmer */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-[12px] md:gap-[30px] lg:gap-[40px] flex-1 min-w-0">
            {/* Product Info Shimmer */}
            <div className="flex flex-col gap-[4px] min-w-0 sm:flex-1 md:max-w-[200px] lg:max-w-[240px]">
              <Shimmer className="h-5 w-3/4 rounded" />
              <Shimmer className="h-4 w-1/2 rounded" />
            </div>

            {/* Price and Date Shimmer */}
            <div className="min-w-0 sm:flex-1 md:max-w-[220px]">
              <Shimmer className="h-5 w-32 rounded" />
            </div>
          </div>
        </div>

        {/* Status Shimmer */}
        <div className="flex flex-col gap-[6px] md:gap-[8px] w-full lg:w-[220px] pt-3 lg:pt-0 border-t lg:border-t-0 border-[#eee] lg:border-none lg:items-end">
          <Shimmer className="h-5 w-full rounded lg:w-3/4" />
          <Shimmer className="h-4 w-3/4 rounded lg:w-1/2" />
        </div>
      </div>
    </div>
  );
};

// Shimmer for Renter Story page
export const ShimmerRenterStory: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF6F3]">
      {/* Breadcrumb Shimmer */}
      <div className="w-full h-12 flex items-center px-[20px] lg:px-[40px] pt-6 pb-3">
        <Shimmer className="h-4 w-64 rounded" />
      </div>

      <main className="flex-1 w-full mx-auto px-[20px] lg:px-[40px] py-8 md:py-12 lg:py-16">
        {/* Story Header Shimmer */}
        <header className="mb-10 md:mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-4xl w-full">
              <Shimmer className="h-10 w-3/4 rounded mb-4" />
              <div className="space-y-3">
                <Shimmer className="h-4 w-full rounded" />
                <Shimmer className="h-4 w-5/6 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shimmer className="h-6 w-12 rounded" />
              <Shimmer className="h-4 w-16 rounded" />
            </div>
          </div>
        </header>

        {/* Products Grid Shimmer */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <ShimmerProductItem key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// Shimmer for Lender Profile page
export const ShimmerLenderPage: React.FC = () => {
  return (
    <div className="bg-[#FAF6F3] min-h-screen w-full">
      {/* Breadcrumb Shimmer */}
      <div className="w-full h-12 flex items-center px-[20px] lg:px-[40px] pt-6 pb-3">
        <Shimmer className="h-4 w-48 rounded" />
      </div>

      {/* Lender Profile Header Shimmer */}
      <div className="w-full bg-[#F3D6DC]">
        <div className="mx-auto px-[20px] lg:px-[40px] py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
            {/* Profile Image Shimmer */}
            <Shimmer className="w-[280px] h-[280px] rounded shadow-sm shrink-0" />

            {/* Lender Info Shimmer */}
            <div className="flex-1 flex flex-col items-start pt-4 w-full">
              <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex flex-col gap-4 w-full lg:w-2/3">
                  <Shimmer className="h-12 w-3/4 rounded" />
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Shimmer key={i} className="w-5 h-5 rounded" />
                    ))}
                    <Shimmer className="h-4 w-16 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Shimmer className="w-4 h-4 rounded" />
                    <Shimmer className="h-4 w-32 rounded" />
                  </div>
                  <div className="space-y-2 mt-2">
                    <Shimmer className="h-4 w-full rounded" />
                    <Shimmer className="h-4 w-5/6 rounded" />
                  </div>
                  <Shimmer className="h-10 w-36 rounded mt-4" />
                </div>
                <Shimmer className="h-8 w-32 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content Shimmer */}
      <div className="px-[20px] lg:px-[40px] py-6 mx-auto w-full">
        <div className="flex items-center justify-between w-full mt-6 mb-10">
          <Shimmer className="h-6 w-32 rounded" />
          <div className="flex items-center gap-4">
            <Shimmer className="h-10 w-24 rounded lg:hidden" />
            <Shimmer className="h-10 w-40 rounded " />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Sidebar Filter Shimmer */}
          <aside className="w-full lg:w-[360px] flex flex-col gap-8 shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border-t border-gray-200 pt-6">
                <div className="flex justify-between mb-4">
                  <Shimmer className="h-6 w-32 rounded" />
                  <Shimmer className="h-4 w-4 rounded" />
                </div>
                {i === 3 ? (
                  <Shimmer className="h-[300px] w-full rounded" />
                ) : (
                  <div className="space-y-3">
                    <Shimmer className="h-8 w-full rounded" />
                    {i === 1 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <Shimmer key={j} className="h-10 w-16 rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </aside>

          {/* Product Grid Shimmer */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShimmerProductItem key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shimmer;
