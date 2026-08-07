/**
 * Checkout Store using Zustand
 * Manages checkout calculation state globally
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckoutProduct {
    productId: string;
    productName: string;
    quantity: number;
    size: string;
    duration: number;
    dates: {
        start: string;
        end: string;
    };
    pricing: {
        basePricePerDay: number;
        discountedPricePerDay: number;
        discountPercentage: number;
        rentalAmount: number;
        cleaningFee: number;
        securityDeposit: number;
        promoDiscount: number;
    };
}

interface PromoCodeInfo {
    code: string;
    discount: number;
    discountType: string;
    discountValue: number;
}

interface PricingBreakdown {
    price: number;
    rentalAmount: number;
    cleaningFee: number;
    securityDeposit: number;
    serviceCharge: number;
    serviceChargePercentage: number;
    promoCode: string | PromoCodeInfo | null;
    totalAmount: number;
}

interface PaymentIntent {
    clientSecret: string;
    setupIntentId: string;
    customerId: string;
    publishableKey: string;
}

interface CheckoutData {
    products: CheckoutProduct[];
    pricingBreakdown: PricingBreakdown;
    paymentIntent?: PaymentIntent;
    addressId?: string;
}

interface CheckoutState {
    // State
    checkoutData: CheckoutData | null;
    isLoading: boolean;

    // Actions
    setCheckoutData: (data: CheckoutData) => void;
    clearCheckoutData: () => void;
    setLoading: (loading: boolean) => void;
}

export const useCheckoutStore = create<CheckoutState>()(
    persist(
        (set) => ({
            // Initial state
            checkoutData: null,
            isLoading: false,

            // Actions
            setCheckoutData: (data: CheckoutData) => {
                set({ checkoutData: data, isLoading: false });
            },

            clearCheckoutData: () => {
                set({ checkoutData: null });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },
        }),
        {
            name: 'navyaa-checkout', // Key for localStorage
        }
    )
);
