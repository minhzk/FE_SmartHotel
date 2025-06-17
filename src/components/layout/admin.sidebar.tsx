'use client'
import Layout from "antd/es/layout";
import Menu from "antd/es/menu";
import React, { useContext } from 'react';
import { AdminContext } from "@/library/admin.context";
import type { MenuProps } from 'antd';
import Link from 'next/link'

import {
    AppstoreOutlined,
    TeamOutlined,
    HomeOutlined,
    BankOutlined,
    CommentOutlined,
    DollarOutlined,
    BookOutlined,
    SettingOutlined,
    MessageOutlined,
} from '@ant-design/icons';
type MenuItem = Required<MenuProps>['items'][number];

const AdminSideBar = () => {
    const { Sider } = Layout;
    const { collapseMenu } = useContext(AdminContext)!;

    const items: MenuItem[] = [
        {
            key: 'grp',
            label: 'Smart Hotel',
            type: 'group',
            children: [
                {
                    key: "dashboard",
                    label: <Link href={"/dashboard"}>Tổng quan</Link>,
                    icon: <AppstoreOutlined />,
                },
                {
                    key: "analytics",
                    label: <Link href={"/dashboard/analytics"}>Báo cáo và Thống kê</Link>,
                    icon: <TeamOutlined />,
                },
                {
                    key: "users",
                    label: <Link href={"/dashboard/user"}>Quản lý người dùng</Link>,
                    icon: <TeamOutlined />,
                },
                {
                    key: "hotels",
                    label: <Link href={"/dashboard/hotels"}>Quản lý khách sạn</Link>,
                    icon: <HomeOutlined />,
                },
                {
                    key: "rooms",
                    label: <Link href={"/dashboard/rooms"}>Quản lý phòng</Link>,
                    icon: <BankOutlined />,
                },
                {
                    key: "bookings",
                    label: <Link href={"/dashboard/bookings"}>Quản lý đặt phòng</Link>,
                    icon: <BookOutlined />,
                },
                {
                    key: "payments",
                    label: <Link href={"/dashboard/payments"}>Quản lý thanh toán</Link>,
                    icon: <DollarOutlined />,
                },
                {
                    key: "reviews",
                    label: <Link href={"/dashboard/reviews"}>Quản lý đánh giá</Link>,
                    icon: <CommentOutlined />,
                },
                {
                    key: "chats",
                    label: <Link href={"/dashboard/chats"}>Quản lý chat</Link>,
                    icon: <MessageOutlined />,
                },
                {
                    type: 'divider',
                },
                {
                    key: 'settings',
                    label: 'Cài đặt hệ thống',
                    icon: <SettingOutlined />,
                    children: [
                        { 
                            key: 'general', 
                            label: <Link href={"/dashboard/settings/general"}>Cài đặt chung</Link>
                        },
                        { 
                            key: 'appearance', 
                            label: <Link href={"/dashboard/settings/appearance"}>Giao diện</Link>
                        },
                    ],
                },
            ],
        },
    ];

    return (
        <Sider
            collapsed={collapseMenu}
        >
                <div className="demo-logo-vertical" />
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['dashboard']}
                    items={items}
                    style={{ height: '100vh' }}
                />
            </Sider>
    )
}

export default AdminSideBar