'use client'
import { handleUpdatePaymentStatusAction } from "@/utils/actions";
import { Button, Form, Modal, Select, message } from "antd";
import { useState } from "react";

interface IProps {
    isUpdateModalOpen: boolean;
    setIsUpdateModalOpen: (value: boolean) => void;
    payment: any;
    onSuccess?: () => void;
}

const PaymentUpdateStatus = (props: IProps) => {
    const { isUpdateModalOpen, setIsUpdateModalOpen, payment, onSuccess } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        form.resetFields();
        setIsUpdateModalOpen(false);
    };

    const onFinish = async (values: any) => {
        if (!payment?._id) return;
        
        try {
            setLoading(true);
            await handleUpdatePaymentStatusAction({
                paymentId: payment._id,
                status: values.status
            });
            
            message.success('Cập nhật trạng thái thanh toán thành công!');
            handleCancel();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            message.error(error?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Cập nhật trạng thái thanh toán"
            open={isUpdateModalOpen}
            onCancel={handleCancel}
            footer={null}
            maskClosable={false}
        >
            <Form
                form={form}
                name="updatePaymentStatus"
                onFinish={onFinish}
                layout="vertical"
                initialValues={{ status: payment?.status }}
            >
                <Form.Item
                    name="status"
                    label="Trạng thái thanh toán"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                    <Select options={[
                        { value: 'pending', label: 'Chờ thanh toán' },
                        { value: 'completed', label: 'Hoàn thành' },
                        { value: 'failed', label: 'Thất bại' },
                        { value: 'refunded', label: 'Đã hoàn tiền' },
                    ]} />
                </Form.Item>

                <Form.Item>
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 10 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Cập nhật
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PaymentUpdateStatus;
