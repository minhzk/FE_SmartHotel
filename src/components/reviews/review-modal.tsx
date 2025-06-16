'use client';

import React, { useState } from 'react';
import { Modal, Form, Rate, Input, Button, message } from 'antd';
import { handleCreateReviewAction } from '@/utils/actions';

const { TextArea } = Input;

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
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const reviewData = {
        hotel_id: booking.hotel_id,
        booking_id: booking._id, 
        rating: values.rating,
        review_text: values.review_text,
      };

      const result = await handleCreateReviewAction(
        reviewData,
        session?.user?.access_token
      );

      if (result.success) {
        message.success('Đánh giá của bạn đã được gửi thành công!');
        form.resetFields();
        onSuccess();
      } else {
        message.error(result.message || 'Có lỗi xảy ra khi gửi đánh giá');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Đánh giá khách sạn"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      {booking && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h4>{booking.hotel_name}</h4>
            <p>Mã đặt phòng: {booking.booking_id}</p>
            <p>Phòng: {booking.room_name}</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              rating: 5,
            }}
          >
            <Form.Item
              name="rating"
              label="Đánh giá của bạn"
              rules={[
                { required: true, message: 'Vui lòng chọn số sao đánh giá' },
              ]}
            >
              <Rate style={{ fontSize: 24 }} />
            </Form.Item>

            <Form.Item
              name="review_text"
              label="Nhận xét của bạn"
              rules={[
                { required: true, message: 'Vui lòng nhập nhận xét của bạn' },
                { min: 10, message: 'Nhận xét phải có ít nhất 10 ký tự' },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Chia sẻ trải nghiệm của bạn về khách sạn..."
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi đánh giá
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default ReviewModal;
