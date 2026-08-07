interface RentalPeriodCardProps {
  days: number;
  pricePerDay: string;
  totalPrice: string;
  savePercentage?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function RentalPeriodCard({
  days,
  pricePerDay,
  totalPrice,
  savePercentage,
  isSelected = false,
  onClick
}: RentalPeriodCardProps) {
  return (
    <button
      onClick={onClick}
      className={`${isSelected ? "bg-[#F3D6DC]" : "bg-[#FFFFFF]"} border ${isSelected ? "border-[#8A8A8A]" : "border-[#e4e0dd]"
        } border-solid relative shrink-0 w-full lg:min-w-[230px] cursor-pointer hover:border-[#3D1126] transition-colors `}
    >
      <div className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 w-full">
        {/* Days & Price per Day */}
        <div className="flex items-center justify-between w-full">
          <p className="font-poppins font-medium text-[#3D1126] text-[12px] sm:text-[13px] md:text-[14px] leading-[18px]">
            {days} {days > 1 ? "days" : "day"}:
          </p>
          <p className="font-poppins text-[#26b625] text-[10px] sm:text-[11px] md:text-[12px] leading-[14px]">
            {pricePerDay}/day
          </p>
        </div>

        {/* Total Price & Save Percentage */}
        <div className="flex items-end justify-between w-full">
          <p className="capitalize font-poppins font-medium text-[#3D1126] text-[14px] sm:text-[15px] md:text-[16px] leading-[20px]">
            {totalPrice}
          </p>
          {savePercentage && (
            <p className="font-poppins text-[#3D1126] text-[10px] sm:text-[11px] md:text-[12px] leading-[14px] bg-[#F3D6DC] p-1 rounded-xl">
              {savePercentage}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
