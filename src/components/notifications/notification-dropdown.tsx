'use client';

import { useState, useEffect } from 'react';
import { Dropdown, Badge, Button, List, Typography, Empty, Divider, Tag, Spin, Tooltip } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNotifications } from '@/contexts/notification.context';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import Link from 'next/link';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title } = Typography;

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  
  const [open, setOpen] = useState(false);

  const handleOpenChange = (flag: boolean) => {
    setOpen(flag);
    if (flag) {
      // Reload thông báo khi mở dropdown
      fetchNotifications();
    }
  };

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
      case 'review_reminder':
        return <Tag color="lime">Nhắc đánh giá</Tag>;
      case 'payment_received':
        return <Tag color="purple">Thanh toán</Tag>;
      case 'payment_refunded':
        return <Tag color="purple">Hoàn tiền</Tag>;
      case 'payment_due':
        return <Tag color="orange">Nhắc thanh toán</Tag>;
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

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  const content = (
    <div style={{ 
      width: 360, 
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 6px 16px -8px rgba(0,0,0,0.08), 0 9px 28px 0 rgba(0,0,0,0.05), 0 12px 48px 16px rgba(0,0,0,0.03)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Title level={5} style={{ margin: 0 }}>Thông báo</Title>
        {unreadCount > 0 && (
          <Button 
            type="link" 
            size="small" 
            onClick={() => markAllAsRead()}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      
      <div style={{ 
        maxHeight: 350, 
        overflow: 'auto',
        padding: '0 8px'
      }}>
        <Spin spinning={loading}>
          {notifications.length > 0 ? (
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  key={item._id}
                  style={{
                    backgroundColor: item.read ? 'transparent' : 'rgba(24, 144, 255, 0.05)',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    margin: '0 4px',
                    borderRadius: '4px',
                  }}
                  className="notification-item-hover"
                  onClick={() => handleNotificationClick(item._id)}
                >
                  <div style={{ width: '100%' }}>
                    {/* Dòng 1: Title và tag */}
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      {getNotificationType(item.type)}
                      <span style={{ 
                        fontWeight: !item.read ? 'bold' : 'normal',
                        flex: 1
                      }}>
                        {item.title}
                      </span>
                    </div>

                    {/* Dòng 2: Description và action buttons */}
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      {/* Description */}
                      <div style={{ flex: '1' }}>
                        <div>{item.message}</div>
                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#8c8c8c' }}>
                          {dayjs(item.createdAt).fromNow()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ 
                        display: 'flex',
                        marginLeft: '12px',
                        gap: '4px'
                      }}>
                        {!item.read && (
                          <Button 
                            type="text"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item._id);
                            }}
                          />
                        )}
                        <Button 
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(item._id);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Empty 
              description="Không có thông báo nào" 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              style={{ padding: '20px 0' }}
            />
          )}
        </Spin>
      </div>
      
      {notifications.length > 0 && (
        <div style={{ 
          borderTop: '1px solid #f0f0f0', 
          padding: '16px 20px',
          textAlign: 'center',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          backgroundColor: '#fff'
        }}>
          <Link href="/notifications" style={{ fontSize: '14px' }}>
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
  
  return (
    <>
      <Dropdown
        open={open}
        onOpenChange={handleOpenChange}
        dropdownRender={() => content}
        placement="bottomRight"
        trigger={['click']}
        arrow={{ pointAtCenter: true }}
      >
        <Badge count={unreadCount} size="small">
          <Button 
            type="text" 
            icon={<BellOutlined style={{ fontSize: '18px' }} />} 
            size="large"
            shape="circle"
            style={{ background: open ? 'rgba(0,0,0,0.04)' : 'transparent' }}
          />
        </Badge>
      </Dropdown>
      
      <style jsx global>{`
        .notification-item-hover:hover {
          background-color: rgba(0, 0, 0, 0.02) !important;
        }
      `}</style>
    </>
  );
};

export default NotificationDropdown;
