/**
 * Waitlist API Service
 * Handles waitlist-related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { WaitlistRequest, WaitlistResponse, ApiResponse } from '../../types/api';

export class WaitlistApiService {
  /**
   * Create waitlist entry
   */
  async createWaitlist(data: WaitlistRequest): Promise<ApiResponse<WaitlistResponse>> {
    const payload = {
      name: data.name,
      email: data.email,
      city: data.city,
      postal_code: data.PostalCode,
      ...(data.role && { role: data.role }),
      ...(data.brands && { brands: data.brands }),
    };

    return baseApiService.post<WaitlistResponse>(
      ENDPOINTS.WAITLIST.CREATE,
      payload
    );
  }
}

// Export singleton instance
export const waitlistApiService = new WaitlistApiService();
