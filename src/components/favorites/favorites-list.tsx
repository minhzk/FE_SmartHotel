'use client';

import { useState, useEffect } from 'react';
import { 
  Row, Col, Typography, Card, Empty, Spin, 
  Breadcrumb, Button, Tabs, message, Alert
} from 'antd';
import { HomeOutlined, HeartOutlined } from '@ant-design/icons';
import { sendRequest } from '@/utils/api';
import Link from 'next/link';
import HotelCard from '@/components/hotels/hotel-card';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface FavoritesListProps {
  session: any;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ session }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/favorites`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });

      if (response?.data) {
        // Chuyển đổi dữ liệu để phù hợp với định dạng hotel
        const hotelsList = response.data.map((item: any) => ({
          ...item.hotel_id,
          _id: item.hotel_id._id
        }));
        setFavorites(hotelsList);
      }
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      setError(error?.message || 'Không thể tải danh sách yêu thích');
      message.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (hotelId: string) => {
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/favorites/${hotelId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      
      // Cập nhật danh sách sau khi xóa
      setFavorites(favorites.filter(hotel => hotel._id !== hotelId));
      message.success('Đã xóa khỏi danh sách yêu thích');
    } catch (error: any) {
      message.error(error?.message || 'Có lỗi xảy ra khi xóa khỏi yêu thích');
    }
  };

  return (
    <div className="favorites-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <Breadcrumb 
        items={[
          { title: <Link href="/"><HomeOutlined /></Link> },
          { title: 'Danh sách yêu thích' },
        ]}
        style={{ marginBottom: 16 }}
      />
      
      <div className="favorites-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <HeartOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          Khách sạn yêu thích
        </Title>
        <Text type="secondary">Danh sách khách sạn bạn đã đánh dấu yêu thích</Text>
      </div>
      
      {error && (
        <Alert 
          message="Lỗi tải dữ liệu" 
          description={error}
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }} 
        />
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : favorites.length > 0 ? (
        <div className="favorites-list">
          <Row gutter={[16, 16]}>
            {favorites.map((hotel) => (
              <Col xs={24} key={hotel._id}>
                <HotelCard 
                  hotel={hotel} 
                  session={session} 
                />
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Bạn chưa có khách sạn yêu thích nào"
          >
            <Button type="primary">
              <Link href="/hotels">Khám phá khách sạn ngay</Link>
            </Button>
          </Empty>
        </Card>
      )}

      <style jsx global>{`
        .favorites-header {
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default FavoritesList;
