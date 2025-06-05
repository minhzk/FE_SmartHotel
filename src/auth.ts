import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import {
    InactiveAccountError,
    InvalidEmailPasswordError,
} from './utils/errors';
import { sendRequest } from './utils/api';
import { IUser } from './types/next-auth';
import { jwtDecode } from 'jwt-decode';

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    debug: process.env.NODE_ENV === 'development', // Enable debug logging
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            credentials: {
                username: {},
                password: {},
            },
            authorize: async (credentials) => {
                const res = await sendRequest<IBackendRes<ILogin>>({
                    method: 'POST',
                    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`,
                    body: {
                        username: credentials.username,
                        password: credentials.password,
                    },
                });

                if (res.statusCode === 201) {
                    // Decode JWT để lấy thời gian hết hạn
                    const decodedToken = res.data?.access_token
                        ? jwtDecode(res.data.access_token)
                        : null;

                    return {
                        _id: res.data?.user?._id,
                        name: res.data?.user?.name,
                        email: res.data?.user?.email,
                        role: res.data?.user?.role, // Thêm role vào token
                        access_token: res.data?.access_token,
                        refresh_token: res.data?.refresh_token, // Lưu refresh_token
                        expires_at: decodedToken?.exp
                            ? new Date(decodedToken.exp * 1000)
                            : null,
                    };
                } else if (+res.statusCode === 401) {
                    throw new InvalidEmailPasswordError();
                } else if (+res.statusCode === 400) {
                    throw new InactiveAccountError();
                } else {
                    throw new Error('Internal server error');
                }
            },
        }),
    ],
    pages: {
        signIn: '/auth/login',
        error: '/auth/error', // Add custom error page
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                try {
                    console.log('Google sign-in attempt:', { user, profile });

                    // Send user data to your backend
                    const res = await sendRequest<IBackendRes<any>>({
                        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google/signin`,
                        method: 'POST',
                        body: {
                            email: profile?.email || user.email,
                            name: profile?.name || user.name,
                            firstName: profile?.given_name,
                            lastName: profile?.family_name,
                            image: profile?.picture || user.image,
                            googleId: profile?.sub || user.id, // Use profile.sub if available
                        },
                    });

                    console.log('Backend response:', res);

                    if (res?.data && res.statusCode === 201) {
                        // Store backend tokens
                        user.access_token = res.data.access_token;
                        user.refresh_token = res.data.refresh_token;
                        user.role = res.data.user.role;
                        user._id = res.data.user._id;
                        return true;
                    } else {
                        console.error('Backend sign-in failed:', res);
                        return false;
                    }
                } catch (error) {
                    console.error('Google sign-in error:', error);
                    return false;
                }
            }
            return true;
        },

        async jwt({ token, user, trigger, session }) {
            if (user) {
                // Thêm các thông tin cần thiết vào token khi đăng nhập
                token.user = user as IUser;
                token.expires_at = (user as any).expires_at;
                token.refresh_token = (user as any).refresh_token;
            }

            // Kiểm tra nếu token sắp hết hạn (ví dụ: còn 5 phút)
            const shouldRefresh =
                token.expires_at &&
                new Date(token.expires_at).getTime() - Date.now() <
                    5 * 60 * 1000;

            // Refresh token khi sắp hết hạn
            if (shouldRefresh && token.refresh_token) {
                try {
                    const response = await sendRequest<
                        IBackendRes<{
                            access_token: string;
                            refresh_token: string;
                        }>
                    >({
                        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`,
                        method: 'POST',
                        body: { refresh_token: token.refresh_token },
                    });

                    if (response.data) {
                        // Cập nhật token mới
                        const decodedToken = jwtDecode(
                            response.data.access_token
                        );

                        token.user.access_token = response.data.access_token;
                        token.refresh_token = response.data.refresh_token;
                        token.expires_at = decodedToken.exp
                            ? new Date(decodedToken.exp * 1000)
                            : undefined;
                    } else {
                        // Nếu BE trả về lỗi (ví dụ refresh token hết hạn), response.data sẽ không có
                        return { ...token, error: 'RefreshTokenError' };
                    }
                } catch (error) {
                    console.error('Failed to refresh token:', error);
                    // Token refresh thất bại, về login
                    return { ...token, error: 'RefreshTokenError' };
                }
            }

            return token;
        },

        async session({ session, token }) {
            // Truyền thông tin từ token sang session
            (session.user as IUser) = token.user;

            // Thêm thông tin refresh token vào session
            session.error = token.error;
            session.expires_at = token.expires_at;

            return session;
        },

        authorized: async ({ auth }) => {
            // Kiểm tra xem có lỗi refresh token không
            if (auth?.error === 'RefreshTokenError') {
                return false;
            }
            return !!auth;
        },
    },
});
