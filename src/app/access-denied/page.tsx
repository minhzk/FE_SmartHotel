"use client";

import { Button, Result } from "antd";
import Link from "next/link";

const AccessDeniedPage = () => {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh' 
        }}>
            <Result
                status="403"
                title="403"
                subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
                extra={
                    <Link href="/">
                        <Button type="primary">
                            Trở về trang chủ
                        </Button>
                    </Link>
                }
            />
        </div>
    );
};

export default AccessDeniedPage;
