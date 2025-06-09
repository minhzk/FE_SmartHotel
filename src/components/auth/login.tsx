'use client';
import { Button, Col, Divider, Form, Input, notification, Row } from 'antd';
import { ArrowLeftOutlined, GoogleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { authenticate } from '@/utils/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import ModalReactive from './modal.reactive';
import { useState } from 'react';
import ModalChangePassword from './modal.change.password';
import { signIn } from 'next-auth/react';

const Login = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [userEmail, setUserEmail] = useState("")
    const [changePassword, setChangePassword] = useState(false);

    const onFinish = async (values: any) => {
        const { username, password } = values
        setUserEmail("")
        // trigger sign-in
        const res = await authenticate(username, password)
        if (res?.error) {
            // error
            if(res?.code === 2) {
                setIsModalOpen(true)
                setUserEmail(username)
                return
            }
            // Map code lỗi sang thông báo tiếng Việt
            const errorMessages: Record<number, string> = {
                1: "Email hoặc mật khẩu không đúng.",
                2: "Tài khoản của bạn chưa được kích hoạt.",
                0: "Có lỗi xảy ra. Vui lòng thử lại.",
            };
            notification.error({
                message: "Đăng nhập thất bại",
                description: errorMessages[res.code] || res.error
            })
        } else {
            // Force a full page reload to ensure session is available
            window.location.href = callbackUrl
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signIn('google', { 
                callbackUrl: callbackUrl,
                redirect: true 
            });
        } catch (error) {
            notification.error({
                message: "Đăng nhập Google thất bại",
                description: "Có lỗi xảy ra khi đăng nhập bằng Google"
            });
        }
    };

    return (
        <>
            <Row justify={'center'} style={{ marginTop: '30px' }}>
                <Col xs={24} md={16} lg={8}>
                    <fieldset
                        style={{
                            padding: '15px',
                            margin: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                        }}
                    >
                        <legend>Đăng Nhập</legend>
                        <Form
                            name="basic"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout="vertical"
                        >
                            <Form.Item
                                label="Email"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your email!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <Button type="primary" htmlType="submit">
                                        Login
                                    </Button>
                                    <Button type='link' onClick={() => setChangePassword(true)}>Forgot password ?</Button>
                                </div>
                            </Form.Item>
                        </Form>

                        <Divider>Hoặc</Divider>
                        
                        <Button
                            icon={<GoogleOutlined />}
                            onClick={handleGoogleLogin}
                            style={{
                                width: '100%',
                                marginBottom: '16px',
                                borderColor: '#db4437',
                                color: '#db4437'
                            }}
                        >
                            Đăng nhập bằng Google
                        </Button>

                        <Link href={'/'}>
                            <ArrowLeftOutlined /> Return to home page
                        </Link>
                        <Divider />
                        <div style={{ textAlign: 'center' }}>
                            Don't have an account?{' '}
                            <Link href={'/auth/register'}>Register here</Link>
                        </div>
                    </fieldset>
                </Col>
            </Row>
            <ModalReactive
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                userEmail={userEmail}
            />
            <ModalChangePassword
                isModalOpen={changePassword}
                setIsModalOpen={setChangePassword}
            />
        </>
    );
};

export default Login;
