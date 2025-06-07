import { sendRequest } from '@/utils/api';

export interface GetBookingsRequest {
    current?: number;
    pageSize?: number;
    status?: string;
    payment_status?: string;
    deposit_status?: string;
    dateRange?: string;
    search?: string;
    user_id?: string;
    hotel_id?: string;
    [key: string]: any;
}

export class BookingService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async getBookings(
        params: GetBookingsRequest,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/bookings`,
            method: 'GET',
            queryParams: params,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            nextOption: {
                next: { tags: ['list-bookings'] },
            },
        });
    }

    static async getBookingById(
        id: string,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/bookings/${id}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async updateBooking(
        id: string,
        data: any,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/bookings/${id}`,
            method: 'PATCH',
            body: data,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    }

    static async checkCompletedBookings(
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/bookings/check-completed`,
            method: 'POST',
            body: {},
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    }
}
