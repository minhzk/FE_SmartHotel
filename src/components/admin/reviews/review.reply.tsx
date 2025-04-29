'use client'
import { Button, Form, Input, Modal, message } from "antd";
import { useState } from "react";
import { handleReplyToReviewAction } from "@/utils/actions";

const { TextArea } = Input;

interface IProps {
    isReplyModalOpen: boolean;
    setIsReplyModalOpen: (value: boolean) => void;
    review: any;
    onSuccess?: () => void;
}

const ReviewReply = (props: IProps) => {
    const { isReplyModalOpen, setIsReplyModalOpen, review, onSuccess } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);

    const handleCancel = () => {
        form.resetFields();
        setIsReplyModalOpen(false);
    };

    const onFinish = async (values: { response_text: string }) => {
        if (!review?._id) return;

        try {
            setLoading(true);
            await handleReplyToReviewAction({
                reviewId: review._id,
                responseText: values.response_text
            });
            
            message.success('Đã phản hồi đánh giá thành công!');
            handleCancel();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            message.error(error?.message || 'Có lỗi xảy ra khi phản hồi đánh giá');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Phản hồi đánh giá${review?.hotel_name ? ` cho ${review.hotel_name}` : ''}`}
            open={isReplyModalOpen}
            onCancel={handleCancel}
            footer={null}
            maskClosable={false}
        >
            {review && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Nội dung đánh giá:</div>
                    <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                        {review.review_text}
                    </div>
                </div>
            )}
            
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                initialValues={{ response_text: review?.response?.response_text || '' }}
            >
                <Form.Item
                    name="response_text"
                    label="Nội dung phản hồi"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi' }]}
                >
                    <TextArea rows={6} placeholder="Nhập phản hồi của bạn..." />
                </Form.Item>

                <Form.Item>
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 10 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {review?.response ? 'Cập nhật phản hồi' : 'Gửi phản hồi'}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ReviewReply;
