'use client';
import React from 'react';
import { Button, Col, Divider, Form, Input, message, notification, Row } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

const Verify = (props: any) => {
    const {id} = props;
    const router = useRouter()
    
    const onFinish = async (values: any) => {
        const {_id, code} = values
        
        try {
            const res = await AuthService.checkCode({ _id, code });
            
            console.log(">>> check res: ", res)
            if (res?.data) {
                message.success("Account activated")
                router.push(`/auth/login`)
            } else {
                notification.error({
                    message: 'Verify error',
                    description: res?.message
                })
            }
        } catch (error) {
            notification.error({
                message: 'Network error',
                description: 'Có lỗi xảy ra khi xác thực tài khoản'
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
                    <legend>Activate Account</legend>
                    <Form
                        name="basic"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            label="Id"
                            name="_id"
                            initialValue={id}
                            hidden
                        >
                            <Input disabled/>
                        </Form.Item>
                        <div>
                            Mã code đã được gửi tới email đăng ký, vui lòng kiểm tra email!
                        </div>
                        <Divider/>
                        <Form.Item 
                            label="Code" 
                            name="code"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your code!',
                                },
                        ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
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

export default Verify;
