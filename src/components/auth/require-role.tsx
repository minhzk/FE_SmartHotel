"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";

interface RequireRoleProps {
    children: React.ReactNode;
    role: string;
}

const RequireRole = ({ children, role }: RequireRoleProps) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/login');
        } else if (session.user.role !== role) {
            router.push('/access-denied');
        }
    }, [session, status, router, role]);

    if (status === 'loading') {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
            </div>
        );
    }

    if (!session || session.user.role !== role) {
        return null;
    }

    return <>{children}</>;
};

export default RequireRole;
