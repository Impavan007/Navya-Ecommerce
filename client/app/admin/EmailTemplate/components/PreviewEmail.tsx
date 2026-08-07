"use client";

import { FiX } from "react-icons/fi";

interface PreviewEmailProps {
    open: boolean;
    onClose: () => void;
    subject: string;
    body: string;
}

export default function PreviewEmail({
    open,
    onClose,
    subject,
    body,
}: PreviewEmailProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            {/* Modal */}
            <div className="w-full max-w-[768px] bg-white rounded-[8px] shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-[16px] min-h-[85px] bg-[#F3D6DC] shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-[18px] leading-[28px] font-semibold text-[#111827]">
                            Email Preview
                        </h2>
                        <p className="text-[14px] leading-[20px] text-[#4B5563] mt-1">
                            Preview shows sample data in merge tags
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-[32px] h-[32px] flex items-center justify-center"
                    >
                        <FiX size={20} className="text-[#9CA3AF]" />
                    </button>
                </div>

                {/* Body Wrapper */}
                <div className="bg-[#FAF6F3] px-6 py-6 overflow-y-auto">

                    <div className="flex flex-col w-full max-w-[720px] mx-auto">

                        {/* Subject Block */}
                        <div className="bg-white rounded-[8px] p-6 mb-6">
                            <p className="text-[12px] leading-[16px] text-[#3D1126] mb-2 font-normal">
                                Subject Line
                            </p>
                            <h3 className="text-[16px] leading-[24px] font-medium text-[#3D1126] capitalize break-words">
                                {subject}
                            </h3>
                        </div>

                        {/* Email Container */}
                        <div className="bg-white border border-[#F1F1F1] rounded-[8px] p-[33px]">

                            <div className="flex flex-col w-full">

                                {/* Body Content */}
                                <div
                                    className="text-[16px] leading-[24px] text-black w-full break-words [&_img]:max-w-full [&_img]:h-auto"
                                    dangerouslySetInnerHTML={{ __html: body }}
                                />

                                {/* Divider + Button */}
                                <div className="pt-8 w-full">
                                    {/* <div className="border-t border-[#F1F1F1] pt-6">
                                        <button className="w-full h-[48px] bg-[#1A1A1A] rounded-[8px] flex items-center justify-center text-white text-[16px] font-medium leading-[24px]">
                                            View in Dashboard
                                        </button>
                                    </div> */}
                                </div>

                                {/* Footer */}
                                <div className="pt-8 w-full">
                                    <div className="border-t border-[#F1F1F1] pt-6 flex flex-col items-center">
                                        <p className="text-[12px] leading-[16px] text-[#8A8A8A] text-center px-2">
                                            © 2025 Navyaa. All rights reserved.
                                        </p>
                                        <p className="text-[12px] leading-[16px] text-[#8A8A8A] text-center mt-2 px-2">
                                            You're receiving this email because you have an account with Navyaa.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
