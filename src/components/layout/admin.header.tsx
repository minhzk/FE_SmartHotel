'use client';
import { AdminContext } from '@/library/admin.context';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, Layout, Dropdown, Space, Avatar } from 'antd';
import { useContext } from 'react';
import { signOut } from "next-auth/react";
import Link from 'next/link';

const AdminHeader = (props: any) => {
    const {session} = props;
    const { Header } = Layout;
    const { collapseMenu, setCollapseMenu } = useContext(AdminContext)!;

    const items = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link href="/profile">Thông tin cá nhân</Link>,
        },
        {
            key: 'divider',
            type: 'divider',
        },
        {
            key: 'logout',
            danger: true,
            icon: <LogoutOutlined />,
            label: <span onClick={() => signOut({ callbackUrl: '/auth/login' })}>Đăng xuất</span>,
        },
    ];

    return (
        <>
            <Header
                style={{
                    padding: 0,
                    display: 'flex',
                    background: '#f5f5f5',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Button
                    type="text"
                    icon={collapseMenu ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapseMenu(!collapseMenu)}
                    style={{
                        fontSize: '16px',
                        width: 64,
                        height: 64,
                    }}
                />
                
                <Dropdown menu={{ items }} trigger={['click']}>
                    <a
                        onClick={(e) => e.preventDefault()}
                        style={{
                            color: 'unset',
                            display: 'flex',
                            alignItems: 'center',
                            marginRight: 20,
                        }}
                    >
                        <Space>
                            <Avatar 
                                size="default" 
                                src={session?.user?.avatar}
                                style={{ 
                                    backgroundColor: session?.user?.avatar ? 'transparent' : '#1890ff',
                                }}
                                icon={!session?.user?.avatar && <UserOutlined />}
                            />
                            <span>
                                {session?.user?.name || session?.user?.email || "Admin"}
                            </span>
                        </Space>
                    </a>
                </Dropdown>
            </Header>
        </>
    );
};

export default AdminHeader;
