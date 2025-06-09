import React from 'react';
import { Card, Row, Col, Typography, Rate, Button, Tag, Space, Image } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { HOTEL_AMENITIES } from "@/constants/hotel.constants";
import FavoriteButton from './favorite-button';

const { Title, Text, Paragraph } = Typography;

interface IHotelCardProps {
  hotel: any;
  session?: any;
}

const HotelCard: React.FC<IHotelCardProps> = ({ hotel, session }) => {
  // Lấy icon từ danh sách đã định nghĩa
  const getAmenityIcon = (amenityValue: string) => {
    const amenity = HOTEL_AMENITIES.find(item => item.value === amenityValue);
    return amenity?.icon || null;
  };
  
  // Lấy hình ảnh đại diện
  const coverImage = hotel.images && hotel.images.length > 0 
    ? hotel.images[0].url 
    : 'https://via.placeholder.com/300x200?text=No+Image';
  
  // Định dạng giá với đơn vị tiền tệ
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const getShortDescription = (description: string) => {
    return description?.length > 150 
      ? `${description.substring(0, 150)}...` 
      : description;
  };

  return (
    <Card 
      hoverable 
      className="hotel-card"
      bodyStyle={{ padding: '16px' }}
    >
      <Row gutter={[16, 16]}>
        {/* Hình ảnh khách sạn */}
        <Col xs={24} sm={10} md={8}>
          <div className="hotel-image-container">
            <Image 
              src={coverImage} 
              alt={hotel.name} 
              fallback="https://via.placeholder.com/300x200?text=Hotel+Image"
              className="hotel-image"
              style={{ height: '200px', objectFit: 'cover', width: '100%' }}
              preview={false}
            />
            
            {hotel.rating && hotel.rating > 0 ? (
              <div className="hotel-rating-badge">
                <Tag color="#1677ff">{hotel.rating} sao</Tag>
              </div>
            ) : (
              <div className="hotel-rating-badge">
                <Tag color="#faad14">Chưa được đánh giá</Tag>
              </div>
            )}
            
            {/* Thêm nút yêu thích - chỉ hiển thị khi đã đăng nhập */}
            {session?.user && (
              <div className="favorite-button-container">
                <FavoriteButton 
                  hotelId={hotel._id} 
                  session={session} 
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                />
              </div>
            )}
          </div>
        </Col>
        
        {/* Thông tin khách sạn */}
        <Col xs={24} sm={14} md={16}>
          <div className="hotel-info">
            <div className="hotel-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Title level={4} className="hotel-name">
                    <Link href={`/hotels/${hotel._id}`}>{hotel.name}</Link>
                  </Title>
                  
                  <div className="hotel-location">
                    <EnvironmentOutlined style={{ marginRight: 5 }} />
                    <Text>{hotel.address}</Text>
                  </div>
                </div>
                {/* Hiển thị thông tin cảm xúc bên phải - Đơn giản như mẫu hình ảnh */} 
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <div>
                    <span style={{
                      border: '1px solid #1677ff',
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontWeight: 600,
                      color: hotel.sentiment_score && hotel.sentiment_score > 0 ? '#1677ff' : '#999',
                      fontSize: 18,
                      background: hotel.sentiment_score && hotel.sentiment_score > 0 ? '#f6faff' : '#f5f5f5',
                      marginRight: 8,
                      borderColor: hotel.sentiment_score && hotel.sentiment_score > 0 ? '#1677ff' : '#d9d9d9'
                    }}>
                      {hotel.sentiment_score && hotel.sentiment_score > 0 ? Number(hotel.sentiment_score).toFixed(1) : '-'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, color: '#333' }}>
                      {hotel.total_reviews && hotel.total_reviews > 0 ? hotel.sentiment_label : 'Chưa có đánh giá'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {hotel.total_reviews ?? 0} nhận xét
                    </Text>
                  </div>
                </div>
              </div>
              
              
              
              {hotel.ai_summary?.short_description && (
                <Paragraph className="hotel-description">
                  {getShortDescription(hotel.ai_summary.short_description)}
                </Paragraph>
              )}
            </div>
            
            <div className="hotel-amenities">
              <Space size={[0, 8]} wrap>
                {hotel.amenities?.slice(0, 4).map((amenity: string, index: number) => {
                  const amenityInfo = HOTEL_AMENITIES.find(a => a.value === amenity);
                  return (
                    <Tag 
                      key={index} 
                      className="amenity-tag"
                    >
                      <span className="amenity-content">
                        {amenityInfo?.icon && (
                          <span className="amenity-icon">{amenityInfo.icon}</span>
                        )}
                        <span>{amenityInfo?.label || amenity}</span>
                      </span>
                    </Tag>
                  );
                })}
                {hotel.amenities?.length > 4 && (
                  <Tag>+{hotel.amenities.length - 4}</Tag>
                )}
              </Space>
            </div>
            
            <div className="hotel-footer">
              <div className="hotel-capacity">
                <Text>Sức chứa tối đa: {hotel.max_capacity} người</Text>
              </div>
              
              <div className="hotel-price">
                <div>
                  <Text type="secondary">Từ</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {formatPrice(hotel.min_price)}
                  </Title>
                  <Text type="secondary">/ đêm</Text>
                </div>
                
                <Button type="primary">
                  <Link href={`/hotels/${hotel._id}`}>Xem chi tiết</Link>
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      
      <style jsx global>{`
        .hotel-card {
          margin-bottom: 16px;
          width: 100%;
        }
        
        .hotel-image-container {
          position: relative;
          width: 282px;
          height: 200px;
          overflow: hidden;
          margin: 0 auto;
          background-color: #f5f5f5; /* Màu nền khi ảnh nhỏ hơn container */
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .hotel-image {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Đảm bảo ảnh phủ kín container */
          object-position: center; /* Luôn canh giữa ảnh */
          min-width: 100%; /* Đảm bảo ảnh luôn rộng bằng container */
          min-height: 100%; /* Đảm bảo ảnh luôn cao bằng container */
        }
        
        .hotel-rating-badge {
          position: absolute;
          top: 10px;
          left: 10px;
        }
        
        .favorite-button-container {
          position: absolute;
          bottom: 10px;
          right: 10px;
        }
        
        .hotel-info {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .hotel-header {
          margin-bottom: 12px;
        }
        
        .hotel-name {
          margin-bottom: 4px !important;
        }
        
        .hotel-location {
          color: #666;
          margin-bottom: 8px;
        }
        
        .hotel-description {
          color: #333;
          margin-bottom: 8px !important;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .hotel-amenities {
          margin-bottom: auto;
        }
        
        .amenity-tag {
          padding: 4px 8px;
        }
        
        .amenity-content {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .amenity-icon {
          display: flex;
          align-items: center;
          font-size: 14px;
        }
        
        .hotel-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }
        
        .hotel-price {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }
        
        @media (max-width: 576px) {
          .hotel-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .hotel-price {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
      `}</style>
    </Card>
  );
};

export default HotelCard;
