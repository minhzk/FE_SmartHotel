'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Divider, Image, Modal, Tooltip, Badge, Space } from 'antd';
import { 
  CheckCircleFilled, InfoCircleOutlined, UserOutlined, HomeOutlined, 
  WifiOutlined, CoffeeOutlined, AreaChartOutlined, CalendarOutlined,
  PictureOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface RoomProps {
  rooms: any[];
  checkInDate?: string;
  checkOutDate?: string;
  onSelectRoom?: (room: any) => void;
}

const HotelRooms: React.FC<RoomProps> = ({ 
  rooms, 
  checkInDate, 
  checkOutDate,
  onSelectRoom
}) => {
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  if (!rooms || rooms.length === 0) {
    return (
      <Card>
        <div style={{textAlign: 'center', padding: '40px 0'}}>
          <Text type="secondary">Không có phòng nào khả dụng</Text>
        </div>
      </Card>
    );
  }
  
  // Function to map bed configuration to readable text
  const formatBedConfig = (bedConfig: any[]) => {
    if (!bedConfig || !Array.isArray(bedConfig) || bedConfig.length === 0) {
      return 'N/A';
    }
    
    return bedConfig.map(bed => {
      const typeMap: Record<string, string> = {
        'single': 'Giường đơn',
        'double': 'Giường đôi',
        'queen': 'Giường Queen',
        'king': 'Giường King',
        'twin': 'Giường Twin',
        'sofa_bed': 'Giường sofa',
        'bunk_bed': 'Giường tầng',
        'murphy_bed': 'Giường xếp',
        'futon': 'Giường futon'
      };
      
      return `${bed.count} ${typeMap[bed.type] || bed.type}`;
    }).join(', ');
  };
  
  // Format price with VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const showModal = (room: any) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };
  
  return (
    <>
      <div className="room-list">
        {rooms.map((room) => (
          <Card key={room._id} className="room-card" bordered={false}>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={8}>
                <div className="room-image-container">
                  {room.images && room.images.length > 0 ? (
                    <Image 
                      src={room.images[0].url} 
                      alt={room.name}
                      preview={false}
                      className="room-image"
                      onClick={() => showModal(room)}
                    />
                  ) : (
                    <div className="room-image-placeholder">
                      <PictureOutlined style={{ fontSize: 36, color: '#d9d9d9' }} />
                      <Text type="secondary">Không có ảnh</Text>
                    </div>
                  )}
                  <div className="image-count" onClick={() => showModal(room)}>
                    {room.images && room.images.length > 1 && (
                      <Badge count={`+${room.images.length - 1}`} />
                    )}
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={10}>
                <div className="room-info">
                  <Title level={5} className="room-title">{room.name}</Title>
                  <div className="room-features">
                    <div className="room-feature">
                      <AreaChartOutlined /> <Text>{room.size || 'N/A'} m²</Text>
                    </div>
                    <div className="room-feature">
                      <UserOutlined /> <Text>Tối đa {room.capacity} người</Text>
                    </div>
                    <div className="room-feature">
                      <HomeOutlined /> <Text>{formatBedConfig(room.bed_configuration)}</Text>
                    </div>
                  </div>
                  
                  <Paragraph ellipsis={{ rows: 2 }} className="room-description">
                    {room.description}
                  </Paragraph>
                  
                  <div className="room-amenities">
                    {room.amenities && room.amenities.slice(0, 4).map((amenity: string, index: number) => (
                      <Tag key={index} color="blue">
                        {amenity === 'wifi' && <WifiOutlined />}
                        {amenity === 'breakfast' && <CoffeeOutlined />}
                        {' '}{amenity}
                      </Tag>
                    ))}
                    {room.amenities && room.amenities.length > 4 && (
                      <Tooltip title={room.amenities.slice(4).join(', ')}>
                        <Tag>+{room.amenities.length - 4}</Tag>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={6}>
                <div className="room-booking">
                  <div className="room-price">
                    <Title level={4}>{formatPrice(room.price_per_night)}</Title>
                    <Text type="secondary">/ đêm</Text>
                  </div>
                  
                  {room.is_bookable ? (
                    <>
                      {room.number_of_rooms > 0 ? (
                        <div className="room-availability">
                          <Tag color="green"><CheckCircleFilled /> Còn {room.number_of_rooms} phòng</Tag>
                        </div>
                      ) : (
                        <div className="room-availability">
                          <Tag color="red">Hết phòng</Tag>
                        </div>
                      )}
                      <Button 
                        type="primary" 
                        block
                        onClick={() => onSelectRoom && onSelectRoom(room)}
                        disabled={room.number_of_rooms <= 0}
                      >
                        Đặt ngay
                      </Button>
                    </>
                  ) : (
                    <div className="room-availability">
                      <Tag color="red">Không khả dụng</Tag>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
      
      {/* Room Detail Modal */}
      {selectedRoom && (
        <Modal
          title={selectedRoom.name}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={800}
        >
          {selectedRoom.images && selectedRoom.images.length > 0 ? (
            <Image.PreviewGroup>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Image
                  src={selectedRoom.images[0].url}
                  alt={selectedRoom.name}
                  style={{ maxHeight: 400, objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', overflowX: 'auto', gap: 8 }}>
                {selectedRoom.images.map((image: any, index: number) => (
                  <Image
                    key={index}
                    src={image.url}
                    alt={`${selectedRoom.name} - ảnh ${index + 1}`}
                    width={100}
                    height={70}
                    style={{ objectFit: 'cover' }}
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          ) : (
            <div style={{ 
              height: 200, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f5f5f5'
            }}>
              <Text type="secondary">Không có ảnh</Text>
            </div>
          )}
          
          <Divider />
          
          <div className="room-detail">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Title level={5}>Chi tiết phòng</Title>
                <div className="room-features detail">
                  <div className="room-feature">
                    <AreaChartOutlined /> <Text>Diện tích: {selectedRoom.size || 'N/A'} m²</Text>
                  </div>
                  <div className="room-feature">
                    <UserOutlined /> <Text>Sức chứa: {selectedRoom.capacity} người ({selectedRoom.max_adults || selectedRoom.capacity} người lớn, {selectedRoom.max_children || 0} trẻ em)</Text>
                  </div>
                  <div className="room-feature">
                    <HomeOutlined /> <Text>Giường: {formatBedConfig(selectedRoom.bed_configuration)}</Text>
                  </div>
                </div>
              </Col>
              
              <Col span={12}>
                <Title level={5}>Tiện ích</Title>
                <div className="amenities-grid">
                  {selectedRoom.amenities && selectedRoom.amenities.map((amenity: string, index: number) => (
                    <Tag key={index} color="blue">
                      {amenity === 'wifi' && <WifiOutlined />}
                      {amenity === 'breakfast' && <CoffeeOutlined />}
                      {' '}{amenity}
                    </Tag>
                  ))}
                </div>
              </Col>
              
              <Col span={24}>
                <Title level={5}>Mô tả</Title>
                <Paragraph>{selectedRoom.description}</Paragraph>
              </Col>
            </Row>
            
            <Divider />
            
            <div className="room-booking-detail">
              <Row align="middle" justify="space-between">
                <Col>
                  <div className="room-price">
                    <Title level={3}>{formatPrice(selectedRoom.price_per_night)}</Title>
                    <Text type="secondary">/ đêm</Text>
                  </div>
                </Col>
                <Col>
                  {selectedRoom.is_bookable && selectedRoom.number_of_rooms > 0 && (
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={() => {
                        onSelectRoom && onSelectRoom(selectedRoom);
                        setIsModalOpen(false);
                      }}
                    >
                      Đặt ngay
                    </Button>
                  )}
                </Col>
              </Row>
            </div>
          </div>
        </Modal>
      )}
      
      <style jsx global>{`
        .room-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .room-card {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border-radius: 8px;
        }
        
        .room-image-container {
          position: relative;
          width: 100%;
          height: 180px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
        }
        
        .room-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .room-image:hover {
          transform: scale(1.05);
        }
        
        .image-count {
          position: absolute;
          bottom: 8px;
          right: 8px;
        }
        
        .room-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
        }
        
        .room-info {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .room-title {
          margin-bottom: 12px;
        }
        
        .room-features {
          margin-bottom: 12px;
        }
        
        .room-feature {
          margin-bottom: 4px;
        }
        
        .room-description {
          margin-bottom: 12px;
          flex-grow: 1;
        }
        
        .room-amenities {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .room-booking {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
        }
        
        .room-price {
          text-align: right;
          margin-bottom: 16px;
        }
        
        .room-availability {
          margin-bottom: 16px;
        }
        
        .room-features.detail .room-feature {
          margin-bottom: 8px;
        }
        
        .amenities-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .room-booking-detail {
          padding-top: 16px;
        }
        
        @media (max-width: 575px) {
          .room-booking {
            margin-top: 16px;
            align-items: stretch;
          }
          
          .room-price, .room-availability {
            text-align: left;
          }
        }
      `}</style>
    </>
  );
};

export default HotelRooms;
