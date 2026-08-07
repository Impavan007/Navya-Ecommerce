"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import apiServices from "../services/api";
import { HowItWorksData } from "../types/api";
import { HeroSectionShimmer } from "../components/Shimmer";

interface HeroSectionProps {
    data: HowItWorksData | null;
    activeToggle: "renter" | "lender";
    loading: boolean;
}

export default function HeroSection({ data, activeToggle, loading }: HeroSectionProps) {
    if (loading) {
        return <HeroSectionShimmer />;
    }

    if (!data) {
        return null; // Or show static fallback
    }

    // Split headline into renter and lender parts if it contains both
    const headline = data.headline;
    let displayHeadline = headline;

    // if (headline.includes("Want it? Rent it.") && headline.includes("Own it? Lend it.")) {
    //     if (activeToggle === "renter") {
    //         displayHeadline = "Want it? Rent it.";
    //     } else {
    //         displayHeadline = "Own it? Lend it.";
    //     }
    // }

    return (
        <section className="w-full bg-[#F3D6DC] flex justify-center py-[80px]">
            <div className="w-full    px-[20px] md:px-8 lg:px-[40px] min-h-[630px] flex flex-col justify-center">

                {/* 20% / 80% Layout */}
                <div className="flex flex-col lg:flex-row h-full gap-8 lg:gap-[48px]">

                    {/* LEFT SIDE — 20% WIDTH */}
                    <div className="w-full lg:w-[35%] 3xl:w-[35%]  flex flex-col justify-start">

                        {/* Text block */}
                        <div className="flex flex-col justify-between gap-8">

                            {/* Heading + Subtitle */}
                            <div>
                                <h1
                                    className="text-[32px] md:text-[40px] 2xl:text-[56px] 3xl:text-[3vw] leading-[1.2] font-['canela'] font-medium text-[#3D1126]"
                                    dangerouslySetInnerHTML={{ __html: displayHeadline.replace(/\./g, '.<br />') }}
                                />

                                <p className="mt-4 md:mt-8 2xl:mt-12 text-[16px] md:text-[20px] 2xl:text-[24px] 3xl:text-[1.5vw] font-['canela'] font-medium uppercase tracking-wide text-[#3D1126]">
                                    {data.sub_headline}
                                </p>
                            </div>

                            {/* Description */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 2xl:gap-12 text-[14px] 3xl:text-[1vw] md:text-[16px] 2xl:text-[20px] leading-[1.6] text-[#3D1126]">
                                {data.supporting_paragraph.split('.').filter(p => p.trim()).map((para, index) => (
                                    <p key={index}>
                                        {para.trim()}.
                                    </p>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* RIGHT SIDE — 80% WIDTH */}
                    <div className="w-full lg:w-[65%]  h-full flex items-start justify-center lg:justify-end mt-8 lg:mt-0">
                        <Image
                            src={data.hero_image}
                            alt="Hero Image"
                            width={1600}
                            height={1000}
                            priority
                            className="w-full lg:w-auto 3xl:w-[65%] h-auto object-contain max-h-[400px] lg:max-h-full"
                        />
                    </div>


                </div>
            </div>
        </section>
    );
}
