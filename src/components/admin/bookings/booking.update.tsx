'use client'
import { handleUpdateBookingAction } from "@/utils/actions";
import { Button, Form, Input, Modal, message } from "antd";
import { useState } from "react";

interface IProps {
    isUpdateModalOpen: boolean;
    setIsUpdateModalOpen: (value: boolean) => void;
    booking: any;
    onSuccess?: () => void;
}

enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  COMPLETED = 'completed',
}

const BookingUpdate = (props: IProps) => {
    const { isUpdateModalOpen, setIsUpdateModalOpen, booking, onSuccess } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        form.resetFields();
        setIsUpdateModalOpen(false);
    };

    const onFinish = async (values: { cancellation_reason: string }) => {
        if (!booking?._id) return;
        
        setLoading(true);
        try {
            await handleUpdateBookingAction({
                _id: booking._id,
                status: BookingStatus.CANCELED,
                cancellation_reason: values.cancellation_reason,
                cancelled_at: new Date().toISOString()
            });
            
            message.success('Hủy đặt phòng thành công!');
            handleCancel();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra khi hủy đặt phòng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Lý do hủy đặt phòng"
            open={isUpdateModalOpen}
            onCancel={handleCancel}
            footer={null}
            maskClosable={false}
        >
            <Form
                form={form}
                name="cancel-booking"
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    name="cancellation_reason"
                    label="Lý do hủy"
                    rules={[{ required: true, message: 'Vui lòng nhập lý do hủy' }]}
                >
                    <Input.TextArea rows={4} placeholder="Nhập lý do hủy đặt phòng..." />
                </Form.Item>

                <Form.Item>
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 10 }}>
                            Quay lại
                        </Button>
                        <Button type="primary" danger htmlType="submit" loading={loading}>
                            Xác nhận hủy
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BookingUpdate;
