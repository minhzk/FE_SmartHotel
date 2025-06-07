import { sendRequest } from '@/utils/api';

export class FavoriteService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async getFavorites(accessToken: string): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/favorites`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            nextOption: {
                tags: ['favorites'],
            },
        });
    }

    static async removeFavorite(
        hotelId: string,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/favorites/${hotelId}`,
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async addFavorite(
        hotelId: string,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/favorites`,
            method: 'POST',
            body: { hotel_id: hotelId },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async checkFavoriteStatus(
        hotelId: string,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/favorites/check/${hotelId}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }
}
