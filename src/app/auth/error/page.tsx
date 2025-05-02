"use client";

import { Button, Result } from "antd";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ErrorPage = () => {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    let errorTitle = "Đã xảy ra lỗi";
    let errorDescription = "Đã có lỗi xảy ra trong quá trình xác thực.";

    if (error === "AccessDenied") {
        errorTitle = "Không có quyền truy cập";
        errorDescription = "Bạn không có quyền truy cập vào trang này.";
    } else if (error === "Verification") {
        errorTitle = "Lỗi xác thực";
        errorDescription = "Liên kết xác thực không hợp lệ hoặc đã hết hạn.";
    }

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh' 
        }}>
            <Result
                status={error === "AccessDenied" ? "403" : "error"}
                title={errorTitle}
                subTitle={errorDescription}
                extra={[
                    <Link href="/auth/login" key="login">
                        <Button type="primary">
                            Đăng nhập
                        </Button>
                    </Link>,
                    <Link href="/" key="home">
                        <Button>Trang chủ</Button>
                    </Link>,
                ]}
            />
        </div>
    );
};

export default ErrorPage;
