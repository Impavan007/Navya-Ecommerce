import Image from "next/image";
import { useState } from "react";
import { BaseModal, ModalHeader, ModalBody, ModalFooter } from "./Modal";

interface CartItemCardProps {
  imageSrc: string;
  brand: string;
  name: string;
  description: string;
  color: string;
  size: string;
  availability: string;
  rrp: string;
  date: string;
  total: string;
  lenderName: string;
  lenderAvatar: string;
  isTopLender?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onMoveToWishlist?: () => void;
  pricing: any;
  isMoveToWishlistLoading?: boolean;
}

export default function CartItemCard({
  imageSrc,
  brand,
  name,
  description,
  color,
  size,
  availability,
  rrp,
  date,
  total,
  lenderName,
  lenderAvatar,
  isTopLender = false,
  onEdit,
  onRemove,
  onMoveToWishlist,
  pricing,
  isMoveToWishlistLoading = false,
}: CartItemCardProps) {
  const [showmodal, setshowmodal] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc || "/Images/premium_b2b_textiles.png");
  const [currentAvatar, setCurrentAvatar] = useState(lenderAvatar || "/assets/girl.jpg");

  return (
    <div className="bg-[#F3D6DC] border border-[#F3D6DC] box-border flex flex-col gap-[24px] p-[16px] lg:p-[24px] w-full relative">

      {/* Product Section */}
      <div className="flex flex-col gap-[24px] w-full">

        <div className="flex flex-col sm:flex-row gap-[20px] lg:gap-[28px] border-b border-[#D5D5D5] pb-[16px] w-full">

          {/* Image */}
          <div className="relative w-[110px] h-[140px] sm:w-[128px] sm:h-[157px] flex-shrink-0">
            <Image
              src={currentImageSrc}
              alt={brand}
              fill
              className="object-cover"
              unoptimized
              onError={() => setCurrentImageSrc("/Images/premium_b2b_textiles.png")}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between w-full">

            {/* Top section */}
            <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-[16px] w-full">

              {/* Brand */}
              <div className="flex flex-col gap-[12px]">
                <p className="font-poppins font-medium text-[16px] lg:text-[22px] leading-[24px] lg:leading-[28px] text-black capitalize">
                  {brand}
                </p>

                <div className="flex flex-col gap-[4px] text-[14px] lg:text-[16px] leading-[20px] lg:leading-[24px] text-[#3D1126] font-poppins">
                  <p>Color: {color}</p>
                  <p>Size: {size}</p>
                  <p>{availability}</p>
                </div>
              </div>

              {/* RRP */}
              <div className="flex flex-col gap-[8px] sm:gap-[16px]">
                <p className="font-poppins font-medium text-[16px] lg:text-[22px]">RRP</p>
                <p className="text-[14px] lg:text-[16px] text-[#3D1126]">{rrp}</p>
              </div>

              {/* Date (mapped to Quantity) */}
              <div className="flex flex-col gap-[8px] sm:gap-[16px]">
                <p className="font-poppins font-medium text-[16px] lg:text-[22px]">Quantity</p>
                <p className="text-[14px] lg:text-[16px] text-[#3D1126] whitespace-nowrap">{date}</p>
              </div>

              {/* Total */}
              <div className="flex flex-col items-start sm:items-end gap-[8px] sm:gap-[16px]">
                <div className="flex items-center gap-[8px]">
                  <p className="font-poppins font-medium text-[16px] lg:text-[22px]">Total</p>

                  <div
                    className="w-[20px] h-[20px] cursor-pointer"
                    onClick={() => setshowmodal(!showmodal)}
                  >
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 4.16667H9.16667V5.83333H7.5V4.16667ZM8.33333 12.5C8.79167 12.5 9.16667 12.125 9.16667 11.6667V8.33333C9.16667 7.875 8.79167 7.5 8.33333 7.5C7.875 7.5 7.5 7.875 7.5 8.33333V11.6667C7.5 12.125 7.875 12.5 8.33333 12.5ZM8.33333 0C3.73333 0 0 3.73333 0 8.33333C0 12.9333 3.73333 16.6667 8.33333 16.6667C12.9333 16.6667 16.6667 12.9333 16.6667 8.33333C16.6667 3.73333 12.9333 0 8.33333 0ZM8.33333 15C4.65833 15 1.66667 12.0083 1.66667 8.33333C1.66667 4.65833 4.65833 1.66667 8.33333 1.66667C12.0083 1.66667 15 4.65833 15 8.33333C15 12.0083 12.0083 15 8.33333 15Z" fill="#323232" />
                    </svg>

                  </div>
                </div>

                <p className="text-[14px] font-medium text-[#3D1126]">{total}</p>
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-[16px] sm:gap-[28px] mt-[12px]">
              <button
                onClick={onEdit}
                className="text-[14px] font-medium text-[#3D1126] underline"
              >
                Edit
              </button>

              <button
                onClick={onRemove}
                className="text-[14px] font-medium text-[#3D1126] underline"
              >
                Remove
              </button>

              <button
                onClick={onMoveToWishlist}
                disabled={isMoveToWishlistLoading}
                className={`text-[14px] font-medium text-[#3D1126] underline whitespace-nowrap ${isMoveToWishlistLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isMoveToWishlistLoading ? "Moving..." : "Move to wishlist"}
              </button>
            </div>
          </div>
        </div>

        {/* Lender */}
        <div className="flex flex-wrap items-center gap-[16px] px-[8px] sm:px-[20px]">

          <div className="flex items-center gap-[10px]">
            <div className="relative w-[28px] h-[28px] rounded-full overflow-hidden">
              <Image
                src={currentAvatar}
                alt={lenderName}
                fill
                className="object-cover rounded-full"
                unoptimized
                onError={() => setCurrentAvatar("/assets/girl.jpg")}
              />
            </div>

            <p className="font-poppins text-[14px] sm:text-[16px] text-black">
              Sent by {lenderName}
            </p>
          </div>

          {isTopLender && (
            <div className="bg-[#FDA018] px-[8px] py-[4px] flex items-center gap-[6px]">
              <p className="font-poppins text-[12px] font-medium text-[#3D1126]">
                Top Seller
              </p>
            </div>
          )}

        </div>

      </div>
      {/* Pricing Modal */}
      <BaseModal isOpen={showmodal && !!pricing} onClose={() => setshowmodal(false)} size="md" showCloseButton>
        <ModalHeader title="Price Details" onClose={() => setshowmodal(false)} />
        <ModalBody>
          <div className="space-y-4">
            {/* Rental Amount */}
            <div className="flex justify-between items-center text-[#3D1126] font-poppins">
              <span>Rental Amount</span>
              <span className="text-black font-semibold">Rs.{pricing?.rentalAmount}</span>
            </div>

            {/* Service Fee */}
            <div className="flex justify-between items-center text-[#3D1126] font-poppins">
              <span>Service Fee (15%)</span>
              <span className="text-black font-semibold">Rs.{pricing?.serviceFee}</span>
            </div>

            {/* Cleaning Fee */}
            <div className="flex justify-between items-center text-[#3D1126] font-poppins">
              <span>Cleaning Fee</span>
              <span className="text-black font-semibold">Rs.{pricing?.cleaningFee}</span>
            </div>

            {/* Security Deposit */}
            <div className="flex justify-between items-center text-[#3D1126] font-poppins">
              <span>Security Deposit</span>
              <span className="text-black font-semibold">Rs.{pricing?.securityDeposit}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Total Amount */}
            <div className="flex justify-between items-center">
              <span className="font-poppins font-bold text-lg text-black">Total Amount</span>
              <span className="font-poppins font-bold text-lg text-black">Rs.{pricing?.subtotal}</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setshowmodal(false)}
            className="w-full bg-[#1A1A1A] text-white py-4 font-poppins font-medium hover:bg-black transition-colors"
          >
            Close
          </button>
        </ModalFooter>
      </BaseModal>
    </div>
  );
}