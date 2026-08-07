"use client";

import React from "react";

const brands = [
    "VOGUE",
    "KINDRESS",
    "ELLE",
    "HARPER'S BAZAAR",
    "GLAMOUR MAGAZINE",
    "HUNTINGTON",
    "CHARLIE",
    "FORBES",
];

const MediaMentions = () => {
    return (
        <section className="py-20 px-[20px] md:px-10 lg:px-16 bg-[#F3D6DC]">
            <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-16">
                {/* Header */}
                <div className="text-center flex flex-col gap-4 max-w-[700px]">
                    <p className="font-poppins font-normal text-[14px] lg:text-[14px] md:text-[14px] sm:text-[14px] text-[#4B5563]">As Seen In</p>
                    <h2 className="font-canela font-medium text-3xl lg:text-[48px] md:text-[40px] sm:text-[30px] text-[#3D1126]">
                        Media Mentions
                    </h2>
                    <p className="font-poppins text-sm sm:text-base md:text-lg text-[#3D1126]">
                        Featured in leading fashion and lifestyle publications                    </p>
                </div>

                {/* Brand Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full">
                    {brands.map((brand, index) => (
                        <div
                            key={index}
                            className="bg-white min-h-[180px] p-4 sm:p-5  flex items-center justify-center"
                        >
                            <span className="font-['canela'] font-bold text-sm sm:text-base md:text-lg text-center tracking-widest uppercase">
                                {brand}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MediaMentions;
