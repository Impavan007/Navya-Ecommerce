"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import CategoryCard from "./CategoryCard";
import { categoriesApiService } from "../services/api/categories";
import type { Category } from "../types/api";
import { ShimmerWrapper, ShimmerCategoryGrid } from "./Shimmer";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ExploreByCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const swiperRef = useRef<any>(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoriesApiService.getAllCategories();

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.message || "Failed to fetch categories");
        console.error("Failed to fetch categories:", response.message);
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      setError(error.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Transform API category to CategoryCard props
  const transformCategory = (category: Category) => ({
    id: category._id,
    imageSrc: category.image || "/assets/category-1.png", // Fallback image
    title: category.name,
    description: category.description || "Explore the new Season Arrivals"
  });

  return (
    <div className="bg-[#FAF6F3] box-border content-stretch flex flex-col gap-[8px] items-start overflow-clip p-0 md:p-[40px] relative w-full max-w-[1440px]">
      <div className="content-stretch flex flex-col gap-[32px] items-center relative w-full">
      <div
  className="
    box-border text-center content-stretch
    flex gap-[8px] items-center justify-center
    p-[8px] relative shrink-0
    w-full max-w-[1180px]

    md:ml-2        /* tablet only */
    lg:ml-0        /* reset on laptop & desktop */
  "
>
  <p
    className="
      basis-0 grow
      font-['Playfair_Display'] font-normal
      leading-[32px] sm:leading-[40px] md:leading-[48px]
      text-[28px] sm:text-[36px] md:text-[48px]
      text-black
      text-center sm:text-left
    "
  >
    Explore By Category
  </p>
</div>

        <div className="content-stretch flex flex-col gap-0  md:gap-[40px] items-center relative w-full">
          <div className="content-stretch flex gap-0 md:gap-[32px] items-center relative w-full">
            {/* Left Arrow */}
            <button 
              onClick={() => swiperRef.current?.slidePrev()}
              className="bg-white box-border content-stretch flex gap-[8px] items-center overflow-clip p-[15px] relative rounded-[100px] shrink-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-center relative shrink-0 rotate-180">
                <div className="relative size-[20px]">
                  <Image
                    src="/assets/arrow-right.svg"
                    alt="Previous"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
            </button>

            {/* Category Cards */}
            <ShimmerWrapper
              isLoading={loading}
              shimmerComponent={<ShimmerCategoryGrid count={3} />}
            >
              <div className="basis-0 content-stretch flex grow items-center min-h-px min-w-px relative shrink-0">
                {error ? (
                  <div className="flex justify-center items-center py-8 w-full">
                    <div className="text-black text-center">
                      <h3 className="text-lg font-semibold mb-2">Error Loading Categories</h3>
                      <p>{error}</p>
                      <button 
                        onClick={fetchCategories}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="flex justify-center items-center py-8 w-full">
                    <div className="text-[#3D1126]">No categories available</div>
                  </div>
                ) : (
                  <Swiper
                    modules={[Navigation]}
                    spaceBetween={27}
                    slidesPerView={3}
                    navigation={false}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    className="w-full"
                    breakpoints={{
                     0: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    640: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 2,   // ✅ tablet → 2 cards
      spaceBetween: 24,
    },
    1024: {
      slidesPerView: 2,   // ✅ laptop & desktop → 3 cards
      spaceBetween: 27,
    },
    1280: {
      slidesPerView: 3,   // ✅ laptop & desktop → 3 cards
      spaceBetween: 27,
    },
                    }}
                  >
                    {categories.map((category, index) => (
                      <SwiperSlide key={category._id || index}>
                        <CategoryCard {...transformCategory(category)} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </ShimmerWrapper>

            {/* Right Arrow */}
            <button 
              onClick={() => swiperRef.current?.slideNext()}
              className="flex items-center justify-center relative shrink-0 rotate-180 hover:opacity-80 transition-opacity"
            >
              <div className="bg-white box-border content-stretch flex gap-[8px] items-center overflow-clip p-[15px] relative rounded-[100px] hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-center relative shrink-0 rotate-180">
                  <div className="relative size-[20px]">
                    <Image
                      src="/assets/arrow-right.svg"
                      alt="Next"
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}