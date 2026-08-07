/**
 * Settings API Service for User Section
 * Handles all settings-related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { ApiResponse, SettingsData } from '../../types/api';

export class SettingsApiService {
  /**
   * Get application settings
   */
  async getSettings(): Promise<ApiResponse<SettingsData>> {
    return baseApiService.get<SettingsData>(ENDPOINTS.SETTINGS.GET);
  }
}

// Export singleton instance
export const settingsApiService = new SettingsApiService();

