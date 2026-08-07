"use client";

import React, { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { AiOutlineInfoCircle } from "react-icons/ai";

import usePromoStore, { Promo } from "../../store/PromoCode/PromoStore";
import { toast } from "react-hot-toast";
import CommonModal from "@/app/components/common/CommonModal";

type Props = {
    onClose: () => void;
};

export default function CreatePromoCode({
    onClose,
}: Props) {
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<"Percentage" | "FixedAmount">("FixedAmount");
    const [discountValue, setDiscountValue] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [status, setStatus] = useState<"Active" | "Disabled">("Active");

    const { addPromoCode, isSaving } = usePromoStore();

    const handleCreate = async () => {
        if (!code || !discountValue || !expiryDate) return;

        const payload = {
            code: code.toUpperCase(),
            discount_type: discountType,
            discount_value: Number(discountValue),
            usage_limit: usageLimit ? Number(usageLimit) : null,
            expiry_date: expiryDate,
            status: status
        };

        const success = await addPromoCode(payload);
        if (success) {
            toast.success("Promo code created successfully");
            onClose();
        } else {
            toast.error("Failed to create promo code");
        }
    };

    return (
        <CommonModal
            isOpen={true}
            onClose={onClose}
            title="New Campaign"
            size="lg"
            loading={isSaving}
        >
            <div className="space-y-8 bg-[#FAF6F3] p-4 rounded-lg">
                {/* Promo Code */}
                <div>
                    <label className="text-sm font-medium text-gray-700">
                        Promo Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        placeholder="e.g., SUMMER20"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="w-full mt-2 border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-gray-800 focus:outline-none uppercase placeholder:text-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Promo code cannot be changed after creation.
                    </p>
                </div>

                {/* Discount Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Discount Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={discountType}
                            onChange={(e) =>
                                setDiscountType(e.target.value as any)
                            }
                            disabled
                            className="w-full mt-2 border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-gray-700 focus:outline-none cursor-not-allowed"
                        >
                            <option value="Percentage" disabled>Percentage Scaling (%) - Disabled</option>
                            <option value="FixedAmount">Fixed Amount (Rs.)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Discount Value <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-2">
                            <input
                                value={discountValue}
                                onChange={(e) =>
                                    setDiscountValue(e.target.value)
                                }
                                className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-gray-800 focus:outline-none"
                            />
                            <span className="absolute right-0 top-2 text-gray-600">
                                {discountType === "Percentage" ? "%" : "Rs."}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Usage + Expiry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Usage Limit
                        </label>
                        <input
                            value={usageLimit}
                            onChange={(e) =>
                                setUsageLimit(e.target.value)
                            }
                            placeholder="Unlimited"
                            className="w-full mt-2 border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-gray-800 focus:outline-none placeholder:text-gray-300"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Leave empty for unlimited usage.
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Expiry Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) =>
                                setExpiryDate(e.target.value)
                            }
                            className="w-full mt-2 border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-gray-800 focus:outline-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Status Toggle */}
                <div>
                    <label className="text-sm font-medium block mb-3 text-gray-700">
                        Status
                    </label>
                    <div className="flex gap-8 text-sm text-gray-800">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={status === "Active"}
                                onChange={() => setStatus("Active")}
                                className="accent-blue-600"
                            />
                            Active
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={status === "Disabled"}
                                onChange={() => setStatus("Disabled")}
                                className="accent-blue-600"
                            />
                            Disabled
                        </label>
                    </div>
                </div>

                {/* Rules Box */}
                <div className="bg-[#FFFFFF] border rounded-lg p-5 flex gap-3">
                    <AiOutlineInfoCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-2">
                            Discount Rules
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                            <li>Applied strictly to platform service fees.</li>
                            <li>Zero impact on rental payouts or service provider margins.</li>
                        </ul>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t font-poppins">
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleCreate}
                        disabled={isSaving || !code || !discountValue || !expiryDate}
                        className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                        {isSaving ? "Finalizing..." : "Initialize Campaign"}
                    </button>
                </div>
            </div>
        </CommonModal>
    );
}
