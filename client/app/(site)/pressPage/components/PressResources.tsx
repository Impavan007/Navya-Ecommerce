"use client";

import React, { useState } from "react";
import PrimaryButton from "../../components/PrimaryButton";
import Link from "next/link";
import { PressDownloadIcon, PressPageIcons1, PressPageIcons2, PressPageIcons3, PressPageIcons4, PressPageIcons5 } from "../../icons/icons";

const resources = [
    {
        title: "Brand Overview",
        description: "Company history, mission, and values.",
        Icon: PressPageIcons1,
    },
    {
        title: "Logo Pack",
        description: "Multi-resolution brand logos for digital and print.",
        Icon: PressPageIcons2,
    },
    {
        title: "Brand Guidelines",
        description: "Visual identity, typography, and color usage.",
        Icon: PressPageIcons3,
    },
    {
        title: "Product Screenshots",
        description: "High-quality snapshots of the Navyaa platform.",
        Icon: PressPageIcons4,
    },
    {
        title: "Author Imagery",
        description: "Verified images for editorial use.",
        Icon: PressPageIcons5,
    },
];

const PressResources = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-20 px-[20px] md:px-10 lg:px-16 bg-[#FAF6F3] text-[#3D1126]">
            <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16">
                {/* Left Side */}
                <div className="flex-1 flex flex-col gap-8  justify-center">
                    <div className="flex flex-col gap-4">
                        <h2 className="font-canela font-normal lg:text-[60px] md:text-[50px] sm:text-[40px] text-[#3D1126] leading-tight">
                            Press Kit & Media Resources
                        </h2>
                        <p className="font-poppins text-sm sm:text-base md:text-lg text-[#3D1126] leading-relaxed max-w-[520px]">
                            Download official brand assets, company information, and media materials for editorial coverage.                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 sm:gap-4">
                        <button className="bg-[#1A1A1A] text-white px-5 py-3 rounded-md font-poppins text-sm sm:text-base font-medium tracking-wider hover:bg-black transition-colors uppercase">
                            Download Press Kit
                        </button>
                        <Link
                            href="#enquiries"
                            className="font-poppins font-medium text-sm sm:text-base px-5 py-3 border border-[#3D1126] rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center uppercase tracking-wide"
                        >
                            Download Logo Pack
                        </Link>
                    </div>
                </div>

                {/* Right Side - Accordion Box */}
                <div className="flex-1 overflow-hidden  ">
                    {resources.map((resource, index) => (
                        <div
                            key={index}
                            className="border-b mb-5 border-[#E7C5CA] last:border-b-0 cursor-pointer transition-colors bg-[#F3D6DC]"
                        >
                            <div className="flex  sm:justify-between items-center px-5 py-4 sm:px-6 sm:py-5 gap-4 group">
                                <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full">
                                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                        <resource.Icon />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <span className="font-canela font-medium text-base sm:text-lg text-[#3D1126]">
                                            {resource.title}
                                        </span>

                                        <p className="font-poppins text-sm text-[#3D1126] animate-fadeIn">
                                            {resource.description}
                                        </p>

                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <PressDownloadIcon />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PressResources;
