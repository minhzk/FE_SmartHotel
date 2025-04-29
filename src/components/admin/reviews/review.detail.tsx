'use client'
import { Button, Descriptions, Divider, Modal, Rate, Space, Tag, Typography, Progress } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;

interface IProps {
    isDetailModalOpen: boolean;
    setIsDetailModalOpen: (value: boolean) => void;
    review: any;
    userDetails: Record<string, { name: string, email: string }>;
    hotelDetails: Record<string, { name: string }>;
}

enum SentimentLabel {
  NEGATIVE = 'Tiêu cực',
  NEUTRAL = 'Trung lập',
  SATISFIED = 'Hài lòng',
  EXCELLENT = 'Tuyệt vời',
  PERFECT = 'Hoàn hảo',
}

const ReviewDetail = (props: IProps) => {
    const { isDetailModalOpen, setIsDetailModalOpen, review, userDetails, hotelDetails } = props;

    const getSentimentColor = (label?: string) => {
        switch (label) {
            case SentimentLabel.NEGATIVE: return 'red';
            case SentimentLabel.NEUTRAL: return 'orange';
            case SentimentLabel.SATISFIED: return 'blue';
            case SentimentLabel.EXCELLENT: return 'green';
            case SentimentLabel.PERFECT: return 'purple';
            default: return 'default';
        }
    };

    if (!review) return null;

    const user = userDetails[review.user_id] || { name: 'N/A', email: 'N/A' };
    const hotel = hotelDetails[review.hotel_id] || { name: 'N/A' };

    return (
        <Modal
            title={<Title level={4}>Chi tiết đánh giá</Title>}
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            width={700}
            footer={[
                <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
                    Đóng
                </Button>
            ]}
        >
            <Descriptions title="Thông tin đánh giá" bordered column={2}>
                <Descriptions.Item label="Mã đánh giá" span={2}>
                    {review.review_id}
                </Descriptions.Item>
                <Descriptions.Item label="Khách sạn" span={2}>
                    {hotel.name}
                </Descriptions.Item>
                <Descriptions.Item label="Người đánh giá" span={2}>
                    <div>
                        <div>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{user.email}</div>
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="Đánh giá">
                    <Rate disabled defaultValue={review.rating} style={{ fontSize: '16px' }} />
                    <Text style={{ marginLeft: 10 }}>{review.rating}/5</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Cảm xúc">
                    {review.sentiment_label ? (
                        <Tag color={getSentimentColor(review.sentiment_label)}>
                            {review.sentiment_label}
                        </Tag>
                    ) : (
                        <Tag>Chưa phân tích</Tag>
                    )}
                    {review.sentiment !== undefined && (
                        <div style={{ marginTop: 5 }}>
                            <Progress percent={Math.round(review.sentiment * 10)} size="small" />
                        </div>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {review.createdAt ? dayjs(review.createdAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Lần cập nhật cuối">
                    {review.updatedAt ? dayjs(review.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Nội dung đánh giá</Divider>
            <div style={{ padding: '0 20px', marginBottom: 20 }}>
                <Paragraph style={{ fontSize: '16px' }}>{review.review_text}</Paragraph>
            </div>

            {/* Phần phản hồi nếu có */}
            {review.response && (
                <>
                    <Divider orientation="left">Phản hồi</Divider>
                    <div style={{ padding: '0 20px', marginBottom: 20, backgroundColor: '#f9f9f9', borderRadius: 4, border: '1px solid #eee' }}>
                        <Paragraph style={{ padding: '16px', margin: 0 }}>
                            {review.response.response_text}
                        </Paragraph>
                        <div style={{ textAlign: 'right', padding: '0 16px 16px' }}>
                            <Text type="secondary">
                                Người phản hồi: {review.response.response_by || 'Admin'}
                            </Text>
                            <br />
                            <Text type="secondary">
                                Thời gian: {dayjs(review.response.response_date).format('DD/MM/YYYY HH:mm:ss')}
                            </Text>
                        </div>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default ReviewDetail;
