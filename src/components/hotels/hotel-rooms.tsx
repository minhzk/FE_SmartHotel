'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Divider, Image, Modal, Tooltip, Badge, Space, Form, Input, DatePicker, InputNumber, Select, message } from 'antd';
import { 
  CheckCircleFilled, InfoCircleOutlined, UserOutlined, HomeOutlined, 
  WifiOutlined, CoffeeOutlined, AreaChartOutlined, CalendarOutlined,
  PictureOutlined, PhoneOutlined, MailOutlined, LoadingOutlined,
  CloseCircleFilled
} from '@ant-design/icons';
import { ROOM_AMENITIES } from "@/constants/room.constants";
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { sendRequest } from '@/utils/api';
import { useSession } from 'next-auth/react';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface RoomProps {
  rooms: any[];
  checkInDate?: string;
  checkOutDate?: string;
  onSelectRoom?: (room: any) => void;
  hotelId?: string;
}

const HotelRooms: React.FC<RoomProps> = ({ 
  rooms, 
  checkInDate, 
  checkOutDate,
  onSelectRoom,
  hotelId
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [form] = Form.useForm();
  
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingRoom, setBookingRoom] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [nights, setNights] = useState<number>(1);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);
  const [isRoomAvailable, setIsRoomAvailable] = useState<boolean>(true);

  const showBookingModal = (room: any) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
      return;
    }
    
    setBookingRoom(room);
    setIsRoomAvailable(true); // Reset availability state
    
    const today = dayjs();
    const tomorrow = dayjs().add(1, 'day');
    const defaultStartDate = checkInDate ? dayjs(checkInDate) : today;
    const defaultEndDate = checkOutDate ? dayjs(checkOutDate) : tomorrow;
    
    setDateRange([defaultStartDate, defaultEndDate]);
    form.setFieldsValue({
      dateRange: [defaultStartDate, defaultEndDate],
      numberOfGuests: room.capacity > 0 ? room.capacity : 1,
      guestName: session?.user?.name || '',
      guestEmail: session?.user?.email || '',
    });
    
    const days = defaultEndDate.diff(defaultStartDate, 'day');
    setNights(days);
    setTotalAmount(days * room.price_per_night);
    
    setIsBookingModalOpen(true);
    
    // Check room availability for selected dates
    checkRoomAvailability(room._id, defaultStartDate, defaultEndDate);
  };
  
  const checkRoomAvailability = async (roomId: string, startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
    if (!roomId || !startDate || !endDate) return;
    
    setCheckingAvailability(true);
    try {
      // Sử dụng API check-room-dates đã có sẵn
      const response = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/room-availability/check-room-dates`,
        method: 'GET',
        queryParams: {
          roomId,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        }
      });
      
      setIsRoomAvailable(response?.data?.isAvailable || false);
      
      if (!response?.data?.isAvailable) {
        message.warning('Phòng không khả dụng trong khoảng thời gian đã chọn!');
      }
    } catch (error) {
      console.error('Error checking room availability:', error);
      setIsRoomAvailable(false);
    } finally {
      setCheckingAvailability(false);
    }
  };
  
  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      setDateRange([start, end]);
      
      const days = end.diff(start, 'day');
      setNights(days);
      
      if (bookingRoom) {
        const newTotal = days * bookingRoom.price_per_night;
        setTotalAmount(newTotal);
        
        // Check availability again when dates change
        checkRoomAvailability(bookingRoom._id, start, end);
      }
    }
  };
  
  const handleBooking = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      if (!session) {
        message.error('Vui lòng đăng nhập để đặt phòng');
        router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
        return;
      }
      
      if (!bookingRoom || !hotelId) {
        message.error('Thông tin phòng không hợp lệ');
        return;
      }
      
      // Check availability once more before booking
      setLoading(true);
      const startDate = values.dateRange[0];
      const endDate = values.dateRange[1];
      
      try {
        const availabilityCheck = await sendRequest({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/room-availability/check-room-dates`,
          method: 'GET',
          queryParams: {
            roomId: bookingRoom._id,
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD')
          }
        });
        
        if (!availabilityCheck?.data?.isAvailable) {
          message.error('Phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn ngày khác.');
          setIsRoomAvailable(false);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error on final availability check:', error);
        message.error('Không thể kiểm tra tình trạng phòng. Vui lòng thử lại sau.');
        setLoading(false);
        return;
      }
      
      const bookingData = {
        hotel_id: hotelId,
        room_id: bookingRoom._id,
        check_in_date: values.dateRange[0].format('YYYY-MM-DD'),
        check_out_date: values.dateRange[1].format('YYYY-MM-DD'),
        total_amount: totalAmount,
        number_of_guests: values.numberOfGuests,
        guest_name: values.guestName,
        guest_email: values.guestEmail,
        guest_phone: values.guestPhone,
        special_requests: values.specialRequests,
      };
      
      const response = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.access_token}`,
        },
        body: bookingData
      });
      
      if (response?.data) {
        message.success('Đặt phòng thành công');
        setIsBookingModalOpen(false);
        router.push(`/bookings/payment/${response.data.booking_id}`);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      message.error(error?.message || 'Có lỗi xảy ra khi đặt phòng');
    } finally {
      setLoading(false);
    }
  };
  
  if (!rooms || rooms.length === 0) {
    return (
      <Card>
        <div style={{textAlign: 'center', padding: '40px 0'}}>
          <Text type="secondary">Không có phòng nào khả dụng</Text>
        </div>
      </Card>
    );
  }
  
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
  
  const ROOM_TYPE_LABELS: Record<string, string> = {
    Standard: 'Phòng Tiêu chuẩn',
    Deluxe: 'Phòng Cao cấp (Deluxe)',
    Suite: 'Phòng Suite',
    Executive: 'Phòng Điều hành (Executive)',
    Family: 'Phòng Gia đình',
    Villa: 'Biệt thự (Villa)',
    Bungalow: 'Bungalow',
    Studio: 'Phòng Studio',
    Connecting: 'Phòng Thông nhau (Connecting)',
    Accessible: 'Phòng cho người khuyết tật',
    Penthouse: 'Penthouse',
    Presidential: 'Phòng Tổng thống',
  };

  const groupRoomsByType = (rooms: any[]) => {
    const groups: Record<string, any[]> = {};
    rooms.forEach(room => {
      const type = room.room_type || 'Khác';
      if (!groups[type]) groups[type] = [];
      groups[type].push(room);
    });
    return groups;
  };
  
  const groupedRooms = groupRoomsByType(rooms);

  return (
    <>
      <div className="room-list">
        {Object.entries(groupedRooms).map(([roomType, roomList]) => (
          <div key={roomType} className="room-type-group" style={{ marginBottom: 32 }}>
            <Title level={4} style={{ marginBottom: 16 }}>
              {ROOM_TYPE_LABELS[roomType] || roomType}
            </Title>
            {roomList.map((room) => (
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
                        {room.amenities && room.amenities.slice(0, 4).map((amenity: string, index: number) => {
                          const amenityInfo = ROOM_AMENITIES.find(a => a.value === amenity);
                          return (
                            <Tag 
                              key={index} 
                              color="blue"
                              style={{ 
                                marginBottom: 4, 
                                fontSize: '13px', 
                                padding: '4px 8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                height: 'auto'
                              }}
                            >
                              {amenityInfo?.icon && (
                                <span style={{ 
                                  marginRight: '6px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  {amenityInfo.icon}
                                </span>
                              )}
                              <span>{amenityInfo?.label || amenity}</span>
                            </Tag>
                          );
                        })}
                        {room.amenities && room.amenities.length > 4 && (
                          <Tooltip title={room.amenities.slice(4).map((a: string) => {
                            const amenInfo = ROOM_AMENITIES.find(i => i.value === a);
                            return amenInfo?.label || a;
                          }).join(', ')}>
                            <Tag
                              style={{ 
                                marginBottom: 4, 
                                fontSize: '13px', 
                                padding: '4px 8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                height: 'auto'
                              }}
                            >
                              <span style={{
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                +{room.amenities.length - 4}
                              </span>
                            </Tag>
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
                            onClick={() => showBookingModal(room)}
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
        ))}
      </div>
      
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
                  {selectedRoom.amenities && selectedRoom.amenities.map((amenity: string, index: number) => {
                    const amenityInfo = ROOM_AMENITIES.find(a => a.value === amenity);
                    return (
                      <Tag 
                        key={index} 
                        color="blue"
                        style={{ 
                          marginBottom: 8, 
                          fontSize: '14px', 
                          padding: '6px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          height: 'auto'
                        }}
                      >
                        {amenityInfo?.icon && (
                          <span className="amenity-icon" style={{ 
                            marginRight: '8px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {amenityInfo.icon}
                          </span>
                        )}
                        <span>{amenityInfo?.label || amenity}</span>
                      </Tag>
                    );
                  })}
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
                        setIsModalOpen(false);
                        showBookingModal(selectedRoom);
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
      
      {bookingRoom && (
        <Modal
          title={`Đặt phòng ${bookingRoom.name}`}
          open={isBookingModalOpen}
          onCancel={() => setIsBookingModalOpen(false)}
          footer={null}
          width={700}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            requiredMark="optional"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="dateRange"
                  label="Ngày nhận phòng - Ngày trả phòng"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                >
                  <RangePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY"
                    onChange={handleDateChange}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
                
                {checkingAvailability && (
                  <div style={{ marginBottom: 16 }}>
                    <LoadingOutlined style={{ marginRight: 8 }} /> Đang kiểm tra tình trạng phòng...
                  </div>
                )}
                
                {!checkingAvailability && !isRoomAvailable && (
                  <div style={{ color: '#ff4d4f', marginBottom: 16 }}>
                    <CloseCircleFilled style={{ marginRight: 8 }} /> Phòng không khả dụng trong khoảng thời gian này
                  </div>
                )}
                
                {!checkingAvailability && isRoomAvailable && (
                  <div style={{ color: '#52c41a', marginBottom: 16 }}>
                    <CheckCircleFilled style={{ marginRight: 8 }} /> Phòng khả dụng trong khoảng thời gian này
                  </div>
                )}
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="numberOfGuests"
                  label="Số lượng khách"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng khách!' }]}
                >
                  <InputNumber 
                    min={1} 
                    max={bookingRoom.capacity} 
                    style={{ width: '100%' }} 
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <div className="booking-summary">
                  <Text>Thời gian lưu trú: <strong>{nights} đêm</strong></Text>
                  <br />
                  <Text>Giá phòng: <strong>{formatPrice(bookingRoom.price_per_night)}</strong> / đêm</Text>
                </div>
              </Col>
            </Row>
            
            <Divider orientation="left">Thông tin khách hàng</Divider>
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="guestName"
                  label="Họ tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="guestEmail"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="guestPhone"
                  label="Số điện thoại"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="specialRequests"
                  label="Yêu cầu đặc biệt"
                >
                  <Input.TextArea rows={3} placeholder="Nếu bạn có yêu cầu đặc biệt, vui lòng cho chúng tôi biết" />
                </Form.Item>
              </Col>
            </Row>
            
            <Divider />
            
            <div className="booking-total">
              <Row justify="space-between" align="middle">
                <Col>
                  <Text>Tổng tiền:</Text>
                  <Title level={3} style={{ margin: 0 }}>{formatPrice(totalAmount)}</Title>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleBooking}
                    loading={loading}
                    disabled={checkingAvailability || !isRoomAvailable}
                  >
                    Tiến hành thanh toán
                  </Button>
                </Col>
              </Row>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">
                  Bằng cách nhấn nút "Tiến hành thanh toán", bạn đồng ý với các điều khoản và điều kiện đặt phòng của chúng tôi.
                </Text>
              </div>
            </div>
          </Form>
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
        
        .booking-summary {
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .booking-total {
          padding-top: 16px;
        }
        
        .room-type-group {
          /* Có thể thêm style nếu muốn */
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
