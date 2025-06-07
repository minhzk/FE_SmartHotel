'use client';

import { useHasMounted } from '@/utils/customHook';
import { Button, Form, Input, Modal, notification, Steps } from 'antd';
import {
    SmileOutlined,
    SolutionOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { AuthService } from '@/services/auth.service';

const ModalReactive = (props: any) => {
    const { isModalOpen, setIsModalOpen, userEmail } = props;
    const [current, setCurrent] = useState(0);
    const [userId, setUserId] = useState("");

    const hasMounted = useHasMounted();
    if (!hasMounted) return <></>;

    const onFinishStep0 = async (values: any) => {
        const { email } = values;
        
        try {
            const res = await AuthService.retryActive({ email });

            if (res?.data) {
                setUserId(res?.data?._id);
                setCurrent(1);
            } else {
                notification.error({
                    message: 'Resend code error',
                    description: res?.message
                });
            }
        } catch (error) {
            notification.error({
                message: 'Network error',
                description: 'Có lỗi xảy ra khi gửi lại mã kích hoạt'
            });
        }
    }

    const onFinishStep1 = async (values: any) => {
        const { code } = values;
        
        try {
            const res = await AuthService.checkCode({
                _id: userId,
                code
            });

            if (res?.data) {
                setCurrent(2);
            } else {
                notification.error({
                    message: 'Account active error',
                    description: res?.message
                });
            }
        } catch (error) {
            notification.error({
                message: 'Network error',
                description: 'Có lỗi xảy ra khi kích hoạt tài khoản'
            });
        }
    }
    return (
        <>
            <Modal
                title={
                    <div style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold" }}>
                        Activate Account
                    </div>
                }
                open={isModalOpen}
                onOk={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
                maskClosable={false}
                footer={null}
                // centered={true}
            >
                <Steps
                    current={current}
                    items={[
                        {
                            title: 'Login',
                            icon: <UserOutlined />,
                        },
                        {
                            title: 'Verification',
                            icon: <SolutionOutlined />,
                        },
                        {
                            title: 'Done',
                            icon: <SmileOutlined />,
                        },
                    ]}
                />
                {current === 0 &&
                <>
                    <div style={{ margin: "20px 0" }}>
                        <p>Your account is currently not activated.</p>
                    </div>
                    <Form
                        name="verify"
                        onFinish={onFinishStep0}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            label=""
                            name="email"
                            initialValue={userEmail}
                        >
                            <Input disabled />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Resend
                            </Button>
                        </Form.Item>
                    </Form>
                </>
                }
                {current === 1 &&
                <>
                    <div style={{ margin: "20px 0" }}>
                        <p>Please enter the verification code.</p>
                    </div>
                    <Form
                        name="verify2"
                        onFinish={onFinishStep1}
                        autoComplete="off"
                        layout="vertical"
                    >
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
                                Active
                            </Button>
                        </Form.Item>
                    </Form>
                </>
                }
                {
                    current === 2 &&
                    <div style={{ margin: "20px 0" }}>
                        <p>Your account has been successfully activated. Please log in again.</p>
                    </div>
                }
            </Modal>
        </>
    );
};

export default ModalReactive;
