/**
 * Chat API Service for User Section
 */

import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { ChatMessagesApiResponse } from '../../types/api';

export const chatApiService = {
    /**
     * Get chat messages by chat ID
     */
    getChatMessages: async (chatId: string, page = 1, limit = 50): Promise<ChatMessagesApiResponse> => {
        const response = await baseApiService.get<any>(
            `${ENDPOINTS.CHATS.MESSAGES(chatId)}?page=${page}&limit=${limit}`
        );
        return {
            ...response,
            message: response.message || '',
        } as ChatMessagesApiResponse;
    },
};
