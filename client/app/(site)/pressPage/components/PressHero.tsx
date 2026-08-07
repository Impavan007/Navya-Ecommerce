"use client";

import React from "react";
import Image from "next/image";
import PrimaryButton from "../../components/PrimaryButton";

const PressHero = () => {
    return (
        <section className="relative w-full min-h-[60vh] md:min-h-[500px] lg:h-[800px] flex items-center overflow-hidden">
            {/* Background Image - Mirrored */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/pressHerosectionimage1.jpg"
                    alt="Press Hero"
                    fill
                    className="object-cover scale-x-[-1]"
                    priority
                />
                {/* <div className="absolute inset-0 bg-black/30"></div> */}
            </div>

            {/* Content */}
            <div className="relative z-10 w-full px-[20px] md:px-10 lg:px-16">
                <div className="max-w-[650px] flex flex-col gap-6">
                    <h1 className="font-canela font-medium text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white">
                        Navyaa in the Press
                    </h1>
                    <div className="flex flex-col gap-4">
                        <p className="font-poppins font-normal text-sm sm:text-base md:text-lg text-white/90 leading-relaxed">
                            See how Navyaa is transforming the way people experience fashion through community-powered clothing rental.
                        </p>
                    </div>
                    <button className="w-fit bg-[#1A1A1A] text-white px-5 py-3 rounded-lg font-poppins text-sm sm:text-base font-medium tracking-wider hover:bg-black transition-colors uppercase">
                        Download Press Kit
                    </button>
                </div>
            </div>
        </section>
    );
};

export default PressHero;
