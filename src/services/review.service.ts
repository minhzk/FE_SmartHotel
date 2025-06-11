import { sendRequest } from '@/utils/api';

export interface GetReviewsRequest {
    current?: number;
    pageSize?: number;
    status?: string;
    rating?: number;
    [key: string]: any;
}

export interface UpdateReviewRequest {
    _id: string;
    rating: number;
    review_text: string;
}

export interface CreateReviewRequest {
    hotel_id: string;
    booking_id: string;
    rating: number;
    review_text: string;
}

export class ReviewService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async getReviews(
        params: GetReviewsRequest,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/reviews`,
            method: 'GET',
            queryParams: params,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            nextOption: {
                next: { tags: ['list-reviews'] },
            },
        });
    }

    static async getReviewsByHotelId(
        hotelId: string,
        params?: { pageSize?: number; current?: number }
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/reviews/hotel/${hotelId}`,
            method: 'GET',
            queryParams: params,
            nextOption: {
                next: { tags: [`reviews-hotel-${hotelId}`] },
            },
        });
    }

    static async updateReviewStatus(
        reviewId: string,
        status: string,
        accessToken: string
    ): Promise<any> {
        const res = await fetch(
            `${this.baseUrl}/api/v1/reviews/${reviewId}/status`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ status }),
            }
        );

        if (!res.ok) {
            const error = await res.json();
            throw error;
        }

        return res.json();
    }

    static async replyToReview(
        reviewId: string,
        responseText: string,
        responseBy: string,
        accessToken: string
    ): Promise<any> {
        const res = await fetch(
            `${this.baseUrl}/api/v1/reviews/${reviewId}/reply`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    response_text: responseText,
                    response_by: responseBy,
                }),
            }
        );

        if (!res.ok) {
            const error = await res.json();
            throw error;
        }

        return res.json();
    }

    static async getUserReviews(
        queryParams: any,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/reviews/user`,
            method: 'GET',
            queryParams,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async updateReview(
        data: UpdateReviewRequest,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/reviews`,
            method: 'PATCH',
            body: data,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async deleteReview(
        reviewId: string,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/reviews/${reviewId}`,
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async createReview(
        data: CreateReviewRequest,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/reviews`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: data,
        });
    }
}
