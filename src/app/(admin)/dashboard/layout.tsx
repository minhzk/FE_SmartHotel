'use client';

import React from 'react';
import AdminFooter from '@/components/layout/admin.footer';
import UserHeader from '@/components/layout/user.header';
import AdminSideBar from '@/components/layout/admin.sidebar';
import AdminContent from '@/components/layout/admin.content';
import { AdminContextProvider } from '@/library/admin.context';
import { useSession } from 'next-auth/react';
import RequireRole from '@/components/auth/require-role';
import { Spin } from 'antd';

const AdminLayout = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
}>) => {
    // Use next-auth's useSession hook instead of calling auth() directly
    const { data: session, status } = useSession();

    // Show loading while session is being determined
    if (status === 'loading') {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <AdminContextProvider>
            <div style={{ display: "flex" }}>
                <div className='left-side' style={{ minWidth: 80 }}>
                    <AdminSideBar />
                </div>
                <div className='right-side' style={{ flex: 1 }}>
                    <UserHeader session={session} />
                    <AdminContent>
                        {/* Kiểm tra thêm một lần nữa ở client-side để bảo vệ kỹ lưỡng hơn */}
                        <RequireRole role="ADMIN">
                            {children}
                        </RequireRole>
                    </AdminContent>
                    <AdminFooter />
                </div>
            </div>
        </AdminContextProvider>
    )
}

export default AdminLayout