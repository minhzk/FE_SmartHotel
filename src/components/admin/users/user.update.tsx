import { handleUpdateUserAction } from '@/utils/actions';
import {
    Modal, Input, Form, Row, Col, message,
    notification, Switch, Select, InputNumber
} from 'antd';
import { useEffect } from 'react';

interface IProps {
    isUpdateModalOpen: boolean;
    setIsUpdateModalOpen: (v: boolean) => void;
    dataUpdate: any;
    setDataUpdate: any;
    onSuccess?: () => void;
}

const UserUpdate = (props: IProps) => {
    const {
        isUpdateModalOpen, setIsUpdateModalOpen,
        dataUpdate, setDataUpdate, onSuccess
    } = props;

    const [form] = Form.useForm();

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                name: dataUpdate.name,
                email: dataUpdate.email,
                phone: dataUpdate.phone,
                role: dataUpdate.role,
                isActive: dataUpdate.isActive,
                account_balance: dataUpdate.account_balance || 0
            });
        }
    }, [dataUpdate]);

    const handleCloseUpdateModal = () => {
        form.resetFields();
        setIsUpdateModalOpen(false);
        setDataUpdate(null);
    }

    const onFinish = async (values: any) => {
        if (dataUpdate) {
            try {
                const { name, phone, role, isActive, account_balance } = values;
                const res = await handleUpdateUserAction({
                    _id: dataUpdate._id, name, phone, role, isActive, account_balance
                });
                
                if (res?.data) {
                    handleCloseUpdateModal();
                    message.success("Cập nhật người dùng thành công");
                    if (onSuccess) onSuccess();
                } else {
                    notification.error({
                        message: "Lỗi cập nhật người dùng",
                        description: res?.message
                    });
                }
            } catch (error: any) {
                notification.error({
                    message: "Lỗi cập nhật người dùng",
                    description: error.response?.data?.message || "Đã xảy ra lỗi"
                });
            }
        }
    };

    return (
        <Modal
            title="Cập nhật người dùng"
            open={isUpdateModalOpen}
            onOk={() => form.submit()}
            onCancel={() => handleCloseUpdateModal()}
            maskClosable={false}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form
                name="update-user"
                onFinish={onFinish}
                layout="vertical"
                form={form}
            >
                <Row gutter={[15, 15]}>
                    <Col span={24}>
                        <Form.Item
                            label="Email"
                            name="email"
                        >
                            <Input type='email' disabled />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            label="Họ tên"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    
                    <Col span={24}>
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Vai trò"
                            name="role"
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                        >
                            <Select
                                options={[
                                    { value: 'USER', label: 'Người dùng' },
                                    { value: 'ADMIN', label: 'Quản trị viên' }
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Trạng thái"
                            name="isActive"
                            valuePropName="checked"
                        >
                            <Switch 
                                checkedChildren="Hoạt động" 
                                unCheckedChildren="Không hoạt động" 
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            label="Số dư tài khoản (VNĐ)"
                            name="account_balance"
                        >
                            <InputNumber 
                                style={{ width: '100%' }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                min={0}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default UserUpdate;
