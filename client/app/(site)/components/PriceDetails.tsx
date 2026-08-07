import PrimaryButtonLight from "./PrimaryButtonLight";

interface PriceDetailsProps {
  itemCount: number;
  price: string;
  securityDeposit: string;
  cleaningFee: string;
  serviceCharges: string;
  totalAmount: string;
  onPlaceOrder?: () => void;
}

export default function PriceDetails({
  itemCount,
  price,
  securityDeposit,
  cleaningFee,
  serviceCharges,
  totalAmount,
  onPlaceOrder,
}: PriceDetailsProps) {
  return (
    <div className="bg-[#F3D6DC] border border-[#F3D6DC] box-border flex flex-col gap-[16px] items-start p-[16px] lg:p-[24px] w-full lg:w-[404px]">

      <p className="capitalize font-poppins font-medium text-[16px] text-black w-full">
        Price Details
      </p>

      <div className="flex flex-col w-full">

        <div className="border-b border-[#D5D5D5] pb-[8px] flex flex-col w-full">

          {[
            {
              label: `Price(${itemCount} item${itemCount !== 1 ? "s" : ""})`,
              value: price,
            },
            { label: "Security deposit", value: securityDeposit },
            { label: "Cleaning fee", value: cleaningFee },
            { label: "Service charges(15%)", value: serviceCharges },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-[14px] px-[12px] sm:px-[16px] w-full"
            >
              <p className="font-poppins text-[14px] text-[#3D1126]">
                {item.label}
              </p>

              <p className="font-poppins font-medium text-[14px] text-[#3D1126]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between py-[16px] px-[12px] sm:px-[16px] w-full">
          <p className="font-poppins font-medium text-[14px] text-[#3D1126]">
            Total Amount
          </p>

          <p className="font-poppins font-medium text-[14px] text-[#3D1126]">
            {totalAmount}
          </p>
        </div>

      </div>

      {onPlaceOrder && (
        <div className="hidden lg:block w-[404px] mt-[8px] ">
          <PrimaryButtonLight
            onClick={onPlaceOrder}
            text="Place Order"
            className="w-[134px] h-[56px] bg-[#1A1A1A] rounded-[8px] flex items-center justify-center p-[16px_20px]"
            textClassName="font-poppins font-medium text-[16px] text-white"
          />
        </div>
      )}
    </div>
  );
}