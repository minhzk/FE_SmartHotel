'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Alert, Steps } from 'antd';
import { LockOutlined, MailOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { sendRequest } from '@/utils/api';

interface ChangePasswordFormProps {
  session: any;
  email: string;
}

const ChangePasswordForm = ({ session, email }: ChangePasswordFormProps) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  
  // Request verification code - sử dụng API retry-password có sẵn
  const requestCode = async () => {
    try {
      setLoading(true);
      
      const response = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/retry-password`,
        method: 'POST',
        body: {
            email
        }
      });
      
      if (response?.data) {
        message.success('Mã xác nhận đã được gửi đến email của bạn!');
        setCurrentStep(1);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi mã xác nhận');
    } finally {
      setLoading(false);
    }
  };
  
  // Change password with verification code - sử dụng API change-password có sẵn
  const handleChangePassword = async (values: any) => {
    try {
      setLoading(true);
      
      const response = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/change-password`,
        method: 'POST',
        body: {
          email,
          code: values.code,
          password: values.password,
          confirmPassword: values.confirmPassword,
        },
      });
      
      if (response?.data) {
        message.success('Mật khẩu đã được thay đổi thành công!');
        setCurrentStep(2);
        form.resetFields();
      } else {
        message.error('Mã code không chính xác hoặc đã hết hạn!');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form để bắt đầu lại
  const resetForm = () => {
    form.resetFields();
    setCurrentStep(0);
    setVerificationCode('');
  };
  
  return (
    <div className="change-password-container">
      <Steps
        current={currentStep}
        items={[
          {
            title: 'Yêu cầu mã',
            description: 'Gửi mã xác nhận',
            icon: <MailOutlined />,
          },
          {
            title: 'Đổi mật khẩu',
            description: 'Nhập mã và mật khẩu mới',
            icon: <LockOutlined />,
          },
          {
            title: 'Hoàn tất',
            description: 'Đổi mật khẩu thành công',
            icon: <CheckCircleOutlined />,
          },
        ]}
        style={{ marginBottom: 24 }}
      />
      
      {currentStep === 0 && (
        <div className="step-container">
          <Alert
            message="Yêu cầu mã xác nhận để đổi mật khẩu"
            description={`Chúng tôi sẽ gửi một mã xác nhận đến email ${email} của bạn. Mã này sẽ được dùng để xác thực việc đổi mật khẩu.`}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              onClick={requestCode}
              loading={loading}
              size="large"
            >
              Gửi mã xác nhận
            </Button>
          </div>
        </div>
      )}
      
      {currentStep === 1 && (
        <div className="step-container">
          <Alert
            message="Mã xác nhận đã được gửi"
            description="Vui lòng kiểm tra email của bạn và nhập mã xác nhận cùng với mật khẩu mới bên dưới."
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="code"
              label="Mã xác nhận"
              rules={[
                { required: true, message: 'Vui lòng nhập mã xác nhận!' },
              ]}
            >
              <Input placeholder="Nhập mã xác nhận" />
            </Form.Item>
            
            <Form.Item
              name="password"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu mới" />
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 0 }}>
              <div className="form-actions">
                <Button onClick={resetForm} style={{ marginRight: 8 }}>
                  Quay lại
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Đổi mật khẩu
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      )}
      
      {currentStep === 2 && (
        <div className="step-container text-center">
          <Alert
            message="Đổi mật khẩu thành công!"
            description="Mật khẩu của bạn đã được thay đổi. Vui lòng sử dụng mật khẩu mới trong lần đăng nhập tiếp theo."
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Button type="primary" onClick={resetForm}>
            Hoàn thành
          </Button>
        </div>
      )}
      
      <style jsx global>{`
        .change-password-container {
          padding: 20px 0;
        }
        
        .step-container {
          padding: 16px 0;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .text-center {
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ChangePasswordForm;
