import { sendRequest } from '@/utils/api';

export interface CreateHotelRequest {
    name: string;
    city: string;
    address: string;
    description?: string;
    images?: any[];
    amenities?: string[];
    rating?: number;
    min_price?: number;
    max_capacity?: number;
    is_active?: boolean;
}

export interface UpdateHotelRequest {
    _id: string;
    name?: string;
    city?: string;
    address?: string;
    description?: string;
    images?: any[];
    amenities?: string[];
    rating?: number;
    min_price?: number;
    max_capacity?: number;
    is_active?: boolean;
}

export interface GetHotelsRequest {
    current?: number;
    pageSize?: number;
    name?: string;
    city?: string;
    is_active?: boolean;
    [key: string]: any;
}

export class HotelService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async createHotel(
        data: CreateHotelRequest,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/hotels`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: data,
        });
    }

    static async updateHotel(
        data: UpdateHotelRequest,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/hotels`,
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: data,
        });
    }

    static async deleteHotel(
        id: string,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/hotels/${id}`,
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async getHotelById(id: string, accessToken: string): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/hotels/${id}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async getHotelByIdPublic(id: string, accessToken?: string): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/hotels/${id}`,
            method: 'GET',
            headers: accessToken ? {
                Authorization: `Bearer ${accessToken}`,
            } : undefined,
            nextOption: {
                next: { tags: [`hotel-${id}`] }
            }
        });
    }

    static async getHotels(params: GetHotelsRequest, accessToken: string): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/hotels`,
            method: 'GET',
            queryParams: params,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            nextOption: {
                next: { tags: ['list-hotels'] }
            }
        });
    }
}
