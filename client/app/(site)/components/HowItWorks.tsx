"use client";

import { useEffect, useState } from "react";
import ProcessCard from "./ProcessCard";
import apiServices from "../services/api";
import { HowItWorksData } from "../types/api";
import { ProcessCardShimmer } from "./Shimmer";

interface HowItWorksSectionProps {
    data: HowItWorksData | null;
    activeToggle: "renter" | "lender";
    setActiveToggle: (val: "renter" | "lender") => void;
    loading: boolean;
}

export default function HowItWorksSection({ data, activeToggle, setActiveToggle, loading }: HowItWorksSectionProps) {
    if (loading) {
        return (
            <section className="w-full bg-[#E9D0D6] flex justify-center py-10 md:py-20">
                <div className="w-full max-w-[1740px] px-4 md:px-8 lg:px-[80px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        {[...Array(5)].map((_, i) => (
                            <ProcessCardShimmer key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!data) {
        return null; // Or show a fallback/error message
    }

    return (
        <section id="how-it-works" className="
            w-full bg-[#EFD8DD] flex justify-center
            py-12 md:py-20 border-y border-[#E8E3DD]
        ">
            <div className="w-full max-w-7xl px-6 md:px-10 lg:px-12 flex flex-col items-center">
                {/* Toggle Buttons */}
                <div className="bg-white p-1.5 rounded-full flex gap-2 mb-12 shadow-xs border border-[#E8E3DD]">
                    <button
                        onClick={() => setActiveToggle("renter")}
                        className={`px-8 py-3 rounded-full text-sm font-sans font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeToggle === "renter"
                            ? "bg-[#18181B] text-[#FFFCF8] shadow-xs"
                            : "text-[#7C7C7C] hover:text-[#18181B]"
                            }`}
                    >
                        For Buyer
                    </button>
                    <button
                        onClick={() => setActiveToggle("lender")}
                        className={`px-8 py-3 rounded-full text-sm font-sans font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeToggle === "lender"
                            ? "bg-[#18181B] text-[#FFFCF8] shadow-xs"
                            : "text-[#7C7C7C] hover:text-[#18181B]"
                            }`}
                    >
                        For Seller
                    </button>
                </div>

                <div className="
                    w-full 
                    flex flex-col md:flex-row items-center
                    gap-6 md:gap-[1.1vw] min-[1440px]:gap-[16px]
                ">
                    {activeToggle === "renter" ? (
                        <>
                            <ProcessCard imageSrc="/assets/source.svg" title="Source & Discover" description="Browse premium textiles from vetted global manufacturers." />
                            <ProcessCard imageSrc="/assets/sample.svg" title="Order Samples" description="Request swatches or sample yardage before committing." />
                            <ProcessCard imageSrc="/assets/bulk.svg" title="Place Bulk Order" description="Negotiate terms and order wholesale quantities securely." />
                        </>
                    ) : (
                        <>
                            <ProcessCard imageSrc="/assets/list.svg" title="List Inventory" description="Showcase your fabric collections and production capabilities." />
                            <ProcessCard imageSrc="/assets/send.svg" title="Send Samples" description="Process sample requests to build buyer confidence." />
                            <ProcessCard imageSrc="/assets/manage.svg" title="Manage Bulk" description="Fulfill wholesale orders and establish long-term B2B relationships." />
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
