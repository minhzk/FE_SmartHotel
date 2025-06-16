'use server';
import { auth, signIn } from '@/auth';
import { revalidateTag } from 'next/cache';
import { sendRequest } from './api';
import { UserService } from '@/services/user.service';
import { BookingService } from '@/services/booking.service';
import { HotelService } from '@/services/hotel.service';
import { RoomService } from '@/services/room.service';
import { RoomAvailabilityService } from '@/services/room-availability.service';
import { PaymentService } from '@/services/payment.service';
import { ReviewService } from '@/services/review.service';
import { FavoriteService } from '@/services/favorite.service';

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

export const handleCreateUserAction = async (body: any) => {
    const session = await auth();
    const res = await UserService.createUser(
        body,
        session?.user?.access_token!
    );
    revalidateTag('list-users');
    return res;
};

export const handleUpdateUserAction = async (body: any) => {
    const session = await auth();
    const res = await UserService.updateUser(
        body,
        session?.user?.access_token!
    );
    revalidateTag('list-users');
    return res;
};

export const handleDeleteUserAction = async (id: string) => {
    const session = await auth();
    const res = await UserService.deleteUser(id, session?.user?.access_token!);
    revalidateTag('list-users');
    return res;
};

export const handleCreateHotelAction = async (data: any) => {
    const session = await auth();
    const res = await HotelService.createHotel(
        data,
        session?.user?.access_token!
    );
    revalidateTag('list-hotels');
    return res;
};

export const handleUpdateHotelAction = async (data: any) => {
    const session = await auth();
    const res = await HotelService.updateHotel(
        data,
        session?.user?.access_token!
    );
    revalidateTag('list-hotels');
    return res;
};

export const handleDeleteHotelAction = async (id: string) => {
    const session = await auth();
    const res = await HotelService.deleteHotel(
        id,
        session?.user?.access_token!
    );
    revalidateTag('list-hotels');
    return res;
};

export const handleCreateRoomAction = async (body: any) => {
    const session = await auth();
    const res = await RoomService.createRoom(
        body,
        session?.user?.access_token!
    );
    revalidateTag('list-rooms');
    return res;
};

export const handleUpdateRoomAction = async (body: any) => {
    const session = await auth();
    const res = await RoomService.updateRoom(
        body,
        session?.user?.access_token!
    );
    revalidateTag('list-rooms');
    return res;
};

export const handleDeleteRoomAction = async (id: string) => {
    const session = await auth();
    const res = await RoomService.deleteRoom(id, session?.user?.access_token!);
    revalidateTag('list-rooms');
    return res;
};

export const handleGenerateRoomAvailabilityAction = async (body: any) => {
    const session = await auth();
    const res = await RoomAvailabilityService.generateRoomAvailability(
        body,
        session?.user?.access_token!
    );
    revalidateTag('room-availability');
    return res;
};

export const handleUpdateRoomAvailabilityStatusAction = async (body: any) => {
    const session = await auth();
    const res = await RoomAvailabilityService.updateRoomAvailabilityStatus(
        body,
        session?.user?.access_token!
    );
    revalidateTag('room-availability');
    return res;
};

export const handleUpdatePaymentStatusAction = async (data: {
    paymentId: string;
    status: string;
}) => {
    const session = await auth();
    const res = await PaymentService.updatePaymentStatus(
        data.paymentId,
        data.status,
        session?.user?.access_token!
    );
    revalidateTag('list-payments');
    return res;
};

export const handleUpdateReviewStatusAction = async (data: {
    reviewId: string;
    status: string;
}) => {
    const session = await auth();
    const res = await ReviewService.updateReviewStatus(
        data.reviewId,
        data.status,
        session?.user?.access_token!
    );
    revalidateTag('list-reviews');
    return res;
};

export const handleReplyToReviewAction = async (data: {
    reviewId: string;
    responseText: string;
}) => {
    const session = await auth();
    const res = await ReviewService.replyToReview(
        data.reviewId,
        data.responseText,
        session?.user?.name || 'Admin',
        session?.user?.access_token!
    );
    revalidateTag('list-reviews');
    return res;
};

export const handleUpdateBookingAction = async (data: any) => {
    const session = await auth();
    const res = await BookingService.updateBooking(
        data._id,
        data,
        session?.user?.access_token!
    );
    revalidateTag('list-bookings');
    // Nếu cập nhật trạng thái thanh toán, cũng làm mới danh sách payments
    if (data.payment_status) {
        revalidateTag('list-payments');
    }
    return res;
};

export const createPaymentAction = async (data: {
    booking_id: string;
    payment_type: string;
    payment_method: string;
    redirect_url?: string;
}) => {
    const session = await auth();
    const res = await PaymentService.createPayment(
        data,
        session?.user?.access_token!
    );
    return res;
};

export const handleGoogleLogin = () => {
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google`;
    window.location.href = googleAuthUrl;
};

export const handleUpdateBookingStatusAction = async (
    id: string,
    status: string
) => {
    const session = await auth();
    const res = await BookingService.updateBooking(
        id,
        { status },
        session?.user?.access_token!
    );
    revalidateTag('list-bookings');
    return res;
};

export const handleCheckCompletedBookingsAction = async () => {
    const session = await auth();
    const res = await BookingService.checkCompletedBookings(
        session?.user?.access_token!
    );
    revalidateTag('list-bookings');
    return res;
};

export const handleGetFavoritesAction = async (accessToken: string) => {
    try {
        const res = await FavoriteService.getFavorites(accessToken);

        if (res?.data) {
            return { success: true, data: res.data };
        } else {
            return { success: false, message: res?.message || 'Có lỗi xảy ra' };
        }
    } catch (error: any) {
        console.error('Error fetching favorites:', error);
        return {
            success: false,
            message:
                error?.response?.data?.message ||
                error?.message ||
                'Không thể tải danh sách yêu thích',
        };
    }
};

export const handleRemoveFavoriteAction = async (
    hotelId: string,
    accessToken: string
) => {
    try {
        const res = await FavoriteService.removeFavorite(hotelId, accessToken);

        if (res?.data) {
            revalidateTag('favorites');
            return { success: true, data: res.data };
        } else {
            return { success: false, message: res?.message || 'Có lỗi xảy ra' };
        }
    } catch (error: any) {
        console.error('Error removing favorite:', error);
        return {
            success: false,
            message:
                error?.response?.data?.message ||
                error?.message ||
                'Có lỗi xảy ra khi xóa khỏi yêu thích',
        };
    }
};

export const handleAddFavoriteAction = async (
    hotelId: string,
    accessToken: string
) => {
    try {
        const res = await FavoriteService.addFavorite(hotelId, accessToken);

        if (res?.data) {
            revalidateTag('favorites');
            return { success: true, data: res.data };
        } else {
            return { success: false, message: res?.message || 'Có lỗi xảy ra' };
        }
    } catch (error: any) {
        console.error('Error adding favorite:', error);
        return {
            success: false,
            message:
                error?.response?.data?.message ||
                error?.message ||
                'Có lỗi xảy ra khi thêm vào yêu thích',
        };
    }
};

export const handleCheckFavoriteStatusAction = async (
    hotelId: string,
    accessToken: string
) => {
    try {
        const res = await FavoriteService.checkFavoriteStatus(
            hotelId,
            accessToken
        );

        if (res?.data !== undefined) {
            return { success: true, data: res.data };
        } else {
            return { success: false, message: res?.message || 'Có lỗi xảy ra' };
        }
    } catch (error: any) {
        console.error('Error checking favorite status:', error);
        return {
            success: false,
            message:
                error?.response?.data?.message ||
                error?.message ||
                'Có lỗi xảy ra khi kiểm tra trạng thái yêu thích',
        };
    }
};

export const handleCreateReviewAction = async (
    data: {
        hotel_id: string;
        booking_id: string;
        rating: number;
        review_text: string;
    },
    accessToken: string
) => {
    try {
        const res = await ReviewService.createReview(data, accessToken);

        if (res?.data) {
            revalidateTag('list-bookings');
            return { success: true, data: res.data };
        } else {
            return { success: false, message: res?.message || 'Có lỗi xảy ra' };
        }
    } catch (error: any) {
        console.error('Error creating review:', error);
        return {
            success: false,
            message:
                error?.response?.data?.message ||
                error?.message ||
                'Có lỗi xảy ra khi tạo đánh giá',
        };
    }
};
