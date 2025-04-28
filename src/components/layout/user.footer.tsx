import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import Link from 'next/link';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ background: '#f0f2f5', padding: '40px 50px 24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8}>
          <Title level={4}>Smart Hotel</Title>
          <Text type="secondary">
            Hệ thống đặt phòng khách sạn thông minh với đa dạng lựa chọn,
            giá cả phải chăng và trải nghiệm đặt phòng thuận tiện.
          </Text>
        </Col>
        
        <Col xs={12} sm={6} md={4}>
          <Title level={5}>Dịch Vụ</Title>
          <Space direction="vertical">
            <Link href="/hotels">Khách sạn</Link>
            <Link href="/deals">Ưu đãi</Link>
            <Link href="/locations">Điểm đến</Link>
          </Space>
        </Col>
        
        <Col xs={12} sm={6} md={4}>
          <Title level={5}>Hỗ Trợ</Title>
          <Space direction="vertical">
            <Link href="/help">Trợ giúp</Link>
            <Link href="/contact">Liên hệ</Link>
            <Link href="/faq">Câu hỏi thường gặp</Link>
          </Space>
        </Col>
        
        <Col xs={12} sm={6} md={4}>
          <Title level={5}>Công Ty</Title>
          <Space direction="vertical">
            <Link href="/about">Về chúng tôi</Link>
            <Link href="/terms">Điều khoản</Link>
            <Link href="/privacy">Quyền riêng tư</Link>
          </Space>
        </Col>
        
        <Col xs={12} sm={6} md={4}>
          <Title level={5}>Theo Dõi</Title>
          <Space>
            <Link href="https://facebook.com">Facebook</Link>
            <Link href="https://twitter.com">Twitter</Link>
            <Link href="https://instagram.com">Instagram</Link>
          </Space>
        </Col>
      </Row>
      
      <Divider style={{ margin: '24px 0 16px' }} />
      
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary">
          © {new Date().getFullYear()} Smart Hotel. All Rights Reserved.
        </Text>
      </div>
    </AntFooter>
  );
};

export default Footer;
