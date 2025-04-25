import React from 'react';
import { Card, Row, Col, Typography, Rate, Button, Tag, Space, Image } from 'antd';
import { EnvironmentOutlined, WifiOutlined, CoffeeOutlined, CarOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

interface IHotelCardProps {
  hotel: any;
}

const HotelCard: React.FC<IHotelCardProps> = ({ hotel }) => {
  // Icon map cho tiện ích phổ biến
  const amenityIcons: Record<string, React.ReactNode> = {
    'wifi': <WifiOutlined />,
    'parking': <CarOutlined />,
    'breakfast': <CoffeeOutlined />,
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
            />
            
            {hotel.rating && (
              <div className="hotel-rating-badge">
                <Tag color="#1677ff">{hotel.rating} sao</Tag>
              </div>
            )}
          </div>
        </Col>
        
        {/* Thông tin khách sạn */}
        <Col xs={24} sm={14} md={16}>
          <div className="hotel-info">
            <div className="hotel-header">
              <Title level={4} className="hotel-name">
                <Link href={`/hotels/${hotel._id}`}>{hotel.name}</Link>
              </Title>
              
              <div className="hotel-location">
                <EnvironmentOutlined style={{ marginRight: 5 }} />
                <Text>{hotel.address}, {hotel.city}</Text>
              </div>
              
              {hotel.ai_summary?.short_description && (
                <Paragraph className="hotel-description">
                  {getShortDescription(hotel.ai_summary.short_description)}
                </Paragraph>
              )}
            </div>
            
            <div className="hotel-amenities">
              <Space size={[0, 8]} wrap>
                {hotel.amenities?.slice(0, 4).map((amenity: string, index: number) => (
                  <Tag key={index} icon={amenityIcons[amenity.toLowerCase()] || null}>
                    {amenity}
                  </Tag>
                ))}
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
          width: 100%;
          height: 200px;
          overflow: hidden;
        }
        
        .hotel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .hotel-rating-badge {
          position: absolute;
          top: 10px;
          left: 10px;
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
