'use server';
import { auth, signIn } from '@/auth';
import { revalidateTag } from 'next/cache';
import { sendRequest } from './api';

export async function authenticate(username: string, password: string) {
    try {
        const r = await signIn('credentials', {
            username: username,
            password: password,
            // callbackUrl: "/",
            redirect: false,
        });
        return r;
    } catch (error) {
        if ((error as any).name === 'InvalidEmailPasswordError') {
            return {
                error: (error as any).type,
                code: 1,
            };
        } else if ((error as any).name === 'InactiveAccountError') {
            return {
                error: (error as any).type,
                code: 2,
            };
        } else {
            return {
                error: 'Internal server error',
                code: 0,
            };
        }
    }
}

export const handleCreateUserAction = async (data: any) => {
    const session = await auth();
    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: { ...data },
    });
    revalidateTag('list-users');
    return res;
};

export const handleUpdateUserAction = async (data: any) => {
    const session = await auth();
    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: { ...data },
    });
    revalidateTag('list-users');
    return res;
};

export const handleDeleteUserAction = async (id: any) => {
    const session = await auth();
    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${id}`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
    });

    revalidateTag('list-users');
    return res;
};

export const handleCreateHotelAction = async (data: any) => {
    const session = await auth();
    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: data,
    });

    revalidateTag('list-hotels');
    return res;
};

export const handleUpdateHotelAction = async (data: any) => {
    const session = await auth();
    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels`,
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: data,
    });

    revalidateTag('list-hotels');
    return res;
};

export const handleDeleteHotelAction = async (id: string) => {
    const session = await auth();
    const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels/${id}`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
    });

    revalidateTag('list-hotels');
    return res;
};

export const handleCreateRoomAction = async (body: any) => {
    const session = await auth();
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.user?.access_token}`,
            },
            body: JSON.stringify(body),
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw error;
    }

    return res.json();
};

export const handleUpdateRoomAction = async (body: any) => {
    const session = await auth();
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/${body._id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.user?.access_token}`,
            },
            body: JSON.stringify(body),
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw error;
    }

    return res.json();
};

export const handleDeleteRoomAction = async (id: string) => {
    const session = await auth();
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/${id}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.user?.access_token}`,
            },
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw error;
    }

    return res.json();
};

export const handleGenerateRoomAvailabilityAction = async (body: any) => {
    const session = await auth();
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/room-availability/generate`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.user?.access_token}`,
            },
            body: JSON.stringify(body),
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw error;
    }

    return res.json();
};

export const handleUpdateRoomAvailabilityStatusAction = async (body: any) => {
    const session = await auth();
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/room-availability/bulk-update-status`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.user?.access_token}`,
            },
            body: JSON.stringify(body),
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw error;
    }

    return res.json();
};

export const handleUpdatePaymentStatusAction = async (data: {
    paymentId: string;
    status: string;
}) => {
    'use server';

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/${data.paymentId}/status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.user?.access_token}`,
            },
            body: JSON.stringify({ status: data.status }),
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw error;
    }

    return res.json();
};

export const handleUpdateReviewStatusAction = async (data: {
    reviewId: string;
    status: string;
}) => {
    'use server';

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/${data.reviewId}/status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.user?.access_token}`,
            },
            body: JSON.stringify({ status: data.status }),
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw error;
    }

    return res.json();
};

export const handleReplyToReviewAction = async (data: {
    reviewId: string;
    responseText: string;
}) => {
    'use server';

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/${data.reviewId}/reply`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.user?.access_token}`,
            },
            body: JSON.stringify({
                response_text: data.responseText,
                response_by: session?.user?.name || 'Admin',
            }),
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw error;
    }

    return res.json();
};
