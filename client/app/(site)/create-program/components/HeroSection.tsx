import React from "react";
import Breadcrumb from "../../components/Breadcrumb";
import Image from "next/image";

const HeroSection = () => {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Press & Media", href: "/pressPage" },
  ];

  return (
    <section className="w-full  bg-white">
      <div className=" mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        <div className="px-[20px] md:px-[60px] lg:px-[100px] pt-8 pb-12">
          <div className="max-w-[1000px] ml-8">
            <p className="font-poppins text-[#6D6D6D] text-sm mb-4 uppercase tracking-wider">
              News / March 18, 2024
            </p>

            <h1 className="font-canela text-[40px] md:text-[64px] lg:text-[72px] leading-[1.1] text-[#3D1126] mb-6 font-medium">
              The Future of Fashion Rental Platforms
            </h1>

            <p className="font-poppins text-[#3D1126] text-lg mb-8 font-medium">
              By David Mitchell
            </p>

            <button className="bg-[#1A1A1A] text-white px-8 py-3 rounded-[4px] font-poppins text-sm font-semibold tracking-wide hover:bg-black transition-colors mb-16 uppercase">
              View Original Article
            </button>
          </div>

          <div className="relative w-full aspect-[21/9] rounded-[4px] overflow-hidden mb-12">
            <Image
              src='/assets/IMG-27.svg'
              alt="Fashion dresses on rack"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
