export interface CreatePaymentRequest {
    booking_id: string;
    payment_type: string;
    payment_method: string;
    redirect_url?: string;
}

export class PaymentService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async updatePaymentStatus(paymentId: string, status: string, accessToken: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/api/v1/payments/${paymentId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ status }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw error;
        }

        return res.json();
    }

    static async createPayment(data: CreatePaymentRequest, accessToken: string): Promise<any> {
        const res = await fetch(`${this.baseUrl}/api/v1/payments`, {
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
}
