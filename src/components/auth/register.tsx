'use client';
import React from 'react';
import { Button, Col, Divider, Form, Input, notification, Row } from 'antd';
import { ArrowLeftOutlined, GoogleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AuthService } from '@/services/auth.service';

const Register = () => {
    const router = useRouter()
    
    const onFinish = async (values: any) => {
        const { email, password, name } = values;
        
        try {
            const res = await AuthService.register({ email, password, name });
            
            console.log(">>> check res: ", res);
            if (res?.data) {
                router.push(`/verify/${res?.data?._id}`);
            } else {
                notification.error({
                    message: 'Register error',
                    description: res?.message
                });
            }
        } catch (error) {
            notification.error({
                message: 'Network error',
                description: 'Có lỗi xảy ra khi đăng ký tài khoản'
            });
        }
    };

    const handleGoogleRegister = async () => {
        try {
            await signIn('google', { 
                callbackUrl: '/',
                redirect: true 
            });
        } catch (error) {
            notification.error({
                message: "Đăng ký Google thất bại",
                description: "Có lỗi xảy ra khi đăng ký bằng Google"
            });
        }
    };

    return (
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
                    <legend>Đăng Ký Tài Khoản</legend>
                    <Form
                        name="basic"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            label="Email"
                            name="email"
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
                            label="Name" 
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your name!',
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
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider>Hoặc</Divider>
                    
                    <Button
                        icon={<GoogleOutlined />}
                        onClick={handleGoogleRegister}
                        style={{
                            width: '100%',
                            marginBottom: '16px',
                            borderColor: '#db4437',
                            color: '#db4437'
                        }}
                    >
                        Đăng ký bằng Google
                    </Button>

                    <Link href={'/'}>
                        <ArrowLeftOutlined /> Quay lại trang chủ
                    </Link>
                    <Divider />
                    <div style={{ textAlign: 'center' }}>
                        Đã có tài khoản?{' '}
                        <Link href={'/auth/login'}>Đăng nhập</Link>
                    </div>
                </fieldset>
            </Col>
        </Row>
    );
};

export default Register;
