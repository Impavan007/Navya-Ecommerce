/**
 * Wishlist API Service
 * Handles wishlist-related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { WishlistApiResponse, WishlistResponse, ApiResponse, UpdateWishlistApiResponse } from '../../types/api';

export class WishlistApiService {
  /**
   * Get all wishlists for the current user
   */
  async getAllWishlists(): Promise<ApiResponse<WishlistResponse>> {
    return baseApiService.get<WishlistResponse>(ENDPOINTS.WISHLIST.GET_ALL);
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.post<{ message: string }>(ENDPOINTS.WISHLIST.ADD, {
      product_id: productId
    });
  }

  /**
   * Update wishlist with products array (used for move to wishlist from cart)
   */
  async updateWishlist(productIds: string[]): Promise<UpdateWishlistApiResponse> {
    return baseApiService.post<UpdateWishlistApiResponse['data']>(ENDPOINTS.WISHLIST.UPDATE, {
      products: productIds
    }) as unknown as UpdateWishlistApiResponse;
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<ApiResponse<{ message: string }>> {
    return baseApiService.delete<{ message: string }>(ENDPOINTS.WISHLIST.REMOVE(productId));
  }
}

// Export singleton instance
export const wishlistApiService = new WishlistApiService();
