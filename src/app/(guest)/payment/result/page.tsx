'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Result, Button, Card, Typography, Spin, Space, Descriptions } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import Link from 'next/link';
import { sendRequest } from '@/utils/api';
import { useSession } from 'next-auth/react';

const { Title, Text, Paragraph } = Typography;

const PaymentResultPage = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
  // Lấy các tham số từ URL
  const success = searchParams.get('success') === 'true';
  const transactionId = searchParams.get('transaction_id');
  const bookingId = searchParams.get('booking_id');
  const status = searchParams.get('status');
  const error = searchParams.get('error');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!transactionId || !session?.user?.access_token) {
        setLoading(false);
        return;
      }

      try {
        // Lấy thông tin thanh toán
        const paymentResponse = await sendRequest({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/${transactionId}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.user.access_token}`,
          },
        });

        if (paymentResponse?.data) {
          setPaymentDetails(paymentResponse.data);
          
          // Lấy thông tin đặt phòng
          if (paymentResponse.data.booking_id) {
            const bookingResponse = await sendRequest({
              url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings/${paymentResponse.data.booking_id}`,
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${session.user.access_token}`,
              },
            });
            
            if (bookingResponse?.data) {
              setBookingDetails(bookingResponse.data);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [transactionId, session]);

  // Format tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Hiển thị loại thanh toán dưới dạng text
  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'deposit': return 'Đặt cọc';
      case 'remaining': return 'Thanh toán phần còn lại';
      case 'full_payment': return 'Thanh toán toàn bộ';
      case 'wallet_deposit': return 'Nạp tiền vào ví';
      case 'refund': return 'Hoàn tiền';
      default: return type;
    }
  };

  // Hiển thị trạng thái thanh toán dưới dạng text
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang chờ thanh toán';
      case 'completed': return 'Đã hoàn tất';
      case 'failed': return 'Thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <Card>
        {success ? (
          <Result
            status="success"
            title="Thanh toán thành công!"
            subTitle={`Mã giao dịch: ${transactionId}`}
            icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
            extra={[
              <Button type="primary" key="bookings">
                <Link href="/bookings">Xem đơn đặt phòng của tôi</Link>
              </Button>,
              <Button key="home">
                <Link href="/">Trang chủ</Link>
              </Button>,
            ]}
          />
        ) : (
          <Result
            status="error"
            title="Thanh toán thất bại"
            subTitle={error || "Có lỗi xảy ra trong quá trình thanh toán."}
            icon={<CloseCircleFilled style={{ color: '#ff4d4f' }} />}
            extra={[
              bookingId ? (
                <Button type="primary" key="retry">
                  <Link href={`/booking/payment/${bookingId}`}>Thử lại</Link>
                </Button>
              ) : null,
              <Button key="home">
                <Link href="/">Trang chủ</Link>
              </Button>,
            ]}
          />
        )}

        {paymentDetails && (
          <div style={{ marginTop: '24px' }}>
            <Divider>Thông tin thanh toán</Divider>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2, lg: 3 }} size="middle">
              <Descriptions.Item label="Mã giao dịch">
                {paymentDetails.transaction_id}
              </Descriptions.Item>
              <Descriptions.Item label="Loại thanh toán">
                {getPaymentTypeText(paymentDetails.payment_type)}
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền">
                {formatCurrency(paymentDetails.amount)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getPaymentStatusText(paymentDetails.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {paymentDetails.payment_date ? new Date(paymentDetails.payment_date).toLocaleString('vi-VN') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức">
                {paymentDetails.payment_method === 'vnpay' ? 'VNPay' : paymentDetails.payment_method}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {bookingDetails && (
          <div style={{ marginTop: '24px' }}>
            <Divider>Thông tin đặt phòng</Divider>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2, lg: 3 }} size="middle">
              <Descriptions.Item label="Mã đặt phòng">
                {bookingDetails.booking_id}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {bookingDetails.status === 'confirmed' ? 'Đã xác nhận' :
                 bookingDetails.status === 'pending' ? 'Chờ xác nhận' :
                 bookingDetails.status === 'canceled' ? 'Đã hủy' :
                 bookingDetails.status === 'completed' ? 'Đã hoàn thành' : bookingDetails.status}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nhận phòng">
                {new Date(bookingDetails.check_in_date).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày trả phòng">
                {new Date(bookingDetails.check_out_date).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {formatCurrency(bookingDetails.total_amount)}
              </Descriptions.Item>
              {bookingDetails.deposit_amount > 0 && (
                <Descriptions.Item label="Đã đặt cọc">
                  {formatCurrency(bookingDetails.deposit_amount)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Card>

      <style jsx global>{`
        .ant-result {
          padding: 24px 16px;
        }
        
        .ant-descriptions-row > th,
        .ant-descriptions-row > td {
          padding: 12px 16px;
        }
        
        .ant-descriptions-item-label {
          min-width: 130px;
          font-weight: 500;
        }
        
        @media (max-width: 575px) {
          .ant-descriptions-item-label,
          .ant-descriptions-item-content {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentResultPage;

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      margin: '16px 0',
      color: 'rgba(0, 0, 0, 0.45)',
      fontWeight: 'bold'
    }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#f0f0f0' }} />
      <span style={{ padding: '0 16px' }}>{children}</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#f0f0f0' }} />
    </div>
  );
}
