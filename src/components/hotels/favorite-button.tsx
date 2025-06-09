'use client';

import React, { useState, useEffect } from 'react';
import { Button, message, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { handleCheckFavoriteStatusAction, handleAddFavoriteAction, handleRemoveFavoriteAction } from '@/utils/actions';
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
      const result = await handleCheckFavoriteStatusAction(hotelId, session?.user?.access_token);
      
      if (result.success) {
        setIsFavorite(result.data);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!session) {
      message.info('Vui lòng đăng nhập để thêm khách sạn vào danh sách yêu thích');
      router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (isFavorite) {
        // Remove from favorites
        result = await handleRemoveFavoriteAction(hotelId, session?.user?.access_token);
        
        if (result.success) {
          message.success('Đã xóa khỏi danh sách yêu thích');
          setIsFavorite(false);
        } else {
          message.error(result.message || 'Có lỗi xảy ra khi xóa khỏi yêu thích');
        }
      } else {
        // Add to favorites
        result = await handleAddFavoriteAction(hotelId, session?.user?.access_token);
        
        if (result.success) {
          message.success('Đã thêm vào danh sách yêu thích');
          setIsFavorite(true);
        } else {
          message.error(result.message || 'Có lỗi xảy ra khi thêm vào yêu thích');
        }
      }
    } catch (error: any) {
      message.error('Có lỗi xảy ra khi cập nhật yêu thích');
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
