"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const articles = [
    {
        image: "/assets/pressIMage1.jpg",
        category: "FASHION",
        title: "The Future of Fashion Rental Platforms",
        description: "Navyaa is leading the transition to a sustainable fashion economy through innovative peer-to-peer sharing.",
        date: "March 10, 2024",
    },
    {
        image: "/assets/pressImage2.jpg",
        category: "BUSINESS",
        title: "How Peer-to-Peer Rental is Disrupting Fashion",
        description: "The platform empowers individuals to monetize their wardrobes while providing access to high-end designer pieces.",
        date: "February 24, 2024",
    },
    {
        image: "/assets/pressImage3.jpg",
        category: "STYLE",
        title: "Sustainable Style: The Rise of Wardrobe Sharing",
        description: "Navyaa's community-driven approach makes designer fashion accessible without the environmental cost of new production.",
        date: "January 15, 2024",
    },
    {
        image: "/assets/Pressimage4.jpg",
        category: "MAGAZINE",
        title: "The New Way to Experience Designer Fashion",
        description: "Technology is bridging the gap between desire and access, creating a seamless experience for both lenders and renters.",
        date: "December 10, 2023",
    },
];

const FeaturedPress = () => {
    return (
        <section className="py-20 px-[20px] md:px-10 lg:px-16 bg-white">
            <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-16">
                {/* Header */}
                <div className="text-center flex flex-col gap-4 max-w-[700px]">
                    <h2 className="font-canela font-medium lg:text-[60px] text-3xl sm:text-4xl md:text-5xl text-[#3D1126]">
                        Featured Press
                    </h2>
                    <p className="font-poppins text-sm lg:text-[16px] sm:text-base md:text-lg text-[#4B5563] leading-relaxed">
                        Discover what leading publications are saying about Navyaa                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-10 md:gap-y-12 w-full">
                    {articles.map((article, index) => (
                        <div key={index} className="flex flex-col gap-4 group cursor-pointer">
                            <div className="relative w-full aspect-[16/10] overflow-hidden ">
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <span className="font-poppins font-bold text-[11px] tracking-widest text-[#3D1126] uppercase">
                                    {article.category}
                                </span>
                                <h3 className="font-canela font-medium text-xl sm:text-2xl text-[#3D1126] leading-tight group-hover:text-[#3D1126] transition-colors">
                                    {article.title}
                                </h3>
                                <p className="font-poppins text-sm sm:text-base text-[#3D1126] leading-relaxed">
                                    {article.description}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 pt-4 border-t border-gray-100 gap-2">
                                    <span className="font-poppins text-xs sm:text-sm text-[#6D6D6D]">
                                        {article.date}
                                    </span>
                                    <Link href="#" className="font-poppins font-medium text-xs sm:text-sm text-[#3D1126] flex items-center gap-1 hover:text-[#6D6D6D] transition-all">
                                        Read More <span className="text-base">→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedPress;
