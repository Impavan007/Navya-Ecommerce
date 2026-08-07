/**
 * AI API Service for User Section
 * Handles all AI-related API calls
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { ApiResponse } from '../../types/api';

export interface StylistChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface StylistChatRequest {
  message: string;
  chatHistory: StylistChatMessage[];
}

export interface StylistChatResponse {
  reply: string;
}

export class AiApiService {
  /**
   * Send a message to the AI Stylist Chat
   */
  async sendStylistMessage(data: StylistChatRequest): Promise<ApiResponse<StylistChatResponse>> {
    return baseApiService.post<StylistChatResponse>(ENDPOINTS.AI.STYLIST_CHAT, data);
  }
}

// Export singleton instance
export const aiApiService = new AiApiService();
