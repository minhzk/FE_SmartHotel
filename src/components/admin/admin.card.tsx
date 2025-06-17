'use client'

import { Card, Col, Row, Typography, List } from "antd";
import { 
    HomeOutlined, 
    TeamOutlined, 
    BankOutlined, 
    BookOutlined, 
    DollarOutlined, 
    CommentOutlined, 
    MessageOutlined, 
    SettingOutlined,
    BarChartOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const adminFeatures = [
    {
        title: "Báo cáo và Thống kê",
        icon: <BarChartOutlined style={{ fontSize: 28, color: "#52c41a" }} />,
        description: "Xem báo cáo doanh thu, thống kê đặt phòng, biểu đồ phân tích.",
        link: "/dashboard/analytics"
    },
    {
        title: "Quản lý khách sạn",
        icon: <HomeOutlined style={{ fontSize: 28, color: "#1677ff" }} />,
        description: "Thêm, sửa, xóa khách sạn, cập nhật thông tin, hình ảnh, tiện nghi.",
        link: "/dashboard/hotels"
    },
    {
        title: "Quản lý người dùng",
        icon: <TeamOutlined style={{ fontSize: 28, color: "#52c41a" }} />,
        description: "Xem danh sách, phân quyền, khóa/mở tài khoản người dùng.",
        link: "/dashboard/user"
    },
    {
        title: "Quản lý phòng",
        icon: <BankOutlined style={{ fontSize: 28, color: "#faad14" }} />,
        description: "Quản lý các loại phòng, cấu hình, tiện ích, số lượng phòng.",
        link: "/dashboard/rooms"
    },
    {
        title: "Quản lý đặt phòng",
        icon: <BookOutlined style={{ fontSize: 28, color: "#eb2f96" }} />,
        description: "Xem, xác nhận, hủy, hoàn tiền các đơn đặt phòng.",
        link: "/dashboard/bookings"
    },
    {
        title: "Quản lý thanh toán",
        icon: <DollarOutlined style={{ fontSize: 28, color: "#722ed1" }} />,
        description: "Theo dõi giao dịch, hoàn tiền, kiểm tra trạng thái thanh toán.",
        link: "/dashboard/payments"
    },
    {
        title: "Quản lý đánh giá",
        icon: <CommentOutlined style={{ fontSize: 28, color: "#13c2c2" }} />,
        description: "Xem, duyệt, phản hồi đánh giá khách hàng và cảm xúc AI.",
        link: "/dashboard/reviews"
    },
    {
        title: "Quản lý chat hỗ trợ",
        icon: <MessageOutlined style={{ fontSize: 28, color: "#f5222d" }} />,
        description: "Xem lịch sử chat, hỗ trợ khách hàng trực tuyến.",
        link: "/dashboard/chats"
    },
    {
        title: "Cài đặt hệ thống",
        icon: <SettingOutlined style={{ fontSize: 28, color: "#b37feb" }} />,
        description: "Cấu hình chung, giao diện, thông báo, phân quyền.",
        link: "/dashboard/settings"
    }
];

const AdminCard = () => {
    return (
        <div style={{ padding: 24 }}>
            <Title level={2} style={{ marginBottom: 8 }}>Chào mừng đến trang quản trị Smart Hotel</Title>
            <Paragraph style={{ marginBottom: 32 }}>
                Bạn có thể quản lý toàn bộ hệ thống khách sạn, phòng, người dùng, đặt phòng, thanh toán, đánh giá, chat hỗ trợ và cài đặt hệ thống tại đây.
            </Paragraph>
            <Row gutter={[24, 24]}>
                {adminFeatures.map((feature, idx) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                        <a href={feature.link} style={{ textDecoration: 'none' }}>
                            <Card
                                hoverable
                                style={{ height: 180, borderRadius: 10 }}
                                bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120 }}
                            >
                                <div style={{ marginBottom: 12 }}>{feature.icon}</div>
                                <Title level={5} style={{ margin: 0, textAlign: 'center' }}>{feature.title}</Title>
                                <Paragraph style={{ fontSize: 13, color: '#666', textAlign: 'center', margin: 0 }}>{feature.description}</Paragraph>
                            </Card>
                        </a>
                    </Col>
                ))}
            </Row>
        </div>
    )
}

export default AdminCard;
