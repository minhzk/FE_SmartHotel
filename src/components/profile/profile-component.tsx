'use client';

import { useState, useEffect } from 'react';
import { Tabs, Card, Typography, Spin, Avatar } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { sendRequest } from '@/utils/api';
import UserInfoForm from './user-info-form';
import ChangePasswordForm from './change-password-form';

const { Title } = Typography;

interface IProfileComponentProps {
  session: any;
}

const ProfileComponent = ({ session }: IProfileComponentProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Hàm fetch thông tin người dùng từ API
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/me`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      
      if (response?.data) {
        setUserProfile(response.data);
      } else {
        // Fallback to session data
        setUserProfile({
          _id: session.user._id,
          email: session.user.email,
          name: session.user.name || '',
          phone: session.user.phone || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Fallback to session data
      setUserProfile({
        _id: session.user._id,
        email: session.user.email,
        name: session.user.name || '',
        phone: session.user.phone || '',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load thông tin người dùng khi component mount
  useEffect(() => {
    fetchUserProfile();
  }, [session]);
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Đang tải thông tin cá nhân...</p>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <Avatar 
          size={100} 
          icon={<UserOutlined />} 
          src={userProfile?.avatar} 
        />
        <Title level={2} style={{ margin: '16px 0 0' }}>
          {userProfile?.name || 'Người dùng'}
        </Title>
        <Typography.Text>{userProfile?.email}</Typography.Text>
      </div>
      
      <Card bordered={false} className="profile-card">
        <Tabs
          defaultActiveKey="info"
          items={[
            {
              key: 'info',
              label: (
                <span>
                  <UserOutlined />
                  Thông tin cá nhân
                </span>
              ),
              children: (
                <UserInfoForm
                  userProfile={userProfile}
                  session={session}
                  onProfileUpdated={fetchUserProfile}
                />
              ),
            },
            {
              key: 'password',
              label: (
                <span>
                  <LockOutlined />
                  Đổi mật khẩu
                </span>
              ),
              children: (
                <ChangePasswordForm 
                  session={session}
                  email={userProfile?.email || ''}
                />
              ),
            },
          ]}
        />
      </Card>
      
      <style jsx global>{`
        .profile-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .profile-card {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default ProfileComponent;
