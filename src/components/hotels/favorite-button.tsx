'use client';

import React, { useState, useEffect } from 'react';
import { Button, message, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { sendRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  hotelId: string;
  session: any;
  size?: 'large' | 'middle' | 'small';
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
  style?: React.CSSProperties;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  hotelId,
  session,
  size = 'middle',
  tooltipPlacement = 'top',
  style = {},
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.access_token) {
      checkFavoriteStatus();
    }
  }, [hotelId, session]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/favorites/check/${hotelId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });

      setIsFavorite(response.data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!session) {
      message.info('Vui lòng đăng nhập để thêm khách sạn vào danh sách yêu thích');
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await sendRequest({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/favorites/${hotelId}`,
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });
        message.success('Đã xóa khỏi danh sách yêu thích');
        setIsFavorite(false);
      } else {
        // Add to favorites
        await sendRequest({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/favorites`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          body: { hotel_id: hotelId },
        });
        message.success('Đã thêm vào danh sách yêu thích');
        setIsFavorite(true);
      }
    } catch (error: any) {
      message.error(error?.message || 'Có lỗi xảy ra khi cập nhật yêu thích');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip 
      title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'} 
      placement={tooltipPlacement}
    >
      <Button 
        type="default" 
        icon={isFavorite ? <HeartFilled style={{ color: isFavorite ? '#ff4d4f' : undefined }} /> : <HeartOutlined />} 
        onClick={toggleFavorite}
        loading={loading}
        size={size}
        danger={isFavorite}
        shape="circle"
        style={{ 
          ...style, 
          backgroundColor: isFavorite ? 'white' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          lineHeight: 1,
          borderColor: isFavorite ? '#ff4d4f' : undefined
        }}
        className="favorite-button"
      />
      <style jsx global>{`
        .favorite-button.ant-btn:hover {
          color: #ff4d4f !important;
          border-color: #ff4d4f !important;
        }
        
        .favorite-button.ant-btn:focus {
          color: #ff4d4f !important;
          border-color: #ff4d4f !important;
        }
      `}</style>
    </Tooltip>
  );
};

export default FavoriteButton;
