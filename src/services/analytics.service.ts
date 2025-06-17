import { sendRequest } from '@/utils/api';

export const AnalyticsService = {
    // Thống kê doanh thu theo thời gian
    getRevenueStats: (params: any, access_token: string) => {
        return sendRequest<IBackendRes<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/revenue`,
            method: 'GET',
            queryParams: params,
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    },

    // Thống kê đặt phòng
    getBookingStats: (params: any, access_token: string) => {
        return sendRequest<IBackendRes<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/bookings`,
            method: 'GET',
            queryParams: params,
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    },

    // Thống kê khách sạn theo thành phố
    getHotelsByCity: (access_token: string) => {
        return sendRequest<IBackendRes<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/hotels-by-city`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    },

    // Thống kê tổng quan
    getOverviewStats: (access_token: string) => {
        return sendRequest<IBackendRes<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/overview`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    },

    // Thống kê top khách sạn
    getTopHotels: (params: any, access_token: string) => {
        return sendRequest<IBackendRes<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/top-hotels`,
            method: 'GET',
            queryParams: params,
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    },

    // Thống kê người dùng
    getUserStats: (params: any, access_token: string) => {
        return sendRequest<IBackendRes<any>>({
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/users`,
            method: 'GET',
            queryParams: params,
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    },
};
