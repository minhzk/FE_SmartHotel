'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Timeline, Typography, Spin, Tag, Badge, Card, Divider } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { ChatService } from '@/services/chat.service';

const { Title, Text, Paragraph } = Typography;

interface Message {
  _id: string;
  message_id: string;
  session_id: string;
  sender_type: string;
  message: string;
  intent?: string;
  timestamp: string;
}

interface ChatSession {
  _id: string;
  session_id: string;
  user_id: string;
  status: string;
  start_time: string;
  end_time?: string;
  context: any;
}

interface ChatDetailProps {
  session: ChatSession;
  visible: boolean;
  onClose: () => void;
}

const ChatDetail: React.FC<ChatDetailProps> = ({ session, visible, onClose }) => {
  const { data: authSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (visible && session.session_id) {
      fetchMessages();
    }
  }, [visible, session.session_id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      const response = await ChatService.getSessionMessages(
        session.session_id,
        authSession?.user?.access_token!
      );
      
      if (response?.data?.messages) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Lỗi khi tải tin nhắn:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContext = () => {
    if (!session.context || Object.keys(session.context).length === 0) {
      return <Text type="secondary">Không có thông tin bối cảnh</Text>;
    }

    return (
      <div>
        {Object.entries(session.context).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <Text strong>{key}:</Text>{' '}
            <Text>{JSON.stringify(value)}</Text>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      title={`Chi tiết phiên chat #${session.session_id.substring(0, 8)}...`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Thông tin phiên</Title>
          <div>
            <Text strong>Trạng thái:</Text>{' '}
            <Tag color={session.status === 'active' ? 'green' : 'default'}>
              {session.status === 'active' ? (
                <>
                  <Badge status="processing" /> Đang hoạt động
                </>
              ) : (
                'Đã kết thúc'
              )}
            </Tag>
          </div>
          <div>
            <Text strong>Người dùng:</Text>{' '}
            <Text>{session.user_id || 'Khách vãng lai'}</Text>
          </div>
          <div>
            <Text strong>Bắt đầu:</Text>{' '}
            <Text>{new Date(session.start_time).toLocaleString('vi-VN')}</Text>
          </div>
          {session.end_time && (
            <div>
              <Text strong>Kết thúc:</Text>{' '}
              <Text>{new Date(session.end_time).toLocaleString('vi-VN')}</Text>
            </div>
          )}
        </div>

        <Divider />
        
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Bối cảnh phiên</Title>
          {renderContext()}
        </div>

        <Divider />
        
        <Title level={5}>Lịch sử trò chuyện</Title>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin tip="Đang tải..." />
          </div>
        ) : (
          <Timeline mode="left">
            {messages.map((msg) => (
              <Timeline.Item
                key={msg._id}
                dot={
                  msg.sender_type === 'user' ? (
                    <UserOutlined style={{ fontSize: '16px' }} />
                  ) : (
                    <RobotOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                  )
                }
                color={msg.sender_type === 'user' ? 'blue' : 'green'}
                label={new Date(msg.timestamp).toLocaleString('vi-VN')}
              >
                <Card size="small" bordered style={{ marginBottom: 8 }}>
                  <Paragraph>{msg.message}</Paragraph>
                  {msg.intent && (
                    <div>
                      <Text type="secondary">Intent: </Text>
                      <Tag color="purple">{msg.intent}</Tag>
                    </div>
                  )}
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Card>
    </Modal>
  );
};

export default ChatDetail;
