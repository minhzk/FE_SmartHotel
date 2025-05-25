'use client'
import { handleUpdateBookingAction } from "@/utils/actions";
import { Button, Descriptions, Divider, Modal, Space, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import BookingUpdate from "./booking.update";

const { Title, Text } = Typography;

interface IProps {
    isDetailModalOpen: boolean;
    setIsDetailModalOpen: (value: boolean) => void;
    booking: {
        _id: string;
        booking_id: string;
        status: BookingStatus;
        payment_status: PaymentStatus;
        deposit_status: DepositStatus;
        payment_method: string;
        hotel_id: string;
        room_id: string;
        // ...other booking properties
        [key: string]: any;
    } | null;
}

enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  COMPLETED = 'completed',
}

enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

enum DepositStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
}

const BookingDetail = (props: IProps) => {
    const { isDetailModalOpen, setIsDetailModalOpen, booking } = props;
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { data: session } = useSession();
    const [hotelDetail, setHotelDetail] = useState<{ name: string } | null>(null);
    const [roomDetail, setRoomDetail] = useState<{ name: string } | null>(null);
    
    useEffect(() => {
        if (isDetailModalOpen && booking && session?.user?.access_token) {
            const fetchHotelDetail = async () => {
                if (!booking.hotel_id) return;
                
                try {
                    const res = await sendRequest({
                        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels/${booking.hotel_id}`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${session.user.access_token}`
                        }
                    });
                    
                    if (res?.data) {
                        setHotelDetail({ name: res.data.name });
                    }
                } catch (error) {
                    console.error('Lỗi khi lấy thông tin khách sạn:', error);
                }
            };
            
            const fetchRoomDetail = async () => {
                if (!booking.room_id) return;
                
                try {
                    const res = await sendRequest({
                        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/${booking.room_id}`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${session.user.access_token}`
                        }
                    });
                    
                    if (res?.data) {
                        setRoomDetail({ name: res.data.name || res.data.room_type || 'Phòng' });
                    }
                } catch (error) {
                    console.error('Lỗi khi lấy thông tin phòng:', error);
                }
            };
            
            fetchHotelDetail();
            fetchRoomDetail();
        }
    }, [booking, isDetailModalOpen, session]);
    
    if (!booking) return null;

    const bookingStatusColors: Record<BookingStatus, string> = {
        [BookingStatus.PENDING]: 'orange',
        [BookingStatus.CONFIRMED]: 'green',
        [BookingStatus.CANCELED]: 'red',
        [BookingStatus.COMPLETED]: 'blue'
    };

    const bookingStatusLabels: Record<BookingStatus, string> = {
        [BookingStatus.PENDING]: 'Chờ xác nhận',
        [BookingStatus.CONFIRMED]: 'Đã xác nhận',
        [BookingStatus.CANCELED]: 'Đã hủy',
        [BookingStatus.COMPLETED]: 'Hoàn thành'
    };

    const paymentStatusColors: Record<PaymentStatus, string> = {
        [PaymentStatus.PENDING]: 'orange',
        [PaymentStatus.PAID]: 'green',
        [PaymentStatus.PARTIALLY_PAID]: 'blue',
        [PaymentStatus.FAILED]: 'red',
        [PaymentStatus.REFUNDED]: 'purple'
    };

    const paymentStatusLabels: Record<PaymentStatus, string> = {
        [PaymentStatus.PENDING]: 'Chờ thanh toán',
        [PaymentStatus.PAID]: 'Đã thanh toán',
        [PaymentStatus.PARTIALLY_PAID]: 'Thanh toán một phần',
        [PaymentStatus.FAILED]: 'Thanh toán thất bại',
        [PaymentStatus.REFUNDED]: 'Đã hoàn tiền'
    };

    const handleConfirmBooking = async () => {
        await updateBookingStatus(BookingStatus.CONFIRMED);
    };
    
    const handleCompleteBooking = async () => {
        await updateBookingStatus(BookingStatus.COMPLETED);
    };
    
    const handleCancelBooking = async () => {
        setIsUpdateModalOpen(true);
    };
    
    const updateBookingStatus = async (status: BookingStatus) => {
        setLoading(true);
        try {
            await handleUpdateBookingAction({
                _id: booking._id,
                status
            });
            
            message.success(`Cập nhật trạng thái đặt phòng thành công!`);
            window.location.reload();
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setLoading(false);
        }
    };
    
    const getNights = () => {
        // Tính số đêm chỉ dựa vào ngày (bỏ qua giờ phút)
        const checkIn = dayjs(booking.check_in_date).startOf('day');
        const checkOut = dayjs(booking.check_out_date).startOf('day');
        return checkOut.diff(checkIn, 'day');
    };

    const canConfirm = booking.status === BookingStatus.PENDING;
    const canComplete = booking.status === BookingStatus.CONFIRMED;
    const canCancel = booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED;

    return (
        <>
            <Modal
                title={<Title level={4}>Chi tiết đặt phòng #{booking.booking_id}</Title>}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                width={800}
                footer={[
                    <Space key="footer-buttons">
                        {canConfirm && (
                            <Button 
                                type="primary" 
                                onClick={handleConfirmBooking} 
                                loading={loading}
                            >
                                Xác nhận đặt phòng
                            </Button>
                        )}
                        
                        {canComplete && (
                            <Button 
                                type="primary" 
                                style={{ background: '#52c41a' }} 
                                onClick={handleCompleteBooking} 
                                loading={loading}
                            >
                                Hoàn thành
                            </Button>
                        )}
                        
                        {canCancel && (
                            <Button 
                                danger 
                                onClick={handleCancelBooking} 
                                loading={loading}
                            >
                                Hủy đặt phòng
                            </Button>
                        )}
                        
                        <Button onClick={() => setIsDetailModalOpen(false)}>
                            Đóng
                        </Button>
                    </Space>
                ]}
            >
                <Descriptions title="Thông tin đặt phòng" bordered column={2}>
                    <Descriptions.Item label="Mã đặt phòng" span={2}>
                        {booking.booking_id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái đặt phòng">
                        <Tag color={bookingStatusColors[booking.status as BookingStatus] || 'default'}>
                            {bookingStatusLabels[booking.status as BookingStatus] || booking.status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái thanh toán">
                        <Tag color={paymentStatusColors[booking.payment_status as PaymentStatus] || 'default'}>
                            {paymentStatusLabels[booking.payment_status as PaymentStatus] || booking.payment_status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái đặt cọc">
                        <Tag color={booking.deposit_status === DepositStatus.PAID ? 'green' : 'orange'}>
                            {booking.deposit_status === DepositStatus.PAID ? 'Đã đặt cọc' : 'Chưa đặt cọc'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">
                        {booking.payment_method === 'vnpay' && 'VNPay'}
                        {booking.payment_method === 'wallet' && 'Ví tiền'}
                        {booking.payment_method === 'cash' && 'Tiền mặt'}
                    </Descriptions.Item>
                </Descriptions>
                
                <Divider orientation="left">Thông tin khách hàng</Divider>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Họ tên" span={2}>{booking.guest_name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{booking.guest_email}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{booking.guest_phone}</Descriptions.Item>
                    <Descriptions.Item label="Số khách" span={2}>{booking.number_of_guests}</Descriptions.Item>
                    {booking.special_requests && (
                        <Descriptions.Item label="Yêu cầu đặc biệt" span={2}>
                            {booking.special_requests}
                        </Descriptions.Item>
                    )}
                </Descriptions>
                
                <Divider orientation="left">Thông tin phòng</Divider>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Khách sạn" span={2}>
                        {hotelDetail ? hotelDetail.name : 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phòng" span={2}>
                        {roomDetail ? roomDetail.name : 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày nhận phòng">
                        {dayjs(booking.check_in_date).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày trả phòng">
                        {dayjs(booking.check_out_date).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số đêm" span={2}>
                        {getNights()} đêm
                    </Descriptions.Item>
                </Descriptions>
                
                <Divider orientation="left">Thông tin thanh toán</Divider>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Tổng tiền">
                        <Text strong>{booking.total_amount?.toLocaleString('vi-VN')} VNĐ</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiền đặt cọc">
                        {booking.deposit_amount?.toLocaleString('vi-VN')} VNĐ
                    </Descriptions.Item>
                    <Descriptions.Item label="Số tiền còn lại">
                        {booking.remaining_amount?.toLocaleString('vi-VN')} VNĐ
                    </Descriptions.Item>
                    {booking.payment_due_date && (
                        <Descriptions.Item label="Hạn thanh toán">
                            {dayjs(booking.payment_due_date).format('DD/MM/YYYY')}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Modal>
            
            <BookingUpdate
                isUpdateModalOpen={isUpdateModalOpen}
                setIsUpdateModalOpen={setIsUpdateModalOpen}
                booking={booking}
                onSuccess={() => window.location.reload()}
            />
        </>
    );
};

export default BookingDetail;
