export class ReviewService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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
}
