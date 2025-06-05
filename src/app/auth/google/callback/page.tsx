'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin } from 'antd';
import { signIn } from 'next-auth/react';

const GoogleCallbackPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh_token');

        if (token && refreshToken) {
            // Store tokens and redirect
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', refreshToken);
            
            // Trigger NextAuth session update
            signIn('credentials', {
                username: 'google_user',
                password: 'google_auth',
                redirect: false,
            }).then(() => {
                router.push('/');
            });
        } else {
            // Redirect to login if no tokens
            router.push('/auth/login?error=google_auth_failed');
        }
    }, [searchParams, router]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}>
            <Spin size="large" tip="Đang xử lý đăng nhập Google..." />
        </div>
    );
};

export default GoogleCallbackPage;
