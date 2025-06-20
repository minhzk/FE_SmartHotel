'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, Dropdown, Button, Avatar, Badge, Space, Divider } from 'antd';
import { 
  UserOutlined, 
  HeartOutlined, 
  OrderedListOutlined, 
  StarOutlined, 
  LogoutOutlined, 
  HomeOutlined,
  LoginOutlined,
  UserAddOutlined,
  DashboardOutlined,
  BellOutlined,
  MessageOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import NotificationDropdown from '../notifications/notification-dropdown'; // Import component mới

const { Header } = Layout;

interface UserHeaderProps {
  session: any;
}

const UserHeader = ({ session }: UserHeaderProps) => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bắt đăng nhập lại nếu refresh token lỗi
  useEffect(() => {
    if (session?.error === 'RefreshTokenError') {
      signOut({ callbackUrl: '/auth/login' });
    }
  }, [session]);

  // Menu items cho người dùng đã đăng nhập
  const generateUserMenuItems = () => {
    const menuItems = [
      {
        key: 'account',
        label: (
          <div className="user-dropdown-header">
            <strong>TÀI KHOẢN CỦA TÔI</strong>
          </div>
        ),
        type: 'group',
        children: [
          {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link href="/profile">Thông tin cá nhân</Link>,
          },
          {
            key: 'bookings',
            icon: <OrderedListOutlined />,
            label: <Link href="/bookings">Đơn đặt phòng</Link>,
          },
          {
            key: 'notifications',
            icon: <BellOutlined />,
            label: <Link href="/notifications">Thông báo</Link>, // Thay đổi link
          },
          {
            key: 'favorites',
            icon: <HeartOutlined />,
            label: <Link href="/favorites">Danh sách yêu thích</Link>,
          },
          {
            key: 'reviews',
            icon: <StarOutlined />,
            label: <Link href="/reviews">Đánh giá của tôi</Link>,
          },
        ],
      },
    ];

    // Thêm tùy chọn quản trị nếu người dùng là admin
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'admin') {
      menuItems.push({
        key: 'admin',
        type: 'group',
        label: (
          <div className="user-dropdown-header">
            <strong>QUẢN TRỊ HỆ THỐNG</strong>
          </div>
        ),
        children: [
          {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link href="/dashboard">Bảng điều khiển</Link>,
          }
        ]
      });
    }

    // Thêm các tùy chọn còn lại
    menuItems.push(
      {
        key: 'divider',
        type: 'divider',
      },
      {
        key: 'logout',
        danger: true,
        icon: <LogoutOutlined />,
        label: <span onClick={() => signOut({ callbackUrl: '/auth/login' })}>Đăng xuất</span>,
      }
    );

    return menuItems;
  };

  const mainNavItems = [
    {
      key: 'hotels',
      label: <Link href="/hotels">Khách sạn</Link>,
    },
    {
      key: 'policy',
      label: <Link href="/policy">Chính sách</Link>,
    },
    {
      key: 'about',
      label: <Link href="/about">Về chúng tôi</Link>,
    }

  ];

  return (
    <Header
      className={`user-header ${scrolled ? 'scrolled' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%', // Đảm bảo width là 100% để fit với container cha
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px', // Giảm padding để không bị tràn
        background: scrolled ? 'white' : 'transparent',
        boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.3s',
      }}
    >
      <div className="logo-container" style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="logo" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
            <HomeOutlined /> Smart Hotel
          </div>
        </Link>
        <Menu 
          mode="horizontal" 
          selectedKeys={[pathname === '/' ? 'home' : pathname.split('/')[1]]}
          style={{ 
            background: 'transparent', 
            borderBottom: 'none', 
            marginLeft: 40,
            minWidth: 400
          }}
          items={mainNavItems}
        />
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {session?.user ? (
          // Hiển thị khi người dùng đã đăng nhập
          <>
            {/* Thay thế Badge và Button cũ bằng NotificationDropdown */}
            <NotificationDropdown />

            <Link href="/chat">
              <Button 
                type="text" 
                icon={<MessageOutlined style={{ fontSize: '18px' }} />} 
                size="large"
                shape="circle"
                title="Trợ lý chat AI"
              />
            </Link>

            <Dropdown menu={{ items: generateUserMenuItems() }} trigger={['click']} arrow>
              <a onClick={(e) => e.preventDefault()} className="user-dropdown-link">
                <Space>
                  <Avatar 
                    size="default" 
                    src={session?.user?.avatar} 
                    style={{ 
                      backgroundColor: session?.user?.avatar ? 'transparent' : '#1890ff',
                      cursor: 'pointer'
                    }}
                    icon={!session?.user?.avatar && <UserOutlined />}
                  />
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session?.user?.name || session?.user?.email || 'Tài khoản'}
                  </span>
                </Space>
              </a>
            </Dropdown>
          </>
        ) : (
          // Hiển thị khi chưa đăng nhập
          <Space>
            <Link href="/auth/login">
              <Button type="text" icon={<LoginOutlined />}>Đăng nhập</Button>
            </Link>
            <Link href="/auth/register">
              <Button type="primary" icon={<UserAddOutlined />}>Đăng ký</Button>
            </Link>
          </Space>
        )}
      </div>

      <style jsx global>{`
        .user-header {
          width: 100% !important;
          box-sizing: border-box;
          backdrop-filter: blur(5px);
        }
        
        .user-header.scrolled {
          backdrop-filter: none;
        }
        
        .user-header .ant-menu-horizontal > .ant-menu-item::after,
        .user-header .ant-menu-horizontal > .ant-menu-submenu::after {
          border-bottom: none !important;
        }
        
        .user-header .ant-menu-horizontal > .ant-menu-item-selected {
          color: #1890ff;
          font-weight: 500;
        }
        
        .user-dropdown-header {
          padding: 8px 16px;
          color: #666;
        }
        
        .user-dropdown-link {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.3s;
        }
        
        .user-dropdown-link:hover {
          background-color: rgba(0,0,0,0.04);
        }
      `}</style>
    </Header>
  );
};

export default UserHeader;
