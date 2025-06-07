import { sendRequest } from "@/utils/api";

export interface CreateRoomRequest {
    hotel_id: string;
    room_number: string;
    room_type: string;
    price_per_night: number;
    max_adults: number;
    max_children: number;
    description?: string;
    amenities?: string[];
    images?: any[];
    is_active?: boolean;
    is_bookable?: boolean;
}

export interface UpdateRoomRequest {
    _id: string;
    hotel_id?: string;
    room_number?: string;
    room_type?: string;
    price_per_night?: number;
    max_adults?: number;
    max_children?: number;
    description?: string;
    amenities?: string[];
    images?: any[];
    is_active?: boolean;
    is_bookable?: boolean;
}

export interface GetRoomsRequest {
    current?: number;
    pageSize?: number;
    hotel_id?: string;
    room_type?: string;
    is_active?: boolean;
    [key: string]: any;
}

export class RoomService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async createRoom(data: CreateRoomRequest, accessToken: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/api/v1/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw error;
        }

        return res.json();
    }

    static async updateRoom(data: UpdateRoomRequest, accessToken: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/api/v1/rooms/${data._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw error;
        }

        return res.json();
    }

    static async deleteRoom(id: string, accessToken: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/api/v1/rooms/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            throw error;
        }

        return res.json();
    }

    static async getRoomById(id: string, accessToken: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/api/v1/rooms/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            throw error;
        }

        return res.json();
    }

    static async getRooms(params: GetRoomsRequest, accessToken: string): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/rooms`,
            method: 'GET',
            queryParams: params,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            nextOption: {
                next: { tags: ['list-rooms'] }
            }
        });
    }

    static async getRoomsByHotelId(hotelId: string, accessToken?: string): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/rooms/hotel/${hotelId}`,
            method: 'GET',
            headers: accessToken ? {
                Authorization: `Bearer ${accessToken}`,
            } : undefined,
            nextOption: {
                next: { tags: [`rooms-hotel-${hotelId}`] }
            }
        });
    }
}
