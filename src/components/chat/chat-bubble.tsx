import React from 'react';
import { Avatar, Typography } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser, timestamp }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-bubble ${isUser ? 'user' : 'bot'}`}>
      <div className="chat-avatar">
        <Avatar icon={isUser ? <UserOutlined /> : <RobotOutlined />} 
                style={{ backgroundColor: isUser ? '#1890ff' : '#52c41a' }} />
      </div>
      <div className="chat-content">
        <div className="chat-message">{message}</div>
        {timestamp && (
          <div className="chat-time">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatTime(timestamp)}
            </Text>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .chat-bubble {
          display: flex;
          margin-bottom: 16px;
          flex-direction: ${isUser ? 'row-reverse' : 'row'};
        }
        
        .chat-avatar {
          margin: ${isUser ? '0 0 0 12px' : '0 12px 0 0'};
        }
        
        .chat-content {
          max-width: 80%;
        }
        
        .chat-message {
          padding: 10px 14px;
          background-color: ${isUser ? '#e6f7ff' : '#f6ffed'};
          border-radius: 12px;
          border: 1px solid ${isUser ? '#91d5ff' : '#b7eb8f'};
        }
        
        .chat-time {
          margin-top: 4px;
          text-align: ${isUser ? 'right' : 'left'};
        }
      `}</style>
    </div>
  );
};

export default ChatBubble;
