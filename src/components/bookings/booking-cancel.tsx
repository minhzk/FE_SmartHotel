'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert, Typography, Spin, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { sendRequest } from '@/utils/api';

const { TextArea } = Input;
const { Text } = Typography;

interface BookingCancelProps {
  booking: any;
  visible: boolean;
  onClose: () => void;
  session: any;
  onSuccess: () => void;
}

const BookingCancel: React.FC<BookingCancelProps> = ({ 
  booking, 
  visible, 
  onClose, 
  session,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };
  
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings/cancel`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.access_token}`
        },
        body: {
          _id: booking._id,
          cancellation_reason: values.reason
        }
      });
      
      message.success('Hủy đặt phòng thành công');
      onSuccess();
    } catch (error: any) {
      console.error('Error canceling booking:', error);
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi hủy đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f' }}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Hủy đơn đặt phòng
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      maskClosable={!loading}
      closable={!loading}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <Alert
          message="Thông tin quan trọng"
          description={
            <>
              <p>Các điều kiện hủy đặt phòng:</p>
              <ul>
                <li>Hủy miễn phí trước 2 ngày so với ngày nhận phòng.</li>
                <li>Tiền đặt cọc sẽ được hoàn lại nếu bạn hủy trước thời hạn.</li>
                <li>Việc hủy đặt có thể gây bất tiện cho khách sạn, vui lòng cân nhắc kỹ.</li>
              </ul>
              <p>Chi tiết đơn đặt phòng:</p>
              <p><strong>Mã đặt phòng:</strong> {booking.booking_id}</p>
              <p><strong>Khách sạn:</strong> {booking.hotel_name}</p>
              <p><strong>Phòng:</strong> {booking.room_name}</p>
            </>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
        >
          <Form.Item
            name="reason"
            label="Lý do hủy đơn"
            rules={[{ required: true, message: 'Vui lòng nhập lý do hủy đơn đặt phòng' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Vui lòng cho biết lý do bạn muốn hủy đơn đặt phòng này"
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Button 
              onClick={handleCancel} 
              style={{ marginRight: 8 }}
              disabled={loading}
            >
              Quay lại
            </Button>
            <Button 
              type="primary" 
              danger 
              htmlType="submit"
              loading={loading}
            >
              Xác nhận hủy đơn
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default BookingCancel;
