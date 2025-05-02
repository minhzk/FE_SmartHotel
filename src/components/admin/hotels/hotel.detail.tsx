'use client'
import { Button, Carousel, Descriptions, Divider, Image, Modal, Rate, Space, Tag, Typography, Statistic, Row, Col } from "antd";
import { useState, useEffect } from "react";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { EnvironmentOutlined } from '@ant-design/icons';
import { HOTEL_AMENITIES } from "@/constants/hotel.constants";

const { Title, Text, Paragraph } = Typography;

interface IProps {
    isDetailModalOpen: boolean;
    setIsDetailModalOpen: (value: boolean) => void;
    hotel: any;
}

const HotelDetail = (props: IProps) => {
    const { isDetailModalOpen, setIsDetailModalOpen, hotel } = props;
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchHotelDetails = async () => {
            if (!hotel?._id) return;
            
            setLoading(true);
            try {
                // Lấy danh sách các loại phòng
                const roomsRes = await sendRequest({
                    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms/hotel/${hotel._id}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session?.user?.access_token}`
                    }
                });
                
                if (roomsRes?.data?.results) {
                    setRoomTypes(roomsRes.data.results);
                }
            } catch (error) {
                console.error('Error fetching hotel details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isDetailModalOpen && hotel) {
            fetchHotelDetails();
        }
    }, [hotel, isDetailModalOpen, session]);

    if (!hotel) return null;

    // Render map nếu có tọa độ
    const renderMap = () => {
        if (hotel.location?.latitude && hotel.location?.longitude) {
            const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${hotel.location.latitude},${hotel.location.longitude}&zoom=15`;
            
            return (
                <div style={{ marginTop: 16 }}>
                    <iframe
                        width="100%"
                        height="300"
                        frameBorder="0"
                        src={mapUrl}
                        allowFullScreen
                    />
                </div>
            );
        }
        return null;
    };

    // Hiển thị tóm tắt AI nếu có
    const renderAISummary = () => {
        if (hotel.ai_summary) {
            return (
                <>
                    <Divider orientation="left">Tóm tắt AI</Divider>
                    {hotel.ai_summary.short_description && (
                        <Paragraph>{hotel.ai_summary.short_description}</Paragraph>
                    )}
                    
                    {hotel.ai_summary.highlight_features && hotel.ai_summary.highlight_features.length > 0 && (
                        <>
                            <Text strong>Điểm nổi bật:</Text>
                            <ul>
                                {hotel.ai_summary.highlight_features.map((feature: string, index: number) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                        </>
                    )}
                    
                    {hotel.ai_summary.average_sentiment !== undefined && (
                        <Text>
                            Đánh giá cảm xúc trung bình: <Tag color={hotel.ai_summary.average_sentiment >= 7 ? 'green' : (hotel.ai_summary.average_sentiment >= 5 ? 'blue' : 'orange')}>
                                {hotel.ai_summary.average_sentiment.toFixed(1)}/10
                            </Tag>
                        </Text>
                    )}
                    
                    {hotel.ai_summary.last_updated && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                            Cập nhật lần cuối: {new Date(hotel.ai_summary.last_updated).toLocaleDateString('vi-VN')}
                        </Text>
                    )}
                </>
            );
        }
        return null;
    };

    return (
        <Modal
            title={<Title level={4}>{hotel.name}</Title>}
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            width={800}
            footer={[
                <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
                    Đóng
                </Button>
            ]}
        >
            {/* Hiển thị hình ảnh khách sạn */}
            {hotel.images && hotel.images.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <Carousel autoplay>
                        {hotel.images.map((image: any, index: number) => (
                            <div key={index}>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Image 
                                        src={image.url} 
                                        alt={image.description || `Ảnh khách sạn ${index + 1}`}
                                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>
            )}

            {/* Thông tin cơ bản */}
            <Descriptions title="Thông tin khách sạn" bordered column={2}>
                <Descriptions.Item label="Tên khách sạn" span={2}>
                    {hotel.name}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                    <Space>
                        <EnvironmentOutlined />
                        {hotel.address}, {hotel.city}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Đánh giá">
                    <Rate disabled defaultValue={hotel.rating} />
                    <span style={{ marginLeft: 8 }}>{hotel.rating} sao</span>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={hotel.is_active ? 'green' : 'red'}>
                        {hotel.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Đặt cọc">
                    <Tag color={hotel.accept_deposit ? 'green' : 'orange'}>
                        {hotel.accept_deposit ? 'Chấp nhận đặt cọc' : 'Không chấp nhận đặt cọc'}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Sức chứa tối đa">
                    {hotel.max_capacity || 'Không giới hạn'} người
                </Descriptions.Item>
                <Descriptions.Item label="Giờ nhận phòng">
                    {hotel.check_in_time || '14:00'}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ trả phòng">
                    {hotel.check_out_time || '12:00'}
                </Descriptions.Item>
            </Descriptions>

            {/* Thông tin giá */}
            <Divider orientation="left">Thông tin giá</Divider>
            <Row gutter={16}>
                <Col span={12}>
                    <Statistic
                        title="Giá thấp nhất"
                        value={hotel.min_price || 0}
                        suffix="VNĐ"
                        precision={0}
                    />
                </Col>
                <Col span={12}>
                    <Statistic
                        title="Giá cao nhất"
                        value={hotel.max_price || 0}
                        suffix="VNĐ"
                        precision={0}
                    />
                </Col>
            </Row>

            {/* Mô tả khách sạn */}
            <Divider orientation="left">Mô tả</Divider>
            <Paragraph>
                {hotel.description || 'Không có mô tả'}
            </Paragraph>

            {/* Tóm tắt AI */}
            {renderAISummary()}

            {/* Tiện ích */}
            <Divider orientation="left">Tiện ích</Divider>
            <Space wrap>
                {hotel.amenities && hotel.amenities.length > 0 ? (
                    hotel.amenities.map((amenity: string, index: number) => {
                        const amenityInfo = HOTEL_AMENITIES.find(a => a.value === amenity);
                        return (
                            <Tag key={index} color="blue" icon={amenityInfo?.icon}>
                                {amenityInfo?.label || amenity}
                            </Tag>
                        );
                    })
                ) : (
                    <Text type="secondary">Không có thông tin về tiện ích</Text>
                )}
            </Space>

            {/* Bản đồ */}
            <Divider orientation="left">Vị trí</Divider>
            {renderMap() || <Text type="secondary">Không có thông tin vị trí</Text>}

            {/* Thông tin các loại phòng */}
            <Divider orientation="left">Các loại phòng</Divider>
            {loading ? (
                <div>Đang tải...</div>
            ) : roomTypes.length > 0 ? (
                roomTypes.map((room, index) => (
                    <Descriptions key={index} bordered size="small" style={{ marginBottom: 16 }}>
                        <Descriptions.Item label="Tên phòng" span={3}>
                            {room.name || room.room_type}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giá" span={1}>
                            {room.price_per_night?.toLocaleString('vi-VN')} VNĐ / đêm
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại giường" span={1}>
                            {room.bed_configuration && room.bed_configuration.length > 0 ? (
                                <div>
                                    {room.bed_configuration.map((bed: {type: string, count: number}, i: number) => (
                                        <div key={i}>
                                            {bed.count} x {bed.type}
                                            {i < room.bed_configuration.length - 1 && ', '}
                                        </div>
                                    ))}
                                </div>
                            ) : 'Không có thông tin'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sức chứa" span={1}>
                            {room.capacity || '2'} người
                        </Descriptions.Item>
                    </Descriptions>
                ))
            ) : (
                <Text type="secondary">Không có thông tin về các loại phòng</Text>
            )}
        </Modal>
    );
};

export default HotelDetail;
