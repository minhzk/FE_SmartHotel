import { sendRequest } from '@/utils/api';

export class ChatService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async getSessionMessages(
        sessionId: string,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/chatbot/sessions/${sessionId}/messages`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }
}
