/**
 * How It Works API Service for User Section
 * Handles all how-it-works related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { ApiResponse, HowItWorksData } from '../../types/api';

export class HowItWorksApiService {
    /**
     * Get how it works content
     */
    async getHowItWorks(): Promise<ApiResponse<HowItWorksData>> {
        return baseApiService.get<HowItWorksData>(ENDPOINTS.HOW_IT_WORKS.GET);
    }
}

// Export singleton instance
export const howItWorksApiService = new HowItWorksApiService();
