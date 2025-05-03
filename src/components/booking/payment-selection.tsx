'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Card, Typography, Divider, Button, Space, Alert, Row, Col, Skeleton } from 'antd';
import { CheckCircleFilled, CreditCardOutlined, WalletOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { sendRequest } from '@/utils/api';

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
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<string>('full_payment');
  const [paymentMethod, setPaymentMethod] = useState<string>('vnpay');
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra khách sạn có cho phép đặt cọc không
  const acceptDeposit = hotelInfo?.accept_deposit === true;
  
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
    }
    
    return bookingData.total_amount;
  };

  // Tạo mô tả thanh toán
  const getPaymentDescription = () => {
    if (paymentType === 'deposit') {
      return `Đặt cọc cho đơn đặt phòng ${bookingId} (${formatCurrency(bookingData.deposit_amount)})`;
    }
    return `Thanh toán đầy đủ cho đơn đặt phòng ${bookingId} (${formatCurrency(bookingData.total_amount)})`;
  };

  // Xử lý khi nhấn thanh toán
  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const redirectUrl = window.location.origin + '/payment/result';
      
      const response = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.access_token}`,
        },
        body: {
          booking_id: bookingId,
          payment_type: paymentType,
          payment_method: paymentMethod,
          redirect_url: redirectUrl
        }
      });
      
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
                    <Text>{bookingData.nights || '1'}</Text>
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
                </Col>
              </Row>
            </Card>
          </Col>
          
          {/* Phương thức thanh toán */}
          <Col span={24} md={8}>
            <Card type="inner" title="Thanh toán" className="payment-methods">
              {/* Loại thanh toán */}
              {acceptDeposit && (
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
