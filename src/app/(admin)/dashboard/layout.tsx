import React from 'react';
import AdminFooter from '@/components/layout/admin.footer';
import AdminHeader from '@/components/layout/admin.header';
import AdminSideBar from '@/components/layout/admin.sidebar';
import AdminContent from '@/components/layout/admin.content';
import { AdminContextProvider } from '@/library/admin.context';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RequireRole from '@/components/auth/require-role';

const AdminLayout = async({
    children,
  }: Readonly<{
    children: React.ReactNode;
}>) => {
    // Lấy session từ auth
    const session = await auth()
    
    // Kiểm tra quyền ở server-side
    if (!session) {
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        return redirect('/auth/login?callbackUrl=/dashboard');
    }
    
    // Kiểm tra role
    if (session?.user?.role !== 'ADMIN') {
        // Nếu không phải ADMIN, chuyển hướng đến trang từ chối quyền
        return redirect('/access-denied');
    }

    return (
        <AdminContextProvider>
            <div style={{ display: "flex" }}>
                <div className='left-side' style={{ minWidth: 80 }}>
                    <AdminSideBar />
                </div>
                <div className='right-side' style={{ flex: 1 }}>
                    <AdminHeader session={session} />
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