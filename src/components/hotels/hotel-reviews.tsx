'use client';

import React from 'react';
import { Card, Avatar, Typography, Rate, Divider, Progress, Tag, Space, Button } from 'antd';
import { UserOutlined, MessageOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface ReviewProps {
  reviews: any[];
  rating?: number;
}

const HotelReviews: React.FC<ReviewProps> = ({ reviews, rating = 0 }) => {
  // Đếm đánh giá theo số sao
  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };
  
  const totalReviews = reviews.length;
  
  // Map sentiment labels to Vietnamese
  const getSentimentLabel = (label?: string) => {
    const labelMap: Record<string, string> = {
      'NEGATIVE': 'Tiêu cực',
      'NEUTRAL': 'Trung lập',
      'SATISFIED': 'Hài lòng',
      'EXCELLENT': 'Tuyệt vời',
      'PERFECT': 'Hoàn hảo'
    };
    
    return labelMap[label || ''] || label;
  };
  
  // Get sentiment color
  const getSentimentColor = (label?: string) => {
    switch (label) {
      case 'NEGATIVE': return 'red';
      case 'NEUTRAL': return 'orange';
      case 'SATISFIED': return 'blue';
      case 'EXCELLENT': return 'green';
      case 'PERFECT': return 'purple';
      default: return 'default';
    }
  };
  
  return (
    <div className="reviews-container">
      <Card bordered={false}>
        <div className="reviews-summary">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="rating-summary">
                <Title level={2}>{rating.toFixed(1)}</Title>
                <Rate allowHalf disabled value={rating} style={{ fontSize: 16 }} />
                <Text>{totalReviews} đánh giá</Text>
              </div>
            </Col>
            <Col xs={24} md={16}>
              <div className="rating-breakdown">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="rating-bar">
                    <Text>{star} sao</Text>
                    <Progress 
                      percent={totalReviews ? (ratingCounts[star as keyof typeof ratingCounts] / totalReviews) * 100 : 0} 
                      showInfo={false}
                      strokeColor={star >= 4 ? '#52c41a' : star >= 3 ? '#1677ff' : star >= 2 ? '#faad14' : '#f5222d'}
                    />
                    <Text>{ratingCounts[star as keyof typeof ratingCounts]}</Text>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
        
        <Divider />
        
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <Text type="secondary">Chưa có đánh giá nào</Text>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review, index) => (
              <div key={review._id || index} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <Avatar 
                      icon={<UserOutlined />} 
                      src={review.user_id?.avatar} 
                    />
                    <div className="reviewer-details">
                      <Text strong>
                        {review.user_id?.name || 'Khách hàng ẩn danh'}
                      </Text>
                      <Text type="secondary">
                        {dayjs(review.createdAt).format('DD/MM/YYYY')}
                      </Text>
                    </div>
                  </div>
                  <div className="review-rating">
                    <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
                    {review.sentiment_label && (
                      <Tag color={getSentimentColor(review.sentiment_label)}>
                        {getSentimentLabel(review.sentiment_label)}
                      </Tag>
                    )}
                  </div>
                </div>
                
                <div className="review-content">
                  <Paragraph>{review.review_text}</Paragraph>
                </div>
                
                {review.response && (
                  <div className="review-response">
                    <div className="response-header">
                      <MessageOutlined style={{ marginRight: 8 }} />
                      <Text strong>Phản hồi từ khách sạn</Text>
                      <Text type="secondary" style={{ marginLeft: 'auto' }}>
                        {dayjs(review.response.response_date).format('DD/MM/YYYY')}
                      </Text>
                    </div>
                    <Paragraph>{review.response.response_text}</Paragraph>
                  </div>
                )}
                
                {index < reviews.length - 1 && <Divider style={{ margin: '16px 0' }} />}
              </div>
            ))}
          </div>
        )}
        
        {reviews.length > 0 && (
          <div className="reviews-footer">
            <Button type="default">Xem thêm đánh giá</Button>
          </div>
        )}
      </Card>
      
      <style jsx global>{`
        .reviews-container {
          margin-top: 24px;
        }
        
        .reviews-summary {
          margin-bottom: 24px;
        }
        
        .rating-summary {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        
        .rating-summary h2 {
          margin-bottom: 0;
        }
        
        .rating-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .rating-bar {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .rating-bar .ant-progress {
          flex: 1;
          margin: 0;
        }
        
        .no-reviews {
          text-align: center;
          padding: 24px 0;
        }
        
        .review-item {
          margin-bottom: 16px;
        }
        
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .reviewer-details {
          display: flex;
          flex-direction: column;
        }
        
        .review-rating {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        
        .review-content {
          margin-bottom: 12px;
        }
        
        .review-response {
          background-color: #f8f8f8;
          padding: 12px;
          border-radius: 4px;
          margin-top: 12px;
        }
        
        .response-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .reviews-footer {
          margin-top: 24px;
          text-align: center;
        }
        
        @media (max-width: 767px) {
          .rating-summary {
            margin-bottom: 24px;
          }
          
          .review-header {
            flex-direction: column;
            gap: 8px;
          }
          
          .review-rating {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

// Thêm các thành phần Row và Col để không bị lỗi
const { Row, Col } = require('antd');

export default HotelReviews;
