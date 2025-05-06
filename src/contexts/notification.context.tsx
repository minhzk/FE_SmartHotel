'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { sendRequest } from '@/utils/api';
import { message } from 'antd';

interface NotificationType {
  _id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  read_at?: Date;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: NotificationType[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Kết nối socket khi user đăng nhập
  useEffect(() => {
    if (!session?.user?.access_token) return;
    
    const socketInstance = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
      auth: {
        token: `Bearer ${session.user.access_token}`
      }
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
    });

    socketInstance.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      message.info({
        content: notification.message,
        duration: 5
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.access_token]);

  // Fetch notifications & unread count
  useEffect(() => {
    if (session?.user?.access_token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [session?.user?.access_token]);

  const fetchNotifications = async () => {
    if (!session?.user?.access_token) return;
    
    setLoading(true);
    try {
      const res = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications`,
        method: 'GET',
        queryParams: { current: 1, pageSize: 20 },
        headers: {
          'Authorization': `Bearer ${session.user.access_token}`
        }
      });
      
      if (res?.data?.results) {
        setNotifications(res.data.results);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!session?.user?.access_token) return;
    
    try {
      const res = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/unread-count`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.user.access_token}`
        }
      });
      
      if (res?.data?.count !== undefined) {
        setUnreadCount(res.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!session?.user?.access_token) return;
    
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/${id}/mark-read`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.user.access_token}`
        }
      });
      
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id ? { ...notification, read: true, read_at: new Date() } : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!session?.user?.access_token) return;
    
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/mark-all-read`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.user.access_token}`
        }
      });
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true, read_at: new Date() }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!session?.user?.access_token) return;
    
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/${id}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.user.access_token}`
        }
      });
      
      setNotifications(prev => prev.filter(notification => notification._id !== id));
      
      // Cập nhật số lượng unread nếu xóa 1 notification chưa đọc
      const deletedNotification = notifications.find(n => n._id === id);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
