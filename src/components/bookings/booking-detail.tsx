'use client';

import React, { useState } from 'react';
import { Modal, Descriptions, Tag, Typography, Button, Divider, message, Row, Col, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

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

interface BookingDetailProps {
  booking: any;
  visible: boolean;
  onClose: () => void;
  session: any;
  onRefresh?: () => void;
}

const BookingDetail: React.FC<BookingDetailProps> = ({ booking, visible, onClose, session, onRefresh }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Tính số đêm thực tế: mỗi đêm là 1 ngày, dù check-in 14h và check-out 12h hôm sau vẫn tính là 1 đêm
  const nights = dayjs(booking.check_out_date).startOf('day').diff(dayjs(booking.check_in_date).startOf('day'), 'day');

  // Xử lý các trạng thái
  const getStatusTag = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <Tag icon={<ClockCircleOutlined />} color="orange">Chờ xác nhận</Tag>;
      case BookingStatus.CONFIRMED:
        return <Tag icon={<CheckCircleOutlined />} color="green">Đã xác nhận</Tag>;
      case BookingStatus.CANCELED:
        return <Tag icon={<CloseCircleOutlined />} color="red">Đã hủy</Tag>;
      case BookingStatus.COMPLETED:
        return <Tag icon={<CheckCircleOutlined />} color="blue">Hoàn thành</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getPaymentStatusTag = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return <Tag color="orange">Chưa thanh toán</Tag>;
      case PaymentStatus.PAID:
        return <Tag color="green">Đã thanh toán</Tag>;
      case PaymentStatus.PARTIALLY_PAID:
        return <Tag color="blue">Đã đặt cọc</Tag>;
      case PaymentStatus.FAILED:
        return <Tag color="red">Thanh toán thất bại</Tag>;
      case PaymentStatus.REFUNDED:
        return <Tag color="purple">Đã hoàn tiền</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const handlePayment = () => {
    router.push(`/bookings/payment/${booking.booking_id}`);
  };

  return (
    <Modal
      title={<Title level={4}>Chi tiết đơn đặt phòng #{booking.booking_id}</Title>}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        booking.payment_status !== PaymentStatus.PAID && 
        booking.status !== BookingStatus.CANCELED && (
          <Button 
            key="payment" 
            type="primary" 
            onClick={handlePayment}
          >
            Thanh toán
          </Button>
        )
      ]}
    >
      <div className="booking-detail-content">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <Title level={5} style={{ margin: 0 }}>Thông tin đặt phòng</Title>
                </div>
                <div>
                  {getStatusTag(booking.status as BookingStatus)}
                </div>
              </div>
              
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Khách sạn" span={2}>
                  {booking.hotel_name || 'Chưa có thông tin'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Loại phòng" span={2}>
                  {booking.room_name || 'Chưa có thông tin'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Ngày nhận phòng">
                  {dayjs(booking.check_in_date).format('DD/MM/YYYY')} (14:00)
                </Descriptions.Item>
                
                <Descriptions.Item label="Ngày trả phòng">
                  {dayjs(booking.check_out_date).format('DD/MM/YYYY')} (12:00)
                </Descriptions.Item>
                
                <Descriptions.Item label="Số đêm">
                  {nights} đêm
                </Descriptions.Item>
                
                <Descriptions.Item label="Số khách">
                  {booking.number_of_guests} người
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          
          <Col span={24}>
            <Card>
              <Title level={5}>Thông tin liên hệ</Title>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Tên khách hàng" span={2}>
                  {booking.guest_name}
                </Descriptions.Item>
                
                <Descriptions.Item label="Email">
                  {booking.guest_email}
                </Descriptions.Item>
                
                <Descriptions.Item label="Số điện thoại">
                  {booking.guest_phone || 'Không có'}
                </Descriptions.Item>
                
                {booking.special_requests && (
                  <Descriptions.Item label="Yêu cầu đặc biệt" span={2}>
                    {booking.special_requests}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
          
          <Col span={24}>
            <Card>
              <Title level={5}>Thông tin thanh toán</Title>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <Text>Phương thức thanh toán: </Text>
                  <Tag>
                    {booking.payment_method === 'vnpay' ? 'VNPay' : 
                     booking.payment_method === 'wallet' ? 'Ví điện tử' : 
                     booking.payment_method === 'cash' ? 'Tiền mặt' : booking.payment_method}
                  </Tag>
                </div>
                <div>
                  {getPaymentStatusTag(booking.payment_status as PaymentStatus)}
                </div>
              </div>
              
              <Descriptions bordered>
                <Descriptions.Item label="Tổng cộng" span={3}>
                  <Text strong style={{ fontSize: 16 }}>
                    {booking.total_amount?.toLocaleString('vi-VN')} VND
                  </Text>
                </Descriptions.Item>
                
                {booking.deposit_amount > 0 && (
                  <>
                    <Descriptions.Item label="Tiền đặt cọc" span={3}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text>{booking.deposit_amount?.toLocaleString('vi-VN')} VND</Text>
                        <Tag style={{ marginLeft: 8 }} color={booking.deposit_status === DepositStatus.PAID ? 'green' : 'orange'}>
                          {booking.deposit_status === DepositStatus.PAID ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </Tag>
                      </div>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Số tiền còn lại" span={3}>
                      {booking.remaining_amount?.toLocaleString('vi-VN')} VND
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
              
              {booking.status === BookingStatus.CANCELED && (
                <div style={{ marginTop: 16, backgroundColor: '#fff2f0', padding: 16, borderRadius: 4 }}>
                  <Text strong>Lý do hủy: </Text>
                  <Text>{booking.cancellation_reason || 'Không có thông tin'}</Text>
                  {booking.cancelled_at && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Đã hủy vào: {dayjs(booking.cancelled_at).format('DD/MM/YYYY HH:mm')}</Text>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default BookingDetail;
