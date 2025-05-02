import { handleCreateUserAction } from '@/utils/actions';
import {
    Modal, Input, Form, Row, Col, message,
    notification, Select, Switch
} from 'antd';

interface IProps {
    isCreateModalOpen: boolean;
    setIsCreateModalOpen: (v: boolean) => void;
    onSuccess?: () => void;
}

const UserCreate = (props: IProps) => {
    const {
        isCreateModalOpen, setIsCreateModalOpen, onSuccess
    } = props;

    const [form] = Form.useForm();

    const handleCloseCreateModal = () => {
        form.resetFields()
        setIsCreateModalOpen(false);
    }

    const onFinish = async (values: any) => {
        try {
            const res = await handleCreateUserAction(values);
            if (res?.data) {
                handleCloseCreateModal();
                message.success("Thêm người dùng thành công!");
                if (onSuccess) onSuccess();
            } else {
                notification.error({
                    message: "Lỗi thêm người dùng",
                    description: res?.message
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi thêm người dùng",
                description: error.response?.data?.message || "Đã xảy ra lỗi"
            });
        }
    };

    return (
        <Modal
            title="Thêm người dùng mới"
            open={isCreateModalOpen}
            onOk={() => form.submit()}
            onCancel={() => handleCloseCreateModal()}
            maskClosable={false}
            okText="Thêm"
            cancelText="Hủy"
        >
            <Form
                name="create-user"
                onFinish={onFinish}
                layout="vertical"
                form={form}
                initialValues={{
                    role: 'USER',
                    isActive: true
                }}
            >
                <Row gutter={[15, 15]}>
                    <Col span={24} >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input type='email' />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    </Col>
                    <Col span={24} >
                        <Form.Item
                            label="Họ tên"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={24} >
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
                </Row>
            </Form>
        </Modal>
    )
}

export default UserCreate;
