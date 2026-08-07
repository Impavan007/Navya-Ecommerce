"use client";

import { useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import ProtectedRoute from "../../components/ProtectedRoute";
import PrimaryButtonLight from "../../components/PrimaryButtonLight";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { userApiService } from "../../services/api/user";
import { toast } from "react-hot-toast";
import { StarIcon } from "../../icons/icons";

interface ReviewPageProps {
  params: {
    id: string;
  };
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const { id: productId } = params; // product id from route
  const search = useSearchParams();
  // 'order' should be the Mongo ObjectId (orderInternalId) per API contract
  let orderId = search.get('order') || '';
  const router = useRouter();
  let lenderId = search.get('lender') || '';
  const name = decodeURIComponent(search.get('name') || 'Product');
  const image = decodeURIComponent(search.get('image') || '/assets/product-1.jpg');
  const size = decodeURIComponent(search.get('size') || '');
  const price = decodeURIComponent(search.get('price') || '');
  const period = decodeURIComponent(search.get('period') || '');

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fallback: if order/lender missing in URL, try to read from localStorage map (set by bookings list)
  try {
    if ((typeof window !== 'undefined') && (!orderId || !lenderId)) {
      const raw = localStorage.getItem('bookingProductMap');
      if (raw) {
        const map = JSON.parse(raw || '{}') as Record<string, { orderId: string; lenderId: string }>;
        const m = map[productId];
        if (m) {
          if (!orderId && m.orderId) orderId = m.orderId;
          if (!lenderId && m.lenderId) lenderId = m.lenderId;
        }
      }
    }
  } catch {}

  const handleSubmit = async () => {
    if (!rating || !reviewText.trim()) {
      toast.error('Please add rating and review');
      return;
    }
    try {
      setSubmitting(true);
      const resp = await userApiService.renterCreateReview({
        order: orderId,
        product: productId,
        lender: lenderId,
        rating,
        review: reviewText.trim(),
      });
      if (resp?.success) {
        toast.success(resp.message || 'Review submitted');
        router.push('/bookings')
      } else {
        throw new Error(resp?.message || 'Failed to submit review');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const product = {
    id: productId,
    name: name,
    size: size,
    price: price,
    duration: period,
    deliveryDate: "",
    description: "Ready to review. Share your experience with others."
  };

  return (
    <ProtectedRoute>
      <div className="bg-[#FAF6F3] relative size-full overflow-x-hidden">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Review" }]} />
      
        {/* Main Content */}
        <div className="max-w-[1440px] mx-auto p-4 xs:p-5 sm:p-6 md:p-8 lg:p-[40px]">
          {/* Product Information Card */}
          <div className="border border-[#6d6d6d] border-[0.25px] p-4 xs:p-5 sm:p-6 md:p-[20px] mb-6 xs:mb-7 sm:mb-8 md:mb-[32px]">
            <div className="flex flex-col xs:flex-row gap-4 xs:gap-5 sm:gap-6 md:gap-[20px] items-start xs:items-center">
              {/* Product Image */}
              <div className="w-16 xs:w-18 sm:w-20 md:w-[80px] h-16 xs:h-18 sm:h-20 md:h-[80px] relative flex-shrink-0">
                <Image
                  src={image || "/assets/product-1.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-[8px]"
                  unoptimized
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col lg:flex-row gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-[120px] items-start flex-1 w-full">
                <div className="flex flex-col gap-1 xs:gap-2 sm:gap-[4px]">
                  <h3 className="capitalize font-poppins font-medium text-sm xs:text-base sm:text-[16px] leading-[1.3] xs:leading-[1.4] sm:leading-[24px] text-[#3D1126]">
                    {product.name}
                  </h3>
                  <p className="font-poppins text-sm xs:text-base sm:text-[16px] leading-[1.3] xs:leading-[1.4] sm:leading-[24px] text-black">
                    Size: {product.size}
                  </p>
                </div>

                <p className="font-poppins text-sm xs:text-base sm:text-[16px] leading-[1.3] xs:leading-[1.4] sm:leading-[24px] text-black whitespace-nowrap">
                  From {product.price} / {product.duration}
                </p>

                <div className="flex flex-col gap-1 xs:gap-2 sm:gap-[7px] w-full lg:w-[178px]">
                  <p className="font-poppins text-sm xs:text-base sm:text-[16px] leading-[1.3] xs:leading-[1.4] sm:leading-[24px] text-black">
                    {product.deliveryDate ? `Delivered on ${product.deliveryDate}.` : 'Ready to review.'}
                  </p>
                  <p className="font-poppins text-xs xs:text-sm sm:text-[12px] leading-[1.3] xs:leading-[1.4] sm:leading-[16px] text-black">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="mb-6 xs:mb-7 sm:mb-8 md:mb-[32px]">
            <h3 className="capitalize font-poppins font-medium text-sm xs:text-base sm:text-[16px] leading-[1.3] xs:leading-[1.4] sm:leading-[24px] text-[#3D1126] mb-3 xs:mb-4 sm:mb-[16px]">
              Rate this Product
            </h3>
            <div className="flex gap-2 xs:gap-3 sm:gap-[10px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="w-6 h-6 xs:w-7 xs:h-7 sm:w-[28px] sm:h-[28px] hover:opacity-70 transition-opacity flex-shrink-0"
                >
                  <StarIcon 
                    size={28} 
                    color={star <= rating ? "#3D1126" : "#E5E5E5"} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text Area */}
          <div className="mb-6 xs:mb-7 sm:mb-8 md:mb-[32px]">
            <h3 className="capitalize font-poppins font-medium text-sm xs:text-base sm:text-[16px] leading-[1.3] xs:leading-[1.4] sm:leading-[24px] text-[#3D1126] mb-3 xs:mb-4 sm:mb-[16px]">
              Review this product
            </h3>
            <div className="border border-[#6d6d6d] border-[0.25px] h-32 xs:h-36 sm:h-40 md:h-[148px] relative">
            <textarea
  placeholder="Description"
  value={reviewText}
  onChange={(e) => setReviewText(e.target.value)}
  className="w-full h-full p-3 xs:p-4 sm:p-[16px] font-poppins text-lg xs:text-base sm:text-md leading-[1.3] xs:leading-[1.4] sm:leading-[1.5] text-[#6d6d6d] bg-transparent resize-none outline-none"
  rows={4}
/>
            </div>
          </div>

          {/* Camera Icon and Submit Button */}
          <div className="flex flex-col xs:flex-row items-center justify-between gap-4 xs:gap-0">
            {/* <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-[54px] sm:h-[54px] flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="12" width="38" height="30" rx="2" stroke="#6D6D6D" strokeWidth="2"/>
                <circle cx="27" cy="27" r="8" stroke="#6D6D6D" strokeWidth="2"/>
                <path d="M38 12L32 18H22L16 12" stroke="#6D6D6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M27 23V31" stroke="#6D6D6D" strokeWidth="2" strokeLinecap="round"/>
                <path d="M23 27H31" stroke="#6D6D6D" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div> */}

            <PrimaryButtonLight
              text={submitting ? "Submitting..." : "Submit"}
              onClick={handleSubmit}
              className={`bg-[#1A1A1A] box-border flex gap-2 xs:gap-3 sm:gap-[10px] items-center justify-center px-4 xs:px-5 sm:px-[16px] py-2 xs:py-3 sm:py-[12px] relative shrink-0 transition-colors w-full xs:w-auto ${submitting ? 'opacity-50 pointer-events-none' : 'hover:bg-[#1a1a1a]'}`}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}