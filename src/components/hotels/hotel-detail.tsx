'use client';

import React, { useState } from 'react';
import { 
  Card, Row, Col, Typography, Tabs, Rate, Tag, Breadcrumb,
  Button, Space, Divider, Descriptions, Affix, Badge, ConfigProvider
} from 'antd';
import { 
  HomeOutlined, EnvironmentOutlined, WifiOutlined, CarOutlined, 
  CoffeeOutlined, CheckCircleOutlined, LeftOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import HotelGallery from './hotel-gallery';
import HotelRooms from './hotel-rooms';
import HotelReviews from './hotel-reviews';
import { useRouter } from 'next/navigation';
import { sendRequest } from '@/utils/api';
import { HOTEL_AMENITIES } from "@/constants/hotel.constants";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface HotelDetailProps {
  hotel: any;
  rooms: any[];
  reviews: any[];
  session: any;
}

const HotelDetail: React.FC<HotelDetailProps> = ({ hotel, rooms, reviews, session }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Hình ảnh khách sạn
  const hotelImages = hotel.images || [];
  
  // Đánh giá khách sạn
  const totalRating = hotel.rating || 0;
  
  // Format tiện ích thành icon
  const amenityIcons: Record<string, React.ReactNode> = {
    'wifi': <WifiOutlined />,
    'parking': <CarOutlined />,
    'breakfast': <CoffeeOutlined />,
  };
  
  const handleBookRoom = async (room: any) => {
    if (!session) {
      // Redirect to login if not authenticated
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(`/hotels/${hotel._id}`));
      return;
    }
    
    // Later add logic to select dates and navigate to booking page
    router.push(`/booking?hotelId=${hotel._id}&roomId=${room._id}`);
  };
  
  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            itemSelectedColor: '#1677ff',
            inkBarColor: '#1677ff',
          },
        },
      }}
    >
      <div className="hotel-detail-container">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { title: <Link href="/"><HomeOutlined /></Link> },
            { title: <Link href="/hotels">Khách sạn</Link> },
            { title: hotel.name }
          ]}
          className="breadcrumb"
        />
        
        {/* Back button */}
        <div className="back-button">
          <Button icon={<LeftOutlined />} onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>
        
        {/* Hotel Header */}
        <div className="hotel-header">
          <Title level={2}>{hotel.name}</Title>
          <div className="hotel-rating">
            <Rate disabled defaultValue={totalRating} />
            <Text>{totalRating} sao</Text>
          </div>
          <div className="hotel-location">
            <EnvironmentOutlined />
            <Text>{hotel.address}, {hotel.city}</Text>
          </div>
        </div>
        
        {/* Gallery */}
        <HotelGallery images={hotelImages} />
        
        {/* Main content with tabs */}
        <Row gutter={[24, 24]}>
          {/* Left column - Tabs & Content */}
          <Col xs={24} lg={16}>
            <Card bordered={false}>
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab} 
                size="large"
                className="hotel-tabs"
              >
                <TabPane tab="Tổng quan" key="overview">
                  <div className="hotel-description">
                    <Title level={4}>Giới thiệu</Title>
                    <Paragraph>
                      {hotel.description}
                    </Paragraph>
                    
                    {hotel.ai_summary && hotel.ai_summary.short_description && (
                      <>
                        <Title level={4}>Tóm tắt</Title>
                        <Paragraph>
                          {hotel.ai_summary.short_description}
                        </Paragraph>
                        
                        {hotel.ai_summary.highlight_features && hotel.ai_summary.highlight_features.length > 0 && (
                          <>
                            <Title level={4}>Điểm nổi bật</Title>
                            <ul className="highlight-features">
                              {hotel.ai_summary.highlight_features.map((feature: string, index: number) => (
                                <li key={index}>
                                  <CheckCircleOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </>
                    )}
                    
                    <Title level={4}>Tiện ích</Title>
                    <div className="amenities-grid">
                      {hotel.amenities && hotel.amenities.map((amenity: string, index: number) => {
                        const amenityInfo = HOTEL_AMENITIES.find(a => a.value === amenity);
                        return (
                          <Tag 
                            key={index} 
                            color="blue"
                            icon={amenityInfo?.icon}
                            style={{ marginBottom: 8, fontSize: '14px', padding: '4px 8px' }}
                          >
                            {amenityInfo?.label || amenity}
                          </Tag>
                        );
                      })}
                    </div>
                    
                    <Divider />
                    
                    <Title level={4}>Thông tin hữu ích</Title>
                    <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                      <Descriptions.Item label="Check-in">14:00</Descriptions.Item>
                      <Descriptions.Item label="Check-out">12:00</Descriptions.Item>
                      <Descriptions.Item label="Đặt cọc">
                        {hotel.accept_deposit ? 'Có' : 'Không'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Xây dựng năm">
                        {hotel.built_year || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Sức chứa tối đa" span={2}>
                        {hotel.max_capacity || 'Không giới hạn'} người
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                </TabPane>
                
                <TabPane tab="Phòng" key="rooms">
                  <div className="hotel-rooms">
                    <HotelRooms 
                      rooms={rooms} 
                      onSelectRoom={handleBookRoom}
                    />
                  </div>
                </TabPane>
                
                <TabPane tab={`Đánh giá (${reviews.length})`} key="reviews">
                  <div className="hotel-reviews">
                    <HotelReviews 
                      reviews={reviews} 
                      rating={hotel.average_rating || totalRating}
                    />
                  </div>
                </TabPane>
                
                <TabPane tab="Vị trí" key="location">
                  <div className="hotel-location-tab">
                    <Title level={4}>Vị trí khách sạn</Title>
                    <div className="hotel-map">
                      {hotel.location?.latitude && hotel.location?.longitude ? (
                        <iframe
                          width="100%"
                          height="450"
                          style={{ border: 0, borderRadius: 8 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${hotel.location.latitude},${hotel.location.longitude}&zoom=15`}
                          title="Hotel location on Google Maps"
                        />
                      ) : (
                        <div className="map-placeholder">
                          <Text type="secondary">Không có thông tin vị trí</Text>
                        </div>
                      )}
                    </div>
                    
                    <Divider />
                    
                    <div className="location-details">
                      <Title level={5}>Thông tin vị trí</Title>
                      <Descriptions column={{ xs: 1, sm: 2 }}>
                        <Descriptions.Item label="Địa chỉ">{hotel.address}</Descriptions.Item>
                        <Descriptions.Item label="Thành phố">{hotel.city}</Descriptions.Item>
                        <Descriptions.Item label="Khoảng cách đến trung tâm">0.5 km</Descriptions.Item>
                        <Descriptions.Item label="Khoảng cách đến sân bay">2.2 km</Descriptions.Item>
                      </Descriptions>
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
          
          {/* Right column - Booking summary */}
          <Col xs={24} lg={8}>
            <Affix offsetTop={20}>
              <Card 
                title="Giá phòng" 
                className="booking-summary-card"
                extra={<InfoCircleOutlined />}
              >
                <div className="price-range">
                  <Title level={3}>
                    {hotel.min_price?.toLocaleString('vi-VN')} - {hotel.max_price?.toLocaleString('vi-VN')} VNĐ
                  </Title>
                  <Text type="secondary">/ đêm</Text>
                </div>
                
                <Divider />
                
                <div className="hotel-quick-facts">
                  <div className="quick-fact">
                    <Text strong>Đánh giá:</Text>
                    <Text>{totalRating} sao</Text>
                  </div>
                  <div className="quick-fact">
                    <Text strong>Loại phòng:</Text>
                    <Text>{rooms.length} loại</Text>
                  </div>
                  <div className="quick-fact">
                    <Text strong>Sức chứa tối đa:</Text>
                    <Text>{hotel.max_capacity} người</Text>
                  </div>
                </div>
                
                <Divider />
                
                <Button 
                  type="primary" 
                  size="large" 
                  block
                  onClick={() => {
                    if (activeTab !== 'rooms') {
                      setActiveTab('rooms');
                      document.querySelector('.hotel-tabs')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Xem phòng trống
                </Button>
              </Card>
            </Affix>
          </Col>
        </Row>
      </div>
      
      <style jsx global>{`
        .hotel-detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .breadcrumb {
          margin-bottom: 16px;
        }
        
        .back-button {
          margin-bottom: 16px;
        }
        
        .hotel-header {
          margin-bottom: 24px;
        }
        
        .hotel-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .hotel-location {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
        }
        
        .hotel-tabs {
          margin-bottom: 24px;
        }
        
        .highlight-features {
          padding-left: 0;
          list-style-type: none;
        }
        
        .highlight-features li {
          margin-bottom: 8px;
        }
        
        .amenities-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .booking-summary-card {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .price-range {
          text-align: center;
          margin-bottom: 8px;
        }
        
        .hotel-quick-facts {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .quick-fact {
          display: flex;
          justify-content: space-between;
        }
        
        .map-placeholder {
          height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          border-radius: 8px;
        }
        
        @media (max-width: 767px) {
          .hotel-header {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </ConfigProvider>
  );
};

export default HotelDetail;
