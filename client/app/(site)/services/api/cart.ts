/**
 * Cart API Service for User Section
 * Handles all cart-related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type {
  Cart,
  CartItem,
  ApiResponse,
  CartResponse,
  ApiCartItem,
} from '../../types/api';

export interface AddToCartRequest {
  productId: string;
  size: string;
  startDate?: string; // format: YYYY-MM-DD
  endDate?: string;   // format: YYYY-MM-DD
  quantity?: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  size?: string;
  rentalDays?: number; // 4 | 7 | 14 | 30
}

export class CartApiService {
  /**
   * Get user's cart
   */
  async getCart(): Promise<CartResponse> {
    return baseApiService.get<{ cart: ApiCartItem[]; total: number }>('/renter/cart') as unknown as CartResponse;
  }

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartRequest): Promise<ApiResponse<Cart>> {
    // Backend expects POST /renter/cart with productId, size, startDate, endDate
    return baseApiService.post<Cart>(ENDPOINTS.CART.ADD, data);
  }

  /**
   * Update cart item
   */
  async updateCartItem(data: UpdateCartItemRequest): Promise<ApiResponse<Cart>> {
    const { cartItemId, ...payload } = data;
    return baseApiService.post<Cart>(ENDPOINTS.CART.UPDATE(cartItemId), payload);
  }

  /**
   * Remove item from cart by product ID
   */
  async removeFromCart(productId: string): Promise<CartResponse> {
    return baseApiService.delete<{ cart: ApiCartItem[]; total: number }>(`/renter/cart/${productId}`) as unknown as CartResponse;
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.delete<{ message: string }>(ENDPOINTS.CART.CLEAR);
  }

  /**
   * Get cart item count (for badge)
   */
  async getCartCount(): Promise<ApiResponse<{ count: number }>> {
    return baseApiService.get<{ count: number }>('/cart/count');
  }

  /**
   * Validate cart before checkout
   */
  async validateCart(): Promise<ApiResponse<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
    updatedCart?: Cart;
  }>> {
    return baseApiService.post('/cart/validate');
  }

  /**
   * Apply coupon/discount code
   */
  async applyCoupon(couponCode: string): Promise<ApiResponse<{
    valid: boolean;
    discount?: number;
    discountType?: 'percentage' | 'fixed';
    message?: string;
    updatedCart?: Cart;
  }>> {
    return baseApiService.post('/cart/coupon', { couponCode });
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(): Promise<ApiResponse<Cart>> {
    return baseApiService.delete<Cart>('/cart/coupon');
  }

  /**
   * Calculate shipping cost
   */
  async calculateShipping(address: {
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }): Promise<ApiResponse<{
    shippingCost: number;
    estimatedDelivery: string;
    available: boolean;
  }>> {
    return baseApiService.post('/cart/shipping', address);
  }
}

// Export singleton instance
export const cartApiService = new CartApiService();
