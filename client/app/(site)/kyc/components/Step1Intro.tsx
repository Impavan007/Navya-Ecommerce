import Image from "next/image";
import Link from "next/link";

interface Props {
  onNext: () => void;
}

export default function Step1Intro({ onNext }: Props) {
  return (
    <div className="text-center max-w-2xl w-full px-4 py-8 md:py-12 flex flex-col items-center">

      <h1 className="text-3xl md:text-5xl font-['canela'] font-semibold text-[#3D1126] mb-4 md:mb-6">
        Verify your identity
      </h1>

      <p className="text-[#6D6D6D] text-base md:text-lg leading-relaxed mb-8 md:mb-12 max-w-lg">
        To keep Navyaa safe and trusted for everyone, we need to verify your identity.
        This helps prevent fraud and protects both renters and lenders.
      </p>

      <div className="flex justify-center mb-8 md:mb-12">
        <div className="relative w-[160px] h-[160px] md:w-[200px] md:h-[200px]">
          <svg className="w-full h-full" viewBox="0 0 204 204" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M136.034 21.25C152.974 22.2105 163.693 24.939 171.377 32.623C179.061 40.307 181.79 51.0255 182.75 67.966M67.966 21.25C51.0255 22.2105 40.307 24.939 32.623 32.623C24.939 40.307 22.2105 51.0255 21.25 67.966M182.75 136.034C181.79 152.974 179.061 163.693 171.377 171.377C163.693 179.061 152.974 181.79 136.034 182.75M21.25 136.034C22.2105 152.974 24.939 163.693 32.623 171.377C40.307 179.061 51.0255 181.79 67.966 182.75M42.5 102H161.5" stroke="#3D1126" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

        </div>
      </div>

      <button
        onClick={onNext}
        className="bg-[#1A1A1A] text-[#ffffff] w-full sm:max-w-md py-4 rounded-xl text-base font-medium shadow-lg hover:opacity-95 transition-all active:scale-[0.98]"
      >
        Start Verification
      </button>

      <div className="mt-10 md:mt-16 space-y-2">
        <p className="text-[#6D6D6D] text-xs sm:text-sm">
          Your documents are encrypted and used only for identity verification
        </p>

        <p className="text-[#6D6D6D] text-xs sm:text-sm">
          Having trouble?{" "}
          <Link href="/support" className="underline text-[#3D1126] font-medium hover:text-black transition-colors" >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
