/**
 * Newsletter API Service for User Section
 * Handles all newsletter-related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { ApiResponse, NewsletterRequest, NewsletterApiResponse } from '../../types/api';

export class NewsletterApiService {
    /**
     * Subscribe to newsletter
     */
    async subscribe(data: NewsletterRequest): Promise<ApiResponse<any>> {
        return baseApiService.post<any>(ENDPOINTS.NEWSLETTER.CREATE, data);
    }
}

// Export singleton instance
export const newsletterApiService = new NewsletterApiService();
