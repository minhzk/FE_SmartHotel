import { sendRequest } from '@/utils/api';

export class UploadService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async uploadBase64Image(
        base64Image: string,
        description: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/uploads/base64`,
            method: 'POST',
            body: {
                base64Image,
                description,
            },
        });
    }
}
