"use client";

import Image from "next/image";
import ProductCard from "./ProductCard";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { productsApiService } from "../services/api/products";
import type { ApiProduct } from "../types/api";
import { ShimmerWrapper, ShimmerProductGrid } from "./Shimmer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import PrimaryButton from "./PrimaryButton";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await productsApiService.getFeaturedProducts();

      if (response.success && response.data) {
        setProducts(response.data.products);
      } else {
        setError(response.message || "Failed to fetch featured products");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch featured products");
    } finally {
      setLoading(false);
    }
  };

  const handleSlideChange = () => {
    if (swiperRef.current) {
      setIsBeginning(swiperRef.current.isBeginning);
      setIsEnd(swiperRef.current.isEnd);
    }
  };

  const handlePrevClick = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNextClick = () => {
    swiperRef.current?.slideNext();
  };

  const transformProduct = (product: ApiProduct) => ({
    id: product.id,
    imageSrc:
      product.cover_image || product.images?.[0] || "/assets/product-1.jpg",
    productName: product.name,
    price: `Rs.${product.rentalPrice}`,
    sizes: product.size.join(", "),
    brand: product.brand,
    rating: product.rating,
    rating_count: product.rating_count,
  });

  return (
    <div
      className="bg-[#FFFCF8] w-full mx-auto py-12 md:py-20 px-6 md:px-10 lg:px-12 border-b border-[#E8E3DD]"
      id="featured-products"
    >
      <div className="flex flex-col gap-10 items-center w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="w-full flex items-center justify-between">
          <h2
            className="font-serif font-bold text-3xl md:text-5xl text-[#18181B] tracking-tight"
          >
            Featured Products
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevClick}
              disabled={isBeginning}
              className={`bg-[#F8F4EF] border border-[#E8E3DD] p-3 rounded-full transition-all duration-300 ${isBeginning
                ? "opacity-40 cursor-not-allowed"
                : "opacity-100 hover:bg-[#C8A96A] hover:text-white hover:border-[#C8A96A] cursor-pointer"
                }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handleNextClick}
              disabled={isEnd}
              className={`bg-[#F8F4EF] border border-[#E8E3DD] p-3 rounded-full transition-all duration-300 ${isEnd
                ? "opacity-40 cursor-not-allowed"
                : "opacity-100 hover:bg-[#C8A96A] hover:text-white hover:border-[#C8A96A] cursor-pointer"
                }`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Swiper Section */}
        <div className="w-full px-0">
          <ShimmerWrapper
            isLoading={loading}
            shimmerComponent={<ShimmerProductGrid count={4} />}
          >
            {error ? (
              <div className="flex justify-center items-center py-8 w-full">
                <div className="text-red-600">Error: {error}</div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex justify-center items-center py-8 w-full">
                <div className="text-[#3D1126]">
                  No featured products available
                </div>
              </div>
            ) : (
              <Swiper
                modules={[Navigation]}
                spaceBetween={27}
                slidesPerView={4}
                navigation={false}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  handleSlideChange();
                }}
                onSlideChange={handleSlideChange}
                breakpoints={{
                  320: { slidesPerView: 1, spaceBetween: 10 },
                  640: { slidesPerView: 2, spaceBetween: 20 },
                  1024: { slidesPerView: 4, spaceBetween: 27 },
                  1536: { slidesPerView: 4, spaceBetween: 30 },
                  1800: { slidesPerView: 4, spaceBetween: 30 },
                  2200: { slidesPerView: 5, spaceBetween: 35 },
                  2400: { slidesPerView: 'auto', spaceBetween: 35 },
                }}
                className="w-full"
              >
                {products.map((product, index) => (
                  <SwiperSlide
                    key={product.id || index}
                    className="
        min-[1600px]:!w-[380px]
        min-[1800px]:!w-[430px]
        min-[2200px]:!w-[500px]
        min-[2400px]:!w-[580px]
      "
                  >
                    <ProductCard
                      {...transformProduct(product)}
                      className="
         

          [&_.product-card-image-container]:min-[1536px]:aspect-[3/4]
          [&_.product-card-image-container]:min-[1800px]:aspect-[3/4]
        "
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </ShimmerWrapper>
        </div>

        {/* Browse More Button */}
        <div className="w-full flex justify-center mt-6">
          <button
            onClick={() => router.push("/productPage")}
            className="bg-[#18181B] text-[#FFFCF8] hover:bg-[#C8A96A] hover:text-white transition-all duration-300 rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-xs"
          >
            View All Products →
          </button>
        </div>
      </div>
    </div >
  );
}
