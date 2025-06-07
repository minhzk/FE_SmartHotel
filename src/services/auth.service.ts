import { sendRequest } from '@/utils/api';

export interface RetryPasswordRequest {
    email: string;
}

export interface ChangePasswordRequest {
    code: string;
    password: string;
    confirmPassword: string;
    email: string;
}

export interface RetryActiveRequest {
    email: string;
}

export interface CheckCodeRequest {
    _id: string;
    code: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export class AuthService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async register(
        data: RegisterRequest
    ): Promise<IBackendRes<IRegister>> {
        return await sendRequest<IBackendRes<IRegister>>({
            url: `${this.baseUrl}/api/v1/auth/register`,
            method: 'POST',
            body: data,
        });
    }

    static async retryPassword(
        data: RetryPasswordRequest
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/auth/retry-password`,
            method: 'POST',
            body: data,
        });
    }

    static async changePassword(
        data: ChangePasswordRequest
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/auth/change-password`,
            method: 'POST',
            body: data,
        });
    }

    static async retryActive(
        data: RetryActiveRequest
    ): Promise<IBackendRes<IRegister>> {
        return await sendRequest<IBackendRes<IRegister>>({
            url: `${this.baseUrl}/api/v1/auth/retry-active`,
            method: 'POST',
            body: data,
        });
    }

    static async checkCode(data: CheckCodeRequest): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/auth/check-code`,
            method: 'POST',
            body: data,
        });
    }
}
