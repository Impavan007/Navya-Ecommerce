"use client";

import React, { useState, useEffect } from "react";
import { RiCloseLine } from "react-icons/ri";
import { AiOutlineInfoCircle } from "react-icons/ai";

import usePromoStore, { Promo } from "../../store/PromoCode/PromoStore";
import { toast } from "react-hot-toast";
import CommonModal from "@/app/components/common/CommonModal";

type Props = {
    promo: Promo;
    onClose: () => void;
};

export default function EditPromoCode({
    promo,
    onClose,
}: Props) {
    const [discountValue, setDiscountValue] = useState(
        promo.discount_value.toString()
    );
    const [usageLimit, setUsageLimit] = useState(promo.limit >= 999999 ? "" : promo.limit.toString());
    const [expiryDate, setExpiryDate] = useState(promo.rawExpiryDate);
    const [status, setStatus] = useState<"Active" | "Disabled" | "Expired">(
        promo.status
    );

    const { updatePromoCode, isSaving } = usePromoStore();

    const handleSave = async () => {
        const payload: any = {
            discount_value: Number(discountValue),
            usage_limit: usageLimit ? Number(usageLimit) : null,
            status: status
        };

        if (expiryDate) {
            payload.expiry_date = expiryDate;
        }

        const success = await updatePromoCode(promo._id, payload);
        if (success) {
            toast.success("Promo code updated successfully");
            onClose();
        } else {
            toast.error("Failed to update promo code");
        }
    };

    return (
        <CommonModal
            isOpen={true}
            onClose={onClose}
            title="Edit Promo Code"
            size="lg"
            loading={isSaving}
        >
            <div className="space-y-8 bg-[#FAF6F3] p-2 rounded-lg">
                {/* Promo Code */}
                <div>
                    <label className="text-sm font-medium text-gray-700">
                        Promo Code
                    </label>
                    <input
                        value={promo.code}
                        disabled
                        className="w-full mt-2 border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-gray-800 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Promo code cannot be changed after creation.
                    </p>
                </div>

                {/* Discount Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Discount Type
                        </label>
                        <select
                            disabled
                            className="w-full mt-2 border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-gray-700 focus:outline-none"
                        >
                            <option>
                                {promo.discount.includes("%")
                                    ? "Percentage (%)"
                                    : "Fixed Amount (Rs.)"}
                            </option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            Discount type cannot be changed.
                        </p>
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
                                {promo.discount.includes("%") ? "%" : "Rs."}
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
                            className="w-full mt-2 border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-gray-800 focus:outline-none"
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
                            className="w-full mt-2 border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-gray-800 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Status */}
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
                            <li>
                                Promo codes apply only to the platform fee.
                            </li>
                            <li>
                                Rental fee, cleaning fee, and security deposit are not discounted.
                            </li>
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
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </CommonModal>
    );
}
