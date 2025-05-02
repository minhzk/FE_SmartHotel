import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
    const session = await auth();

    // Kiểm tra đường dẫn có bắt đầu bằng /dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        // Kiểm tra người dùng đã đăng nhập và có role ADMIN
        if (!session || session.user.role !== 'ADMIN') {
            // Redirect đến trang không có quyền hoặc trang đăng nhập
            const redirectUrl = new URL('/auth/login', request.url);
            redirectUrl.searchParams.set('callbackUrl', encodeURI(request.url));
            redirectUrl.searchParams.set('error', 'AccessDenied');
            return NextResponse.redirect(redirectUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Áp dụng middleware cho các routes sau:
        '/dashboard/:path*',
        // Các routes cần bảo vệ khác có thể thêm vào đây
    ],
};
