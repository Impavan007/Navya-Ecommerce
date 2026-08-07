/**
 * Messages API Service
 * Handles fetching chat history for products
 */

import { BaseApiService, ApiResponse } from './base';

export interface ChatParticipant {
    _id: string;
    name: string;
    role: string;
    profile_image: string;
}

export interface Attachment {
    type: string;
    url: string;
    name: string;
    size?: number;
    full_url?: string;
}

export interface ChatMessage {
    _id: string;
    chatId?: string;
    sender: string | ChatParticipant;
    receiver: string | ChatParticipant;
    content: string;
    attachments?: Attachment[];
    delivered: boolean;
    delivered_at: string | null;
    read: boolean;
    read_at: string | null;
    created_at: string;
}

export interface ChatData {
    chatId: string;
    participants: {
        renter: ChatParticipant;
        lender: ChatParticipant;
    };
    messages: ChatMessage[];
    product: {
        _id: string;
        name: string;
        cover_image: string;
        images: string[];
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface LenderChatOtherUser {
    _id: string;
    name: string;
    profile_image: string | null;
    role: string;
}

export interface LenderChatItem {
    id: string;
    chatSlugId: string;
    type: string;
    subject: string;
    product: {
        _id: string;
        name: string;
        cover_image: string;
    };
    productName: string;
    status: string;
    otherUser: LenderChatOtherUser;
    lastMessageAt: string;
    unreadCount: number;
}

export interface LenderChatsData {
    items: LenderChatItem[];
    totalUnreadCount: number;
    filterCounts: {
        unread: number;
        flagged: number;
        activeOrders: number;
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

export class MessagesApiService extends BaseApiService {
    /**
     * Fetch chat history for a specific product
     */
    async getProductMessages(productId: string, page: number = 1): Promise<ApiResponse<ChatData>> {
        return this.get<ChatData>(`/renter/messages/${productId}?page=${page}&limit=50`);
    }

    /**
     * Send a message (Fallback if socket fails)
     */
    async sendMessage(productId: string, content: string, orderId?: string, attachments?: Attachment[]): Promise<ApiResponse<ChatMessage>> {
        const payload: any = { 
            productId, 
            content,
            message: content // Backup for legacy endpoints
        };
        if (orderId) payload.orderId = orderId;
        if (attachments) payload.attachments = attachments;
        
        return this.post<ChatMessage>('/chat/send-message', payload);
    }

    /**
     * Fetch all chats for the lender
     */
    async getLenderChats(page: number = 1): Promise<ApiResponse<LenderChatsData>> {
        return this.get<LenderChatsData>(`/chats?page=${page}&limit=20`);
    }

    /**
     * Fetch messages for a specific chat
     */
    async getChatMessages(chatId: string, page: number = 1): Promise<ApiResponse<ChatData>> {
        return this.get<ChatData>(`/chats/${chatId}/messages?page=${page}&limit=50`);
    }

    /**
     * Upload chat attachments
     */
    async uploadAttachments(files: File[]): Promise<ApiResponse<{ attachments: Attachment[] }>> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('attachments', file);
        });

        return this.upload<{ attachments: Attachment[] }>('/chat/upload-attachments', formData);
    }
}

export const messagesApiService = new MessagesApiService();
