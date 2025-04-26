'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Descriptions, Typography } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { sendRequest } from '@/utils/api';
import { useSession } from 'next-auth/react';

const { Text } = Typography;

interface UserInfoFormProps {
  userProfile: any;
  session: any;
  onProfileUpdated: () => Promise<void>;
}

const UserInfoForm = ({ userProfile, session, onProfileUpdated }: UserInfoFormProps) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { update } = useSession();
  
  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      const response = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: 'PATCH',
        body: {
            _id: userProfile._id,
            name: values.name,
            phone: values.phone,
        },
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      
      if (response?.data) {
        // Cập nhật session (nếu cần)
        await update({
          ...session,
          user: {
            ...session.user,
            name: values.name,
            phone: values.phone
          }
        });
        
        // Thông báo component cha để fetch lại dữ liệu
        await onProfileUpdated();
        
        message.success('Thông tin cá nhân đã được cập nhật thành công!');
        setIsEditing(false);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      console.error('Update profile error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const startEditing = () => {
    form.setFieldsValue({
      name: userProfile.name,
      phone: userProfile.phone,
    });
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
  };

  return (
    <div className="user-info-container">
      {isEditing ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: userProfile.name,
            phone: userProfile.phone,
          }}
        >
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>
          
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          
          <div className="form-actions">
            <Button
              icon={<CloseOutlined />}
              onClick={cancelEditing}
              style={{ marginRight: 8 }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              htmlType="submit"
              loading={isSubmitting}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      ) : (
        <div>
          <Descriptions
            bordered
            column={1}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Thông tin chi tiết</span>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={startEditing}
                >
                  Chỉnh sửa
                </Button>
              </div>
            }
          >
            <Descriptions.Item label="Email">
              {userProfile.email}
              <Text type="secondary" style={{ marginLeft: 8 }}>
                (Không thể thay đổi)
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên">{userProfile.name || 'Chưa cập nhật'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{userProfile.phone || 'Chưa cập nhật'}</Descriptions.Item>
          </Descriptions>
        </div>
      )}
      
      <style jsx global>{`
        .user-info-container {
          padding: 20px 0;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default UserInfoForm;
