/**
 * Checkout API Service
 * Handles checkout-related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { ApiResponse } from '../../types/api';

export interface CheckoutCalculateRequest {
    products: {
        product: string;
        quantity: number;
        size: string;
        start_date: string;
        end_date: string;
    }[];
    promo_code?: string;
}

export interface CheckoutCalculateResponse {
    success: boolean;
    message: string;
    data: {
        products: {
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
        }[];
        pricingBreakdown: {
            price: number;
            rentalAmount: number;
            cleaningFee: number;
            securityDeposit: number;
            serviceCharge: number;
            serviceChargePercentage: number;
            promoCode: string | null;
            totalAmount: number;
        };
        paymentIntent: {
            clientSecret: string;
            setupIntentId: string;
            customerId: string;
            publishableKey: string;
        };
    };
}

export class CheckoutApiService {
    /**
     * Calculate checkout details
     */
    async calculateCheckout(data: CheckoutCalculateRequest): Promise<ApiResponse<CheckoutCalculateResponse['data']>> {
        return baseApiService.post<CheckoutCalculateResponse['data']>(ENDPOINTS.CHECKOUT.CALCULATE, data);
    }
}

// Export singleton instance
export const checkoutApiService = new CheckoutApiService();
