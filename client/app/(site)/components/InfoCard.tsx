import Image from "next/image";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function InfoCard({ icon, title, description }: InfoCardProps) {
  return (
    <div className="basis-0 gap-4 flex items-center bg-[#F3D6DC] border border-[#F3D6DC] box-border relative shrink-0 p-[24px] flex-1 min-h-[140px]">
      {/* Icon top-right */}

      <div className="shrink-0">
        {icon}
      </div>


      {/* Text */}
      <div className="">
        <p className="font-['Poppins'] font-medium text-[#3D1126] text-base leading-[24px] m-0 capitalize">
          {title}
        </p>
        <p className="font-['Poppins'] text-[12px] leading-[16px] text-[#000000] m-0 mt-[8px]">
          {description}
        </p>
      </div>
    </div>
  );
}

