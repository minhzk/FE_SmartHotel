'use client';

import { useState, useEffect } from 'react';
import { List, Typography, Button, Tag, Divider, Card, Empty, Spin, Dropdown, MenuProps, Alert, Checkbox } from 'antd';
import { BellOutlined, DeleteOutlined, CheckOutlined, FilterOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/contexts/notification.context';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;

export default function NotificationsPage() {
  const { data: session } = useSession({ required: true });
  const { 
    notifications, 
    loading, 
    fetchNotifications,
    loadMoreNotifications,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    // Lọc theo trạng thái đọc/chưa đọc
    if (filter === 'unread' && notification.read) {
      return false;
    }
    // Lọc theo loại thông báo
    if (selectedType && notification.type !== selectedType) {
      return false;
    }
    return true;
  });

  const getNotificationType = (type: string) => {
    switch (type) {
      case 'booking_created':
        return <Tag color="blue">Đặt phòng</Tag>;
      case 'booking_confirmed':
        return <Tag color="green">Xác nhận</Tag>;
      case 'booking_canceled':
        return <Tag color="red">Hủy</Tag>;
      case 'booking_expired':
        return <Tag color="volcano">Hết hạn</Tag>;
      case 'payment_received':
        return <Tag color="purple">Thanh toán</Tag>;
      case 'payment_refunded':
        return <Tag color="gold">Hoàn tiền</Tag>;
      case 'payment_due':
        return <Tag color="orange">Thanh toán</Tag>;
      case 'check_in_reminder':
        return <Tag color="cyan">Nhắc nhở</Tag>;
      case 'review_received':
        return <Tag color="geekblue">Đánh giá</Tag>;
      case 'system':
        return <Tag>Hệ thống</Tag>;
      default:
        return <Tag>Thông báo</Tag>;
    }
  };

  const notificationTypes = [
    { value: null, label: 'Tất cả' },
    { value: 'booking_created', label: 'Đặt phòng' },
    { value: 'booking_confirmed', label: 'Xác nhận' },
    { value: 'booking_canceled', label: 'Hủy' },
    { value: 'booking_expired', label: 'Hết hạn' },
    { value: 'payment_received', label: 'Thanh toán' },
    { value: 'payment_refunded', label: 'Hoàn tiền' },
    { value: 'payment_due', label: 'Thanh toán' },
    { value: 'check_in_reminder', label: 'Nhắc nhở' },
    { value: 'review_received', label: 'Đánh giá' },
    { value: 'system', label: 'Hệ thống' },
  ];

  const filterMenu: MenuProps = {
    items: notificationTypes.map((type) => ({
      key: type.value || 'all',
      label: (
        <div>
          {type.value && getNotificationType(type.value)}
          <span style={{ marginLeft: type.value ? 8 : 0 }}>{type.label}</span>
        </div>
      ),
    })),
    onClick: ({ key }) => setSelectedType(key === 'all' ? null : key),
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadMoreNotifications();
    setLoadingMore(false);
  };

  return (
    <div className="container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2}>
          <BellOutlined style={{ marginRight: 12 }} />
          Thông báo
        </Title>
        
        <div>
          <Dropdown menu={filterMenu} placement="bottomRight">
            <Button icon={<FilterOutlined />} style={{ marginRight: 8 }}>
              {selectedType ? `Lọc: ${notificationTypes.find(t => t.value === selectedType)?.label}` : 'Lọc'}
            </Button>
          </Dropdown>
          
          <Button 
            type={filter === 'unread' ? 'primary' : 'default'}
            onClick={() => setFilter(filter === 'unread' ? 'all' : 'unread')}
          >
            {filter === 'unread' ? 'Xem tất cả' : 'Chỉ xem chưa đọc'}
          </Button>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text>
            {filter === 'unread' ? 'Thông báo chưa đọc' : 'Tất cả thông báo'}
            {selectedType && ` - ${notificationTypes.find(t => t.value === selectedType)?.label}`}
          </Text>
          
          <div>
            <Button 
              type="text"
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        </div>
        
        <Spin spinning={loading}>
          {filteredNotifications.length > 0 ? (
            <>
              <List
                itemLayout="horizontal"
                dataSource={filteredNotifications}
                renderItem={(item) => (
                  <List.Item
                    key={item._id}
                    style={{
                      backgroundColor: item.read ? 'transparent' : 'rgba(24, 144, 255, 0.05)',
                      padding: '16px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                    actions={[
                      !item.read ? (
                        <Button 
                          key="mark-read"
                          type="text"
                          size="small"
                          onClick={() => markAsRead(item._id)}
                          icon={<CheckOutlined />}
                        >
                          Đánh dấu đã đọc
                        </Button>
                      ) : null,
                      <Button 
                        key="delete"
                        type="text"
                        danger
                        size="small"
                        onClick={() => deleteNotification(item._id)}
                        icon={<DeleteOutlined />}
                      >
                        Xóa
                      </Button>
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {getNotificationType(item.type)}
                          <span style={{ fontWeight: item.read ? 'normal' : 'bold' }}>
                            {item.title}
                          </span>
                        </div>
                      }
                      description={
                        <>
                          <div style={{ margin: '8px 0' }}>{item.message}</div>
                          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                            {dayjs(item.createdAt).fromNow()}
                            {item.read && item.read_at && (
                              <span style={{ marginLeft: 8 }}>
                                · Đã đọc {dayjs(item.read_at).fromNow()}
                              </span>
                            )}
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
              
              {/* Load More Button */}
              {filteredNotifications.length >= 20 && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Button 
                    type="default" 
                    loading={loadingMore}
                    onClick={handleLoadMore}
                  >
                    Tải thêm thông báo
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Empty 
              description={
                <Text type="secondary">
                  {filter === 'unread' 
                    ? 'Bạn không có thông báo chưa đọc nào' 
                    : 'Bạn không có thông báo nào'}
                </Text>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
}
