"use client";

import React from "react";

import { Promo, PromoPerformance } from "../../store/PromoCode/PromoStore";
import CommonLoader from "../../../components/common/CommonLoader";
import { Icons } from "@/app/admin/icons";
import CommonModal from "@/app/components/common/CommonModal";

type Props = {
    promo: Promo;
    performance: PromoPerformance | null;
    isLoading?: boolean;
    onClose: () => void;
};

export default function PromoCodePerformance({
    promo,
    performance,
    isLoading = false,
    onClose,
}: Props) {
    const percentage = Math.min((promo.used / promo.limit) * 100, 100);

    return (
        <CommonModal
            isOpen={true}
            onClose={onClose}
            title="Promo Code Performance"
            size="lg"
            loading={isLoading}
        >
            <div className="space-y-6 flex flex-col font-roboto">
                {performance ? (
                    <>
                        <div className="flex flex-col mb-2">
                            <p className="text-sm text-gray-600">
                                Analytics for <span className="font-semibold">{promo.code}</span>
                            </p>
                        </div>

                        {/* Top Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="bg-[#FEF3C7] p-5 rounded-lg border border-[#F2D89C]">
                                <p className="text-sm text-[#7C2D12] font-medium">
                                    Total Uses
                                </p>
                                <h3 className="text-2xl font-semibold mt-1 text-[#7C2D12]">
                                    {promo.used}
                                </h3>
                                <p className="text-xs text-[#9A3412] mt-1">
                                    of {promo.limit} limit ({percentage.toFixed(0)}%)
                                </p>
                            </div>

                            <div className="bg-[#DCFCE7] p-5 rounded-lg border border-[#B7E4C7]">
                                <p className="text-sm text-[#065F46] font-medium">
                                    Total Discount Applied
                                </p>
                                <h3 className="text-2xl font-semibold mt-1 text-[#064E3B]">
                                    Rs.{performance.totalDiscountApplied.toFixed(2)}
                                </h3>
                                <p className="text-xs text-[#047857] mt-1">
                                    Platform fee discounts only
                                </p>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div className="bg-[#F3D6DC] p-4 rounded-lg border border-[#E9C4CB]">
                                <p className="text-xs text-gray-600">Discount Type</p>
                                <p className="font-semibold mt-1 text-gray-800">
                                    {promo.discount}
                                </p>
                            </div>

                            <div className="bg-[#F3D6DC] p-4 rounded-lg border border-[#E9C4CB]">
                                <p className="text-xs text-gray-600">Created Date</p>
                                <p className="font-semibold mt-1 text-gray-800">
                                    {performance.createdDate}
                                </p>
                            </div>

                            <div className="bg-[#F3D6DC] p-4 rounded-lg border border-[#E9C4CB]">
                                <p className="text-xs text-gray-600">Last Used</p>
                                <p className="font-semibold mt-1 text-gray-800">
                                    {performance.lastUsed}
                                </p>
                            </div>
                        </div>

                        {/* Usage Progress */}
                        <div>
                            <p className="text-sm font-medium mb-2 text-gray-900">
                                Usage Progress
                            </p>
                            <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div
                                    className="h-2 bg-gray-800 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0</span>
                                <span>{promo.used} used</span>
                                <span>{promo.limit}</span>
                            </div>
                        </div>

                        {/* Usage History Table */}
                        <div>
                            <p className="text-sm font-medium mb-3 text-gray-900">
                                Recent Usage History
                            </p>

                            <div className="rounded-lg overflow-x-auto border border-[#E5E7EB]">
                                <table className="w-full min-w-[500px] text-sm">
                                    <thead className="text-left text-gray-700 bg-[#F3D6DC]">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Users</th>
                                            <th className="px-4 py-3 font-medium">Discount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performance.usageHistory && performance.usageHistory.length > 0 ? (
                                            performance.usageHistory.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-t border-[#E5E7EB] text-gray-800"
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {item.date}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.users}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        Rs.{item.discount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-gray-500 bg-white">
                                                    No usage history recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer Help */}
                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex items-start gap-3 mt-auto">
                            <Icons.Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                                <h3 className="text-gray-800 font-semibold text-sm mb-1">
                                    Analytics Help
                                </h3>
                                <p className="text-gray-600 text-xs">
                                    These metrics help track the impact of promotional campaigns.
                                    All discounts apply only to the platform fee, protecting rental and service fees.
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 min-h-[200px]">
                        {isLoading ? "Fetching performance data..." : "No performance data available."}
                    </div>
                )}
            </div>
        </CommonModal>
    );
}
