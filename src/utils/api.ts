import queryString from 'query-string';
import { auth, signOut } from '@/auth';

// Hàm xử lý khi response cho thấy token hết hạn
export const handleTokenExpiration = async (response: any) => {
    // Nếu API trả về lỗi 401 với mã TOKEN_EXPIRED
    if (response.status === 401 && response.data?.code === 'TOKEN_EXPIRED') {
        // Kiểm tra session hiện tại
        const session = await auth();

        if (!session || !session.user) {
            // Chuyển hướng về trang đăng nhập nếu không có session
            signOut({ redirectTo: '/auth/login' });
            return null;
        }

        // Nếu có error trong session, cần đăng nhập lại
        if (session.error === 'RefreshTokenError') {
            signOut({ redirectTo: '/auth/login' });
            return null;
        }

        // Session có thông tin mới sau khi refresh token tự động
        // Thử lại request với token mới
        const retryResponse = await fetch(response.url, {
            ...response.config,
            headers: {
                ...response.config.headers,
                Authorization: `Bearer ${session.user.access_token}`,
            },
        });

        return retryResponse;
    }

    return response;
};

export const sendRequest = async <T>(props: IRequest) => {
    //type
    let {
        url,
        method,
        body,
        queryParams = {},
        useCredentials = false,
        headers = {},
        nextOption = {},
    } = props;

    const options: any = {
        method: method,
        // by default setting the content-type to be json type
        headers: new Headers({
            'content-type': 'application/json',
            ...headers,
        }),
        body: body ? JSON.stringify(body) : null,
        ...nextOption,
    };
    if (useCredentials) options.credentials = 'include';

    if (queryParams) {
        url = `${url}?${queryString.stringify(queryParams)}`;
    }

    const response = await fetch(url, options);

    // Xử lý token hết hạn
    const processedResponse = await handleTokenExpiration(response);

    if (!processedResponse) {
        throw new Error('Authentication required');
    }

    if (processedResponse.ok) {
        return processedResponse.json() as T; //generic
    } else {
        return processedResponse.json().then(function (json: Record<string, any>) {
            // to be able to access error status when you catch the error
            return {
            statusCode: processedResponse.status,
            message: json?.message ?? '',
            error: json?.error ?? '',
            } as T;
        });
    }
};

export const sendRequestFile = async <T>(props: IRequest) => {
    //type
    let {
        url,
        method,
        body,
        queryParams = {},
        useCredentials = false,
        headers = {},
        nextOption = {},
    } = props;

    const options: any = {
        method: method,
        // by default setting the content-type to be json type
        headers: new Headers({ ...headers }),
        body: body ? body : null,
        ...nextOption,
    };
    if (useCredentials) options.credentials = 'include';

    if (queryParams) {
        url = `${url}?${queryString.stringify(queryParams)}`;
    }

    const response = await fetch(url, options);

    // Xử lý token hết hạn
    const processedResponse = await handleTokenExpiration(response);

    if (!processedResponse) {
        throw new Error('Authentication required');
    }

    if (processedResponse.ok) {
        return processedResponse.json() as T; //generic
    } else {
        return processedResponse.json().then(function (json: Record<string, any>) {
            // to be able to access error status when you catch the error
            return {
            statusCode: processedResponse.status,
            message: json?.message ?? '',
            error: json?.error ?? '',
            } as T;
        });
    }
};
