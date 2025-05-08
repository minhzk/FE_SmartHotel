import React from 'react';
import { Card, Typography, Tag, Button, Space } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

interface HotelRecommendationProps {
  hotels: {
    id: string;
    name: string;
    city: string;
    rating: number;
    price: number;
    imageUrl?: string;
  }[];
}

const HotelRecommendation: React.FC<HotelRecommendationProps> = ({ hotels }) => {
  if (!hotels || hotels.length === 0) {
    return null;
  }

  return (
    <div className="hotel-recommendations">
      <Title level={5}>Khách sạn được đề xuất:</Title>
      <div className="recommendations-list">
        {hotels.map((hotel) => (
          <Card key={hotel.id} size="small" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Title level={5} style={{ margin: 0 }}>{hotel.name}</Title>
                <Space size={4} align="center">
                  <EnvironmentOutlined />
                  <Text type="secondary">{hotel.city}</Text>
                </Space>
                <div>
                  <Tag color="blue">{hotel.rating} sao</Tag>
                  <Text type="secondary">Từ {hotel.price.toLocaleString()} VND/đêm</Text>
                </div>
              </div>
              <div>
                <Link href={`/hotels/${hotel.id}`} passHref>
                  <Button type="primary" size="small">
                    Xem chi tiết
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <style jsx>{`
        .hotel-recommendations {
          margin-top: 12px;
          border-left: 4px solid #1890ff;
          padding-left: 12px;
        }
        .recommendations-list {
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};

export default HotelRecommendation;
