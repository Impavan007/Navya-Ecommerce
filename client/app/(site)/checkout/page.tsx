"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "../stores/checkoutStore";
import Breadcrumb from "../components/Breadcrumb";
import ProtectedRoute from "../components/ProtectedRoute";
import axiosClient from "@/app/admin/adminApi/axiosClient";
import toast from "react-hot-toast";

export default function CheckoutPage() {
    const router = useRouter();
    const { checkoutData, isLoading } = useCheckoutStore();
    const [promoCode, setPromoCode] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        if (!checkoutData) return;

        try {
            setIsProcessing(true);
            const payload = {
                products: checkoutData.products.map(p => ({
                    product: p.productId,
                    quantity: p.quantity,
                    size: p.size,
                    start_date: p.dates.start,
                    end_date: p.dates.end
                })),
                address: checkoutData.addressId || "699ed3ee314827af8870fc2e",
                promo_code: typeof checkoutData.pricingBreakdown.promoCode === 'object'
                    ? (checkoutData.pricingBreakdown.promoCode as any)?.code
                    : checkoutData.pricingBreakdown.promoCode || "",
            };

            const response = await axiosClient.post("/renter/create-order", payload);
            if (response.data.success) {
                toast.success("Order Placed Successfully!");
                useCheckoutStore.getState().clearCheckoutData();
                router.push("/bookings");
            } else {
                toast.error(response.data.message || "Failed to create order");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || "Something went wrong.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            toast.error("Please enter a promo code.");
            return;
        }

        if (!checkoutData) return;

        try {
            setIsProcessing(true);
            const payload = {
                products: checkoutData.products.map(p => ({
                    product: p.productId,
                    quantity: p.quantity,
                    size: p.size,
                    start_date: p.dates.start,
                    end_date: p.dates.end
                })),
                promo_code: promoCode
            };

            const response = await axiosClient.post("/renter/promo-codes/apply", payload);

            if (response.data.success) {
                const { products, pricingBreakdown } = response.data.data;

                useCheckoutStore.getState().setCheckoutData({
                    ...checkoutData,
                    products,
                    pricingBreakdown
                });

                toast.success(response.data.message || "Promo code applied!");
                setPromoCode("");
            } else {
                toast.error(response.data.message || "Failed to apply promo code");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || "Something went wrong.");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (!checkoutData && !isLoading) {
            router.push("/cart");
        }
    }, [checkoutData, isLoading, router]);

    if (!checkoutData) {
        return (
            <div className="min-h-screen bg-[#F8EEEE] flex items-center justify-center">
                <p className="font-poppins">Loading checkout details...</p>
            </div>
        );
    }

    const { pricingBreakdown, products } = checkoutData;

    return (
        <ProtectedRoute>
            <div className="w-full min-h-screen bg-[#F8EEEE] flex flex-col font-poppins text-[#3D1126]">
                <div className="w-full mx-auto py-8 flex-1">
                    <Breadcrumb
                        items={[
                            { label: "Home", href: "/" },
                            { label: "My Account", href: "/account" },
                            { label: "My Bookings", href: "/bookings" },
                            { label: "Checkout" },
                        ]}
                    />

                    <div className="mt-8 flex px-[20px] lg:px-[40px] flex-col lg:flex-row gap-8">
                        {/* Left Column: Delivery & Items Details */}
                        <div className="w-full lg:w-[65%] flex flex-col gap-6">
                            {/* Delivery Address Card */}
                            <div className="bg-[#EFDFE1] p-6 border border-[#E5CDD1] rounded-md">
                                <h3 className="font-semibold text-lg mb-3">Delivery Address</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Your order will be shipped to your registered address.
                                </p>
                                <div className="mt-4 p-4 bg-white/50 border border-[#E5CDD1]/50 rounded-md">
                                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Shipping Destination</span>
                                    <p className="text-sm text-gray-800 font-medium mt-1">Primary Registered Address</p>
                                </div>
                            </div>

                            {/* Cart Items Summary */}
                            <div className="bg-[#EFDFE1] p-6 border border-[#E5CDD1] rounded-md">
                                <h3 className="font-semibold text-lg mb-4">Items in your Order</h3>
                                <div className="flex flex-col gap-4">
                                    {products.map((p, idx) => (
                                        <div key={idx} className="flex gap-4 items-center bg-white p-4 rounded-md border border-[#E5CDD1] shadow-sm">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm text-gray-900">{p.productName}</h4>
                                                <p className="text-xs text-gray-500 mt-1">Size: {p.size} &nbsp;|&nbsp; Qty: {p.quantity}</p>
                                                <p className="text-xs text-gray-500">Duration: {p.dates.start} to {p.dates.end}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-sm text-[#3D1126]">Rs.{p.pricing.rentalAmount}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Promo Code Card */}
                            <div className="bg-[#EFDFE1] p-6 border border-[#E5CDD1] rounded-md">
                                <h3 className="font-semibold text-lg mb-4">Apply Promo Code</h3>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="e.g. FESTIVE10"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="flex-1 bg-white border border-[#E5CDD1] px-4 py-2 text-sm rounded focus:outline-none focus:border-black transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyPromo}
                                        className="bg-[#1A1A1A] hover:bg-black text-white px-6 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        Apply
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Enter any valid coupon code to avail of additional discounts.</p>
                            </div>
                        </div>

                        {/* Right Column: Price Details & Checkout Button */}
                        <div className="w-full lg:w-[35%] flex flex-col gap-6">
                            <div className="bg-[#EFDFE1] p-6 border border-[#E5CDD1] rounded-md">
                                <h2 className="font-semibold text-lg mb-6">Price Details</h2>

                                <div className="flex flex-col gap-4 text-[13px]">
                                    <div className="flex justify-between items-center text-[#555]">
                                        <span>Rental Price</span>
                                        <span className="text-[#3D1126] font-semibold">Rs.{pricingBreakdown.price}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[#555]">
                                        <span>Security Deposit</span>
                                        <span className="text-[#3D1126] font-semibold">Rs.{pricingBreakdown.securityDeposit}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[#555]">
                                        <span>Cleaning Fee</span>
                                        <span className="text-[#3D1126] font-semibold">Rs.{pricingBreakdown.cleaningFee}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[#555]">
                                        <span>Service Charges ({pricingBreakdown.serviceChargePercentage}%)</span>
                                        <span className="text-[#3D1126] font-semibold">Rs.{pricingBreakdown.serviceCharge}</span>
                                    </div>
                                    {pricingBreakdown.promoCode && (
                                        <div className="flex justify-between items-center text-green-700">
                                            <span>Promo Discount ({
                                                typeof pricingBreakdown.promoCode === 'object'
                                                    ? `${(pricingBreakdown.promoCode as any)?.discountValue}${(pricingBreakdown.promoCode as any)?.discountType === 'Percentage' ? '%' : ' OFF'}`
                                                    : 'Applied'
                                            })</span>
                                            <span className="font-semibold">- Rs.{
                                                typeof pricingBreakdown.promoCode === 'object'
                                                    ? (pricingBreakdown.promoCode as any)?.discount
                                                    : 0
                                            }</span>
                                        </div>
                                    )}

                                    <div className="h-px bg-[#E5CDD1] w-full my-2" />

                                    <div className="flex justify-between items-center font-bold text-base text-[#3D1126]">
                                        <span>Total Amount</span>
                                        <span>Rs.{pricingBreakdown.totalAmount}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full bg-[#1A1A1A] hover:bg-black text-white py-4 rounded-md text-sm font-semibold tracking-wide transition-colors mt-8 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isProcessing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                    {isProcessing ? "Placing Order..." : `Proceed to Place Order (Rs.${pricingBreakdown.totalAmount})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
