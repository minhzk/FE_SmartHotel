'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Rate, Button, message, Typography } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import { sendRequest } from '@/utils/api';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ReviewModalProps {
  booking: any;
  visible: boolean;
  onClose: () => void;
  session: any;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  visible,
  onClose,
  session,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Mô tả cho các mức đánh giá sao
  const ratingDescriptions = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];
  
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };
  
  const handleSubmit = async (values: any) => {
    if (!session?.user?.access_token) {
      message.error('Vui lòng đăng nhập để gửi đánh giá');
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        hotel_id: booking.hotel_id,
        rating: values.rating,
        review_text: values.review_text
      };
      
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.access_token}`
        },
        body: payload
      });
      
      message.success('Đánh giá của bạn đã được gửi thành công!');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StarOutlined style={{ marginRight: 8, color: '#faad14' }} />
          <span>Đánh giá dịch vụ</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>Khách sạn: {booking.hotel_name}</Title>
        <Text type="secondary">Mã đặt phòng: {booking.booking_id}</Text>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ rating: 5 }}
      >
        <Form.Item
          name="rating"
          label="Đánh giá của bạn"
          rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
        >
          <Rate 
            tooltips={ratingDescriptions}
            allowClear={false}
          />
        </Form.Item>
        
        <Form.Item
          name="review_text"
          label="Nhận xét của bạn"
          rules={[
            { required: true, message: 'Vui lòng nhập nhận xét của bạn!' },
            { min: 10, message: 'Nhận xét cần có ít nhất 10 ký tự!' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về khách sạn, dịch vụ, vị trí..."
            maxLength={500}
            showCount
          />
        </Form.Item>
        
        <div style={{ textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Gửi đánh giá
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ReviewModal;
