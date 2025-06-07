import { sendRequest } from '@/utils/api';

export interface GetUsersRequest {
    current?: number;
    pageSize?: number;
    name?: string;
    email?: string;
    role?: string;
    is_active?: string | boolean;
    phone?: string;
    address?: string;
    search?: string;
    sortBy?: string;
    [key: string]: any;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role?: string;
}

export interface UpdateUserRequest {
    _id: string;
    name?: string;
    phone?: string;
    address?: string;
    role?: string;
    is_active?: boolean;
}

export class UserService {
    private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    static async getUsers(
        params: GetUsersRequest,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/users`,
            method: 'GET',
            queryParams: params,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            nextOption: {
                next: { tags: ['list-users'] },
            },
        });
    }

    static async createUser(
        data: CreateUserRequest,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/users`,
            method: 'POST',
            body: data,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async updateUser(
        data: UpdateUserRequest,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/users`,
            method: 'PATCH',
            body: data,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async deleteUser(
        id: string,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/users/${id}`,
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async getUserById(
        id: string,
        accessToken: string
    ): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/users/${id}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    static async getCurrentUser(accessToken: string): Promise<IBackendRes<any>> {
        return await sendRequest<IBackendRes<any>>({
            url: `${this.baseUrl}/api/v1/users/me`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
    }
}
