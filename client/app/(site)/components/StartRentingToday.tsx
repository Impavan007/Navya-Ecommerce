// "use client";
// import Image from "next/image";
// import PrimaryButtonLight from "./PrimaryButtonLight";
// import PrimaryButton from "./PrimaryButton";
// import { useRouter } from "next/navigation";

// export default function StartRentingToday() {
//   const router = useRouter();

//   const scrollToFeaturedProducts = () => {
//     // You can use either method:

//     // Method 1: Scroll to FeaturedProducts section by ID
//     const featuredSection = document.getElementById('featured-products');
//     if (featuredSection) {
//       featuredSection.scrollIntoView({
//         behavior: 'smooth',
//         block: 'start'
//       });
//     }

//     // Method 2: If FeaturedProducts component doesn't have an ID,
//     // you can scroll to a specific position or use querySelector
//     // const featuredSection = document.querySelector('[data-section="featured-products"]');
//     // if (featuredSection) {
//     //   featuredSection.scrollIntoView({ behavior: 'smooth' });
//     // }
//   };

//   return (
//     <div
//       className="relative w-full overflow-hidden"
//       style={{
//         height: 'clamp(500px, 56vw, 1000px)'
//       }}
//     >
//       <div aria-hidden="true" className="absolute inset-0">
//         <Image
//           src="/assets/image 1.png"
//           alt="Background"
//           fill
//           className="object-fit-cover"
//           unoptimized
//         />
//       </div>

//       {/* Content Section */}
//       <div
//         className="
//           absolute
//           top-1/2 -translate-y-1/2
//           left-[50%] sm:left-[50%] md:left-[7%] lg:left-[151px]
//           transform -translate-x-1/2 sm:-translate-x-1/2 md:translate-x-0
//           flex flex-col gap-[24px] sm:gap-[32px] md:gap-[40px] lg:gap-[48px]
//           items-center sm:items-center md:items-start
//           text-center sm:text-center md:text-left
//           w-[90%] sm:w-[80%] md:w-[60%] lg:w-[450px]
//         "
//       >
//         {/* Text Section */}
//         <div className="flex flex-col gap-[12px] sm:gap-[16px] w-full">
//           <p className="font-['Playfair_Display'] font-medium text-[28px] sm:text-[36px] md:text-[44px] lg:text-[48px] leading-[34px] sm:leading-[42px] md:leading-[48px] text-black">
//             Start Renting Today
//           </p>
//           <p className="font-['Poppins'] font-medium text-[14px] sm:text-[15px] md:text-[16px] leading-[22px] sm:leading-[24px] text-[#3D1126] max-w-[404px]">
//             Find the perfect outfit for your next event or lend your items and earn money. Get started with Navyaa now!
//           </p>
//         </div>

//         {/* Buttons */}
//         <div className="flex flex-col sm:flex-row gap-[12px] sm:gap-[16px] w-full sm:w-auto justify-center sm:justify-center md:justify-start">
//           <button
//             onClick={scrollToFeaturedProducts}

//             className="bg-[#1A1A1A] text-gray-100 flex items-center justify-center px-[16px] py-[12px] h-[44px] sm:h-[48px]  hover:bg-[#1a1a1a] transition-all"
//           >Browse Rentals</button>
//           <PrimaryButton
//             onClick={() => router.push('/lenders')}
//             text="Join as a Lender"
//             className="border border-[#3D1126] flex items-center justify-center px-[16px] py-[12px] h-[44px] sm:h-[48px]  bg-transparent hover:bg-[#1A1A1A] hover:text-white transition-all"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";

export default function StartRentingToday() {
  return (
    <section className="w-full bg-[#F8F4EF] border-t border-[#E8E3DD] flex justify-center py-16 md:py-24">
      <div className="w-full max-w-4xl px-6 md:px-10 flex flex-col items-center text-center">
        {/* Heading */}
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-[#18181B] font-bold">
          Start Buying Today
        </h2>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl font-sans text-base md:text-lg leading-relaxed text-[#4B5563]">
          Find the perfect outfit for your next event or sell your items and earn money with Navyaa.
        </p>

        {/* Button */}
        <Link
          href="/productPage"
          className="mt-10 bg-[#18181B] text-[#FFFCF8] hover:bg-[#C8A96A] hover:text-white px-10 py-4 rounded-full font-sans text-xs uppercase tracking-wider font-semibold transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
        >
          Browse Collection →
        </Link>
      </div>
    </section>
  );
}
