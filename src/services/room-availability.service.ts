import { sendRequest } from '@/utils/api';


export class RoomAvailabilityService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async generateRoomAvailability(data: any, accessToken: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/api/v1/room-availability/generate`, {
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

    static async updateRoomAvailabilityStatus(data: any, accessToken: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/api/v1/room-availability/bulk-update-status`, {
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

    static async getRoomAvailabilityByDateRange(roomId: string, startDate: string, endDate: string, accessToken: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/api/v1/room-availability/room/${roomId}/date-range?startDate=${startDate}&endDate=${endDate}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });
        
        if (!res.ok) {
            throw await res.json();
        }
        
        return res.json();
    }

    static async checkRoomDates(roomId: string, startDate: string, endDate: string, defaultPrice: number): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/room-availability/check-room-dates`,
            method: 'GET',
            queryParams: {
                roomId,
                startDate,
                endDate,
                defaultPrice
            },
        });
    }
}
