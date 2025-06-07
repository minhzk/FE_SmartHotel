'use client'
import { Button, Descriptions, Divider, Modal, Skeleton, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { BookingService } from "@/services/booking.service";
import { useSession } from "next-auth/react";

const { Title, Text } = Typography;

interface IProps {
    isDetailModalOpen: boolean;
    setIsDetailModalOpen: (value: boolean) => void;
    payment: any;
}

const PaymentDetail = (props: IProps) => {
    const { isDetailModalOpen, setIsDetailModalOpen, payment } = props;
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!payment || !payment.booking_id) return;
            
            setLoading(true);
            try {
                const res = await BookingService.getBookingById(payment.booking_id, session?.user?.access_token!);
                
                if (res?.data) {
                    setBookingDetails(res.data);
                }
            } catch (error) {
                console.error('Error fetching booking details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isDetailModalOpen && payment) {
            fetchBookingDetails();
        } else {
            setBookingDetails(null);
        }
    }, [payment, isDetailModalOpen, session]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'completed': return 'green';
            case 'failed': return 'red';
            case 'refunded': return 'blue';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Chờ thanh toán';
            case 'completed': return 'Hoàn thành';
            case 'failed': return 'Thất bại';
            case 'refunded': return 'Đã hoàn tiền';
            default: return status;
        }
    };

    const getMethodText = (method: string) => {
        switch (method) {
            case 'vnpay': return 'VNPay';
            case 'wallet': return 'Ví tiền';
            case 'cash': return 'Tiền mặt';
            default: return method;
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'deposit': return 'Đặt cọc';
            case 'remaining': return 'Thanh toán còn lại';
            case 'full_payment': return 'Thanh toán đầy đủ';
            case 'wallet_deposit': return 'Nạp tiền ví';
            case 'refund': return 'Hoàn tiền';
            default: return type;
        }
    };

    if (!payment) return null;

    return (
        <Modal
            title={<Title level={4}>Chi tiết giao dịch #{payment.transaction_id}</Title>}
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            width={700}
            footer={[
                <Button key="back" onClick={() => setIsDetailModalOpen(false)}>
                    Đóng
                </Button>
            ]}
        >
            <Descriptions title="Thông tin thanh toán" bordered column={2}>
                <Descriptions.Item label="Mã giao dịch" span={2}>
                    {payment.transaction_id}
                </Descriptions.Item>
                <Descriptions.Item label="Mã đơn đặt phòng" span={2}>
                    {payment.booking_id}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                    <Text strong>{payment.amount?.toLocaleString('vi-VN')} VNĐ</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại thanh toán">
                    {getTypeText(payment.payment_type)}
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức">
                    {getMethodText(payment.payment_method)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={getStatusColor(payment.status)}>
                        {getStatusText(payment.status)}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian">
                    {payment.payment_date ? dayjs(payment.payment_date).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
                </Descriptions.Item>
            </Descriptions>

            {/* VNPay specific details */}
            {payment.payment_method === 'vnpay' && (
                <>
                    <Divider />
                    <Descriptions title="Thông tin VNPay" bordered column={2}>
                        {payment.vnp_transaction_id && (
                            <Descriptions.Item label="Mã giao dịch VNPay" span={2}>
                                {payment.vnp_transaction_id}
                            </Descriptions.Item>
                        )}
                        {payment.vnp_transaction_no && (
                            <Descriptions.Item label="Mã thanh toán VNPay" span={2}>
                                {payment.vnp_transaction_no}
                            </Descriptions.Item>
                        )}
                        {payment.vnp_bank_code && (
                            <Descriptions.Item label="Mã ngân hàng" span={2}>
                                {payment.vnp_bank_code}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </>
            )}

            {/* Error message if exists */}
            {payment.error_message && (
                <>
                    <Divider />
                    <Descriptions bordered>
                        <Descriptions.Item label="Thông báo lỗi" span={3}>
                            <Text type="danger">{payment.error_message}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                </>
            )}

            {/* Booking details */}
            <Divider />
            <Title level={5}>Thông tin đặt phòng</Title>
            {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : bookingDetails ? (
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Khách sạn" span={2}>
                        {bookingDetails.hotel_name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại phòng" span={2}>
                        {bookingDetails.room_name || bookingDetails.room_type || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày nhận phòng">
                        {bookingDetails.check_in_date ? 
                            dayjs(bookingDetails.check_in_date).format('DD/MM/YYYY') : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày trả phòng">
                        {bookingDetails.check_out_date ? 
                            dayjs(bookingDetails.check_out_date).format('DD/MM/YYYY') : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số đêm">
                        {bookingDetails.nights || 
                            (bookingDetails.check_in_date && bookingDetails.check_out_date ? 
                                dayjs(bookingDetails.check_out_date).diff(dayjs(bookingDetails.check_in_date), 'day') : 'N/A')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái đặt phòng">
                        <Tag color={
                            bookingDetails.status === 'confirmed' ? 'green' :
                            bookingDetails.status === 'pending' ? 'orange' :
                            bookingDetails.status === 'canceled' ? 'red' : 'default'
                        }>
                            {bookingDetails.status === 'confirmed' ? 'Đã xác nhận' :
                            bookingDetails.status === 'pending' ? 'Chờ xác nhận' :
                            bookingDetails.status === 'canceled' ? 'Đã hủy' : bookingDetails.status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người đặt" span={2}>
                        {bookingDetails.guest_name || 'N/A'}
                        {bookingDetails.guest_email && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                Email: {bookingDetails.guest_email}
                            </div>
                        )}
                        {bookingDetails.guest_phone && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                SĐT: {bookingDetails.guest_phone}
                            </div>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                        <Text strong>{bookingDetails.total_amount?.toLocaleString('vi-VN')} VNĐ</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Đã đặt cọc">
                        <Text>{bookingDetails.deposit_amount?.toLocaleString('vi-VN')} VNĐ</Text>
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <Text type="secondary">Không thể tải thông tin đặt phòng</Text>
            )}
        </Modal>
    );
};

export default PaymentDetail;
