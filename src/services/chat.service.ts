import { sendRequest } from '@/utils/api';

export interface CreateChatSessionRequest {
    capabilities: {
        hotel_queries: boolean;
        room_queries: boolean;
        booking_assistance: boolean;
    };
    hotel_id?: string;
    mode?: string;
    system_context?: string;
    user_info?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface SendMessageRequest {
    session_id: string;
    message: string;
    is_general_mode: boolean;
    capabilities: {
        hotel_queries: boolean;
        room_queries: boolean;
        booking_assistance: boolean;
    };
}

export interface SendFeedbackRequest {
    messageId: string;
    sessionId: string;
    feedbackType: 'like' | 'dislike';
    userId?: string;
}

export class ChatService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async createSession(
        data: CreateChatSessionRequest,
        accessToken?: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/chatbot/sessions`,
            method: 'POST',
            body: data,
            headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : undefined,
        });
    }

    static async getChatHistory(
        sessionId: string,
        accessToken?: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/chatbot/sessions/${sessionId}/messages`,
            method: 'GET',
            headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : undefined,
        });
    }

    static async sendMessage(
        data: SendMessageRequest,
        accessToken?: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/chatbot/messages`,
            method: 'POST',
            body: data,
            headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : undefined,
        });
    }

    static async sendFeedback(
        data: SendFeedbackRequest
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/chatbot/feedback`,
            method: 'POST',
            body: data,
        });
    }

    static async closeSession(
        sessionId: string,
        accessToken?: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/chatbot/sessions/${sessionId}/close`,
            method: 'POST',
            headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : undefined,
        });
    }

    static async getChatSessions(
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/chatbot/sessions`,
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    }

    static async getSessionMessages(
        sessionId: string,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/chatbot/sessions/${sessionId}/messages`,
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    }
}
