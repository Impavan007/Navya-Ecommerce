import { baseApiService } from './base';
import type { ApiResponse } from '../../types/api';
import type { LenderProductsResponse as LenderProductsResponseType } from '../../types/lender';

export class LenderApiService {
  /**
   * Get products by lender ID with optional filters
   */
  async getProductsByLender(
    lenderId: string,
    filters?: {
      page?: number;
      limit?: number;
      sizes?: string | string[];
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
      startDate?: string;
      endDate?: string;
      available?: boolean;
      rentalDays?: number;
    }
  ): Promise<ApiResponse<LenderProductsResponseType>> {
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters?.sort) queryParams.append('sort', filters.sort);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.available !== undefined) queryParams.append('available', filters.available.toString());
    if (filters?.rentalDays) queryParams.append('rentalDays', filters.rentalDays.toString());
    
    if (filters?.sizes) {
      if (Array.isArray(filters.sizes)) {
        if (filters.sizes.length > 0) queryParams.append('sizes', filters.sizes.join(','));
      } else {
        queryParams.append('sizes', filters.sizes);
      }
    }
    
    const url = `/product-bylender/${lenderId}?${queryParams.toString()}`;
    return baseApiService.get<LenderProductsResponseType>(url);
  }
}

// Export singleton instance
export const lenderApiService = new LenderApiService();