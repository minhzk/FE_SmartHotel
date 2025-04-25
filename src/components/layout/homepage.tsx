'use client'

import { SearchOutlined, HomeOutlined, BankOutlined, GlobalOutlined, UserOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons"
import { Tabs, Input, DatePicker, Button, Card, Row, Col, Typography, Dropdown, Space, Carousel, Image, Popover } from "antd"
import { useState } from "react"
import dayjs from 'dayjs'
import type { TabsProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const HomePage = () => {
    const [adults, setAdults] = useState(1);
    const [rooms, setRooms] = useState(1);
    const [children, setChildren] = useState(0);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const onChange = (key: string) => {
        console.log(key);
    };

    // Hàm xử lý tăng giảm
    const increment = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
        setter(prev => prev + 1);
    };

    const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
        if (value > 0) {
            setter(prev => prev - 1);
        }
    };

    // Nội dung popover đếm số người và phòng
    const popoverContent = (
        <div className="guest-counter-container">
            <div className="guest-counter-item">
                <div className="guest-counter-label">
                    <div>Phòng</div>
                </div>
                <div className="guest-counter-controls">
                    <Button 
                        icon={<MinusOutlined />} 
                        shape="circle" 
                        onClick={() => decrement(setRooms, rooms)} 
                        disabled={rooms <= 1}
                    />
                    <span className="guest-counter-value">{rooms}</span>
                    <Button 
                        icon={<PlusOutlined />} 
                        shape="circle" 
                        onClick={() => increment(setRooms, rooms)}
                    />
                </div>
            </div>
            
            <div className="guest-counter-item">
                <div className="guest-counter-label">
                    <div>Người lớn</div>
                    <div className="guest-counter-sublabel">18 tuổi trở lên</div>
                </div>
                <div className="guest-counter-controls">
                    <Button 
                        icon={<MinusOutlined />} 
                        shape="circle" 
                        onClick={() => decrement(setAdults, adults)} 
                        disabled={adults <= 1}
                    />
                    <span className="guest-counter-value">{adults}</span>
                    <Button 
                        icon={<PlusOutlined />} 
                        shape="circle" 
                        onClick={() => increment(setAdults, adults)}
                    />
                </div>
            </div>
            
            <div className="guest-counter-item">
                <div className="guest-counter-label">
                    <div>Trẻ em</div>
                    <div className="guest-counter-sublabel">0-17 tuổi</div>
                </div>
                <div className="guest-counter-controls">
                    <Button 
                        icon={<MinusOutlined />} 
                        shape="circle" 
                        onClick={() => decrement(setChildren, children)} 
                        disabled={children <= 0}
                    />
                    <span className="guest-counter-value">{children}</span>
                    <Button 
                        icon={<PlusOutlined />} 
                        shape="circle" 
                        onClick={() => increment(setChildren, children)}
                    />
                </div>
            </div>
        </div>
    );

    // Danh sách các điểm đến phổ biến
    const destinations = [
        {
            id: 1,
            name: 'Hà Nội',
            image: 'https://vcdn1-dulich.vnecdn.net/2022/05/12/Hanoi2-1652338755-3632-1652338809.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=NxMN93PTvOTnHNryMx3xJw',
            hotels: 458
        },
        {
            id: 2,
            name: 'Hồ Chí Minh',
            image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000',
            hotels: 672
        },
        {
            id: 3,
            name: 'Đà Nẵng',
            image: 'https://vcdn1-dulich.vnecdn.net/2022/06/03/cau-vang-jpeg-mobile-4171-1654247848.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=xrjEn1shZLiHomFix1sHNQ',
            hotels: 325
        },
        {
            id: 4,
            name: 'Nha Trang',
            image: 'https://vcdn1-dulich.vnecdn.net/2022/05/09/shutterstock-280926449-6744-15-3483-9174-1652070682.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=bGCo6Rv6DseMDE_07TT1Aw',
            hotels: 286
        },
        {
            id: 5, 
            name: 'Đà Lạt',
            image: 'https://samtenhills.vn/wp-content/uploads/2024/01/kham-pha-4-khu-du-lich-tam-linh-da-lat-noi-tieng-bat-nhat.jpg',
            hotels: 198
        },
        {
            id: 6,
            name: 'Phú Quốc',
            image: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?q=80&w=1000',
            hotels: 145
        }
    ];

    // Các tab tìm kiếm
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: (
                <span>
                    <HomeOutlined /> Khách Sạn & Nhà
                </span>
            ),
            children: (
                <div className="search-container">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={24} lg={8}>
                            <div className="search-label">Điểm đến</div>
                            <Input 
                                size="large" 
                                placeholder="Bạn muốn đi đâu?" 
                                prefix={<SearchOutlined />} 
                            />
                        </Col>
                        <Col xs={24} md={24} lg={8}>
                            <div className="search-label">Ngày nhận / Trả phòng</div>
                            <RangePicker 
                                size="large"
                                style={{ width: '100%' }}
                                placeholder={['Nhận phòng', 'Trả phòng']}
                            />
                        </Col>
                        <Col xs={24} md={24} lg={8}>
                            <div className="search-label">Khách & phòng</div>
                            <Popover 
                                content={popoverContent} 
                                title={null} 
                                trigger="click" 
                                open={isPopoverOpen}
                                onOpenChange={setIsPopoverOpen}
                                placement="bottomRight"
                                overlayClassName="guest-counter-popover"
                            >
                                <Button size="large" style={{ width: '100%', textAlign: 'left' }}>
                                    <Space>
                                        <UserOutlined />
                                        {adults} người lớn, {children} trẻ em, {rooms} phòng
                                    </Space>
                                </Button>
                            </Popover>
                        </Col>
                        <Col xs={24}>
                            <Button type="primary" size="large" block>
                                <SearchOutlined /> Tìm Kiếm
                            </Button>
                        </Col>
                    </Row>
                </div>
            ),
        },
        {
            key: '2',
            label: (
                <span>
                    <BankOutlined /> Căn Hộ
                </span>
            ),
            children: `Tính năng đang phát triển`,
        },
        {
            key: '3',
            label: (
                <span>
                    <GlobalOutlined /> Tour Du Lịch
                </span>
            ),
            children: `Tính năng đang phát triển`,
        },
    ];

    return (
        <div className="homepage-container">
            {/* Banner và khung tìm kiếm */}
            <div className="hero-section" style={{ 
                backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '60px 20px',
                borderRadius: '8px',
                marginBottom: '40px',
                position: 'relative'
            }}>
                <div style={{ 
                    backgroundColor: 'rgba(0,0,0,0.4)', 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '8px'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Title style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
                        Tìm Khách Sạn Tốt Nhất Cho Chuyến Đi Của Bạn
                    </Title>
                    
                    <Card style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <Tabs 
                            defaultActiveKey="1" 
                            onChange={onChange}
                            items={items}
                        />
                    </Card>
                </div>
            </div>

            {/* Phần điểm đến phổ biến */}
            <div className="destinations-section" style={{ padding: '0 20px', marginBottom: '40px' }}>
                <Title level={2} style={{ marginBottom: '20px' }}>Điểm Đến Phổ Biến</Title>
                <Paragraph style={{ marginBottom: '30px' }}>
                    Khám phá những địa điểm du lịch hấp dẫn nhất với nhiều lựa chọn khách sạn đa dạng
                </Paragraph>
                <Row gutter={[16, 16]}>
                    {destinations.map(destination => (
                        <Col xs={24} sm={12} md={8} key={destination.id}>
                            <Card 
                                hoverable
                                cover={<Image alt={destination.name} src={destination.image} style={{ height: '200px', objectFit: 'cover' }} />}
                                style={{ marginBottom: '16px' }}
                            >
                                <Card.Meta 
                                    title={destination.name} 
                                    description={`${destination.hotels} khách sạn`} 
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Phần ưu đãi đặc biệt */}
            <div className="offers-section" style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '40px' }}>
                <Title level={2} style={{ marginBottom: '20px' }}>Ưu Đãi Đặc Biệt</Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Card hoverable style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}>
                            <Title level={4}>Giảm giá 25% cho đặt phòng sớm</Title>
                            <Paragraph>Đặt trước 30 ngày và nhận ưu đãi đặc biệt tại các khách sạn cao cấp</Paragraph>
                            <Button type="primary">Xem ngay</Button>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card hoverable style={{ backgroundColor: '#f6ffed', borderColor: '#52c41a' }}>
                            <Title level={4}>Kỳ nghỉ cuối tuần giảm 15%</Title>
                            <Paragraph>Đặt phòng cho kỳ nghỉ cuối tuần và tiết kiệm ngay 15% cho mọi đặt phòng</Paragraph>
                            <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>Khám phá</Button>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Phần giới thiệu dịch vụ */}
            <div className="features-section" style={{ padding: '0 20px', marginBottom: '40px' }}>
                <Title level={2} style={{ marginBottom: '30px', textAlign: 'center' }}>Tại Sao Chọn Smart Hotel?</Title>
                <Row gutter={[32, 32]} justify="center">
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ textAlign: 'center' }}>
                            <SearchOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                            <Title level={4}>Tìm Kiếm Dễ Dàng</Title>
                            <Paragraph>Dễ dàng tìm kiếm và so sánh hàng ngàn khách sạn với các tiêu chí phù hợp</Paragraph>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ textAlign: 'center' }}>
                            <UserOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                            <Title level={4}>Đánh Giá Thực Tế</Title>
                            <Paragraph>Đọc đánh giá từ những khách hàng thực tế đã sử dụng dịch vụ</Paragraph>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ textAlign: 'center' }}>
                            <BankOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                            <Title level={4}>Giá Tốt Nhất</Title>
                            <Paragraph>Luôn đảm bảo giá tốt nhất với nhiều ưu đãi độc quyền</Paragraph>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* CSS tùy chỉnh cho trang */}
            <style jsx global>{`
                .homepage-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px 0;
                }
                .search-label {
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .search-container {
                    padding: 20px 0;
                }
                .guest-counter-container {
                    width: 300px;
                    padding: 10px;
                }
                .guest-counter-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                .guest-counter-item:last-child {
                    border-bottom: none;
                }
                .guest-counter-label {
                    font-weight: 500;
                }
                .guest-counter-sublabel {
                    font-size: 12px;
                    color: #888;
                    margin-top: 2px;
                }
                .guest-counter-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .guest-counter-value {
                    min-width: 24px;
                    text-align: center;
                    font-weight: 500;
                }
                .guest-counter-popover {
                    min-width: 320px;
                }
            `}</style>
        </div>
    )
}

export default HomePage;
