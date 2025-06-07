'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Card, Typography, Divider, Button, Space, Alert, Row, Col, Skeleton } from 'antd';
import { CheckCircleFilled, CreditCardOutlined, WalletOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentService } from '@/services/payment.service';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface PaymentSelectionProps {
  bookingData: any;
  hotelInfo: any;
  roomInfo: any;
  session: any;
  bookingId: string;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({ 
  bookingData, 
  hotelInfo, 
  roomInfo, 
  session, 
  bookingId 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<string>('full_payment');
  const [paymentMethod, setPaymentMethod] = useState<string>('vnpay');
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra khách sạn có cho phép đặt cọc không
  const acceptDeposit = hotelInfo?.accept_deposit === true;
  
  // Xác định trạng thái thanh toán từ booking data
  const isPaid = bookingData?.payment_status === 'paid';
  const isPartiallyPaid = bookingData?.payment_status === 'partially_paid';
  const isDepositPaid = bookingData?.deposit_status === 'paid';
  
  // Kiểm tra khoảng cách thời gian từ ngày đặt phòng đến ngày check-in
  const isBookingWithin2Days = () => {
    if (!bookingData?.check_in_date || !bookingData?.createdAt) return false;
    
    const checkInDate = new Date(bookingData.check_in_date);
    const bookingDate = new Date(bookingData.createdAt);
    const diffTime = checkInDate.getTime() - bookingDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 2;
  };

  // Kiểm tra có thể đặt cọc không (phải thỏa mãn tất cả điều kiện)
  const canUseDeposit = acceptDeposit && !isBookingWithin2Days() && !isPartiallyPaid && !isDepositPaid;
  
  // Kiểm tra query parameter để xác định loại thanh toán
  useEffect(() => {
    const type = searchParams.get('type');
    
    // Nếu đã đặt cọc, chỉ cho phép thanh toán số tiền còn lại
    if (isPartiallyPaid || isDepositPaid) {
      setPaymentType('remaining');
    } 
    // Nếu có query parameter type=remaining, chọn thanh toán số tiền còn lại
    else if (type === 'remaining') {
      setPaymentType('remaining');
    } 
    // Nếu có query parameter type=deposit và có thể đặt cọc
    else if (type === 'deposit' && canUseDeposit) {
      setPaymentType('deposit');
    }
    // Mặc định là thanh toán toàn bộ (hoặc bắt buộc nếu booking trong vòng 2 ngày)
    else {
      setPaymentType('full_payment');
    }
  }, [searchParams, canUseDeposit, isPartiallyPaid, isDepositPaid]);

  // Format tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Tính toán số tiền cần thanh toán dựa trên loại thanh toán
  const getPaymentAmount = () => {
    if (!bookingData) return 0;
    
    if (paymentType === 'deposit') {
      return bookingData.deposit_amount;
    } else if (paymentType === 'remaining') {
      return bookingData.remaining_amount;
    }
    
    return bookingData.total_amount;
  };

  // Tạo mô tả thanh toán
  const getPaymentDescription = () => {
    if (paymentType === 'deposit') {
      return `Đặt cọc cho đơn đặt phòng ${bookingId} (${formatCurrency(bookingData.deposit_amount)})`;
    } else if (paymentType === 'remaining') {
      return `Thanh toán số tiền còn lại cho đơn đặt phòng ${bookingId} (${formatCurrency(bookingData.remaining_amount)})`;
    }
    return `Thanh toán đầy đủ cho đơn đặt phòng ${bookingId} (${formatCurrency(bookingData.total_amount)})`;
  };

  // Xử lý khi nhấn thanh toán
  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const redirectUrl = window.location.origin + '/payment/result';
      
      const response = await PaymentService.createPayment(
        {
          booking_id: bookingId,
          payment_type: paymentType,
          payment_method: paymentMethod,
          redirect_url: redirectUrl
        },
        session?.user?.access_token!
      );
      
      if (response?.data?.payment_url) {
        // Chuyển hướng đến trang thanh toán VNPay
        window.location.href = response.data.payment_url;
      } else {
        setError('Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
    } finally {
      setLoading(false);
    }
  };

  // Tính số đêm dựa trên ngày check-in và check-out (có giờ)
  const getNights = () => {
    if (!bookingData?.check_in_date || !bookingData?.check_out_date) return 1;
    const checkIn = dayjs(bookingData.check_in_date).startOf('day');
    const checkOut = dayjs(bookingData.check_out_date).startOf('day');
    const nights = checkOut.diff(checkIn, 'day');
    return nights > 0 ? nights : 1;
  };

  if (!bookingData || !hotelInfo || !roomInfo) {
    return <Skeleton active />;
  }

  return (
    <div>
      <Card title="Chọn phương thức thanh toán" className="payment-selection-card">
        {/* Hiển thị thông tin đặt phòng */}
        <Row gutter={[16, 16]}>
          <Col span={24} md={16}>
            <Card 
              type="inner" 
              title="Thông tin đặt phòng" 
              className="booking-summary"
            >
              <Row gutter={[16, 16]}>
                <Col span={24} md={12}>
                  <div className="info-item">
                    <Text strong>Khách sạn:</Text>
                    <Text>{hotelInfo.name}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>Phòng:</Text>
                    <Text>{roomInfo.name}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>Check-in:</Text>
                    <Text>{new Date(bookingData.check_in_date).toLocaleDateString('vi-VN')}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>Check-out:</Text>
                    <Text>{new Date(bookingData.check_out_date).toLocaleDateString('vi-VN')}</Text>
                  </div>
                </Col>
                <Col span={24} md={12}>
                  <div className="info-item">
                    <Text strong>Số đêm:</Text>
                    <Text>{getNights()}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>Số khách:</Text>
                    <Text>{bookingData.number_of_guests} người</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>Tổng tiền:</Text>
                    <Text type="danger">{formatCurrency(bookingData.total_amount)}</Text>
                  </div>
                  {acceptDeposit && (
                    <div className="info-item">
                      <Text strong>Tiền đặt cọc:</Text>
                      <Text>{formatCurrency(bookingData.deposit_amount)}</Text>
                    </div>
                  )}
                  {(isPartiallyPaid || isDepositPaid) && (
                    <div className="info-item">
                      <Text strong>Số tiền còn lại:</Text>
                      <Text>{formatCurrency(bookingData.remaining_amount)}</Text>
                    </div>
                  )}
                </Col>
              </Row>
            </Card>
          </Col>
          
          {/* Phương thức thanh toán */}
          <Col span={24} md={8}>
            <Card type="inner" title="Thanh toán" className="payment-methods">
              {/* Loại thanh toán - Chỉ hiển thị khi chưa đặt cọc và khách sạn cho phép đặt cọc */}
              {canUseDeposit && (
                <>
                  <Title level={5}>Chọn loại thanh toán</Title>
                  <Radio.Group 
                    value={paymentType}
                    onChange={e => setPaymentType(e.target.value)}
                    className="payment-type-group"
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Radio value="deposit" className="payment-option">
                        <Space>
                          <Text>Đặt cọc</Text>
                          <Text type="secondary">
                            ({formatCurrency(bookingData.deposit_amount)})
                          </Text>
                        </Space>
                      </Radio>
                      <Radio value="full_payment" className="payment-option">
                        <Space>
                          <Text>Thanh toán toàn bộ</Text>
                          <Text type="secondary">
                            ({formatCurrency(bookingData.total_amount)})
                          </Text>
                        </Space>
                      </Radio>
                    </Space>
                  </Radio.Group>
                  <Divider />
                </>
              )}

              {/* Hiển thị thông báo nếu bắt buộc thanh toán toàn bộ */}
              {!canUseDeposit && !isPartiallyPaid && !isDepositPaid && (
                <>
                  <Alert
                    message="Thông báo thanh toán"
                    description={
                      isBookingWithin2Days() 
                        ? "Do booking trong vòng 2 ngày trước check-in, bạn cần thanh toán toàn bộ số tiền."
                        : "Bạn cần thanh toán toàn bộ số tiền cho đặt phòng này."
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Divider />
                </>
              )}
              
              {/* Hiển thị thông báo nếu đã đặt cọc */}
              {(isPartiallyPaid || isDepositPaid) && (
                <>
                  <Alert
                    message="Thông tin thanh toán"
                    description={
                      <>
                        <p>Bạn đã đặt cọc {formatCurrency(bookingData.deposit_amount)}.</p>
                        <p>Số tiền cần thanh toán: {formatCurrency(bookingData.remaining_amount)}</p>
                      </>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Divider />
                </>
              )}
              
              {/* Phương thức thanh toán */}
              <Title level={5}>Phương thức thanh toán</Title>
              <Radio.Group 
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="payment-method-group"
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="vnpay" className="payment-option">
                    <Space>
                      <CreditCardOutlined />
                      <Text>Thanh toán qua VNPay</Text>
                      {paymentMethod === 'vnpay' && (
                        <CheckCircleFilled style={{ color: '#52c41a' }} />
                      )}
                    </Space>
                  </Radio>
                  <Radio value="wallet" disabled className="payment-option">
                    <Space>
                      <WalletOutlined />
                      <Text>Ví điện tử (Sắp ra mắt)</Text>
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>
            </Card>
          </Col>
        </Row>

        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <Alert 
            message="Lỗi thanh toán" 
            description={error}
            type="error" 
            showIcon 
            style={{ marginTop: 16 }}
          />
        )}

        {/* Tóm tắt thanh toán và nút thanh toán */}
        <div className="payment-summary">
          <Divider />
          <Row justify="space-between" align="middle">
            <Col>
              <Text>Số tiền thanh toán:</Text>
              <Title level={3} style={{ margin: 0 }}>
                {formatCurrency(getPaymentAmount())}
              </Title>
            </Col>
            <Col>
              <Button 
                type="primary" 
                size="large" 
                onClick={handlePayment}
                loading={loading}
              >
                Tiến hành thanh toán
              </Button>
            </Col>
          </Row>
        </div>
      </Card>

      <style jsx global>{`
        .payment-selection-card {
          margin-bottom: 24px;
        }
        
        .booking-summary, .payment-methods {
          margin-bottom: 16px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .payment-type-group, .payment-method-group {
          width: 100%;
        }
        
        .payment-option {
          padding: 10px;
          border-radius: 6px;
          width: 100%;
        }
        
        .payment-option:hover {
          background-color: #f5f5f5;
        }
        
        .payment-summary {
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
};

export default PaymentSelection;
