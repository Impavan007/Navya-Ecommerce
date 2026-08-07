"use client";

import React, { useState } from "react";
import { RiUser3Line, RiAtLine, RiBuilding4Line } from "react-icons/ri";
import { PressEnquiriesIcon, PressEnquiriesIcon2 } from "../../icons/icons";

const PressEnquiries = () => {
    const [message, setMessage] = useState("");
    const maxChars = 500;

    return (
        <section id="enquiries" className="py-20 px-[20px] md:px-10 lg:px-16 bg-[#FAF6F3]">
            <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-12">

                {/* Header */}
                <div className="text-center flex flex-col gap-6 max-w-[800px]">
                    <h2 className="font-canela font-normal text-3xl lg:text-[60px] sm:text-4xl md:text-5xl text-[#3D1126] leading-tight">
                        Press & Media Enquiries
                    </h2>
                    <div className="flex flex-col gap-4">
                        <p className="font-poppins text-sm lg:text-[16px] sm:text-base md:text-lg text-[#4B5563] leading-relaxed max-w-[600px] mx-auto font-regular">
                            Our media team is happy to support interviews, editorial requests, and brand collaborations.
                        </p>
                        <a
                            href="mailto:press@navyaa.com"
                            className="font-canela font-bold text-base sm:text-lg md:text-xl text-[#3D1126] hover:opacity-70 transition-all"
                        >
                            press@navyaa.com
                        </a>
                    </div>
                </div>

                {/* Contact Form Container */}
                <div className="w-full max-w-[900px] bg-[#F3D6DC] p-6 sm:p-8 md:p-10 ">
                    <form className="flex flex-col gap-10">
                        <h3 className="font-canela font-medium text-xl sm:text-2xl md:text-3xl text-center text-[#3D1126]">
                            Contact Media Team
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Full Name */}
                            <div className="flex flex-col relative group">
                                <div className="flex items-center justify-between border-b border-[#3D1126]/20 pb-3 group-focus-within:border-[#3D1126] transition-colors">
                                    <input
                                        type="text"
                                        placeholder="Enter your Full Name"
                                        className="w-full outline-none font-poppins text-base sm:text-lg text-[#3D1126] bg-transparent placeholder:text-[#3D1126]/40"
                                    />
                                    <PressEnquiriesIcon2 />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col relative group">
                                <div className="flex items-center justify-between border-b border-[#3D1126]/20 pb-3 group-focus-within:border-[#3D1126] transition-colors">
                                    <input
                                        type="email"
                                        placeholder="Enter your Email"
                                        className="w-full outline-none font-poppins text-base sm:text-lg text-[#3D1126] bg-transparent placeholder:text-[#3D1126]/40"
                                    />
                                    <RiAtLine className="text-2xl text-[#3D1126]/60" />
                                </div>
                            </div>
                        </div>

                        {/* Publication / Organization */}
                        <div className="flex flex-col relative group">
                            <div className="flex items-center justify-between border-b border-[#3D1126]/20 pb-3 group-focus-within:border-[#3D1126] transition-colors">
                                <input
                                    type="text"
                                    placeholder="Publication / Organization"
                                    className="w-full outline-none font-poppins text-base sm:text-lg text-[#3D1126] bg-transparent placeholder:text-[#3D1126]/40"
                                />
                                <PressEnquiriesIcon />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="flex flex-col relative group">
                            <div className="flex flex-col border-b border-[#3D1126]/20 pb-2 group-focus-within:border-[#3D1126] transition-colors">
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
                                    className="w-full outline-none font-poppins text-base sm:text-lg text-[#3D1126] bg-transparent resize-none"
                                    placeholder="Message"

                                />
                            </div>
                            <span className="font-poppins text-xs text-[#3D1126]/40 mt-2">
                                {message.length}/{maxChars} characters
                            </span>
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="bg-[#2c2931] text-white px-10 py-4 rounded-lg font-poppins text-base sm:text-lg font-medium hover:bg-black transition-all"
                            >
                                Send Enquiry
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default PressEnquiries;
