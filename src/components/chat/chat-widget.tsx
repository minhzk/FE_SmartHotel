'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Spin, Tooltip, message } from 'antd';
import {
  CloseOutlined,
  SendOutlined,
  MessageOutlined,
  LikeOutlined,
  DislikeOutlined,
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { sendRequest } from '@/utils/api';
import ChatBubble from './chat-bubble';

interface ChatMessage {
  _id: string;
  message: string;
  sender_type: 'user' | 'bot';
  timestamp: Date;
  message_id: string;
}

interface ChatWidgetProps {
  hotelId?: string;
  startOpen?: boolean; // New prop to control initial state
  displayInline?: boolean; // New prop to display inline instead of floating
  enableHotelQueries?: boolean;
  enableRoomQueries?: boolean;
  enableBookingAssistance?: boolean;
  isGeneralMode?: boolean;
  systemContext?: string;
}

const LOCAL_STORAGE_SESSION_KEY = 'smarthotel_chat_session_id';

const ChatWidget: React.FC<ChatWidgetProps> = ({
  hotelId,
  startOpen = false, // Default to closed
  displayInline = false, // Default to floating widget
  enableHotelQueries = false,
  enableRoomQueries = false,
  enableBookingAssistance = false,
  isGeneralMode = false,
  systemContext,
}) => {
  const [isOpen, setIsOpen] = useState(startOpen);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Tự động cuộn xuống cuối cuộc trò chuyện khi có tin nhắn mới
  useEffect(() => {
    if (isOpen || displayInline) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, displayInline]);

  // Khôi phục session ID từ localStorage hoặc tạo mới khi component mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadChatHistory(storedSessionId);
    } else if (startOpen) {
      // If the widget should start open and we don't have a session, create one
      createChatSession();
    }
  }, []);

  // Hàm tạo phiên chat mới
  const createChatSession = async () => {
    try {
      setLoading(true);

      const data: any = {
        capabilities: {
          hotel_queries: enableHotelQueries || isGeneralMode,
          room_queries: enableRoomQueries || isGeneralMode,
          booking_assistance: enableBookingAssistance || isGeneralMode,
        },
      };

      if (hotelId) data.hotel_id = hotelId;
      if (isGeneralMode) data.mode = 'general';
      if (systemContext) data.system_context = systemContext;

      // Add user context if available
      if (session?.user) {
        data.user_info = {
          id: session.user._id,
          name: session.user.name,
          email: session.user.email,
        };
      }

      console.log('Creating chat session with data:', data); // Debug log

      const response = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chatbot/sessions`,
        method: 'POST',
        body: data,
        headers: session?.user?.access_token
          ? { Authorization: `Bearer ${session.user.access_token}` }
          : undefined,
      });

      if (response?.data) {
        const newSessionId = response.data.session.session_id;
        setSessionId(newSessionId);
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, newSessionId);

        // Thêm tin nhắn chào mừng
        setMessages([
          {
            _id: response.data.message._id,
            message: response.data.message.message,
            sender_type: 'bot',
            timestamp: new Date(response.data.message.timestamp),
            message_id: response.data.message.message_id,
          },
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi tạo phiên chat:', error);
      message.error('Không thể tạo phiên chat. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm tải lịch sử chat
  const loadChatHistory = async (sid: string) => {
    try {
      setLoading(true);

      const response = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chatbot/sessions/${sid}/messages`,
        method: 'GET',
        headers: session?.user?.access_token
          ? { Authorization: `Bearer ${session.user.access_token}` }
          : undefined,
      });

      if (response?.data?.messages) {
        setMessages(
          response.data.messages.map((msg: any) => ({
            _id: msg._id,
            message: msg.message,
            sender_type: msg.sender_type,
            timestamp: new Date(msg.timestamp),
            message_id: msg.message_id,
          }))
        );
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử chat:', error);
      // Nếu không tìm thấy phiên, tạo mới
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gửi tin nhắn - cập nhật để hỗ trợ nhận tin nhắn từ bên ngoài
  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || message;
    if (!textToSend.trim() || loading) return;

    // Nếu chưa có phiên chat, tạo mới
    if (!sessionId) {
      await createChatSession();
      return; // Sau khi tạo phiên, dừng lại và người dùng sẽ gửi lại tin nhắn
    }

    const tempId = uuidv4(); // ID tạm thời cho tin nhắn người dùng
    const userMessage = {
      _id: tempId,
      message: textToSend.trim(),
      sender_type: 'user' as const,
      timestamp: new Date(),
      message_id: tempId,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chatbot/messages`,
        method: 'POST',
        body: {
          session_id: sessionId,
          message: userMessage.message,
          is_general_mode: isGeneralMode,
          capabilities: {
            hotel_queries: enableHotelQueries || isGeneralMode,
            room_queries: enableRoomQueries || isGeneralMode,
            booking_assistance: enableBookingAssistance || isGeneralMode,
          },
        },
        headers: session?.user?.access_token
          ? { Authorization: `Bearer ${session.user.access_token}` }
          : undefined,
      });

      if (response?.data?.botMessage) {
        const botMsg = response.data.botMessage;
        setMessages((prev) => [
          ...prev,
          {
            _id: botMsg._id,
            message: botMsg.message,
            sender_type: 'bot',
            timestamp: new Date(botMsg.timestamp),
            message_id: botMsg.message_id,
          },
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      message.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm phản hồi về tin nhắn từ bot
  const sendFeedback = async (messageId: string, feedbackType: 'like' | 'dislike') => {
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chatbot/feedback`,
        method: 'POST',
        body: {
          messageId,
          sessionId,
          feedbackType,
          userId: session?.user?._id,
        },
      });

      message.success(
        feedbackType === 'like' ? 'Cảm ơn phản hồi tích cực của bạn!' : 'Cảm ơn phản hồi của bạn!'
      );
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
    }
  };

  // Đóng và kết thúc phiên chat
  const closeChat = async () => {
    if (sessionId) {
      try {
        await sendRequest({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chatbot/sessions/${sessionId}/close`,
          method: 'POST',
          headers: session?.user?.access_token
            ? { Authorization: `Bearer ${session.user.access_token}` }
            : undefined,
        });

        // Xóa sessionId khỏi localStorage và state
        localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
        setSessionId(null);
        setMessages([]);
      } catch (error) {
        console.error('Lỗi khi đóng phiên chat:', error);
      }
    }

    setIsOpen(false);
  };

  // Hàm mở chat widget
  const openChat = async () => {
    setIsOpen(true);
    if (!sessionId) {
      await createChatSession();
    }
  };

  return (
    <div className={`chat-widget-container ${displayInline ? 'inline' : ''}`}>
      {isOpen || displayInline ? (
        <div className="chat-widget">
          <div className="chat-header">
            <h3>Trợ lý Smart Hotel</h3>
            {!displayInline && (
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={closeChat}
                size="small"
              />
            )}
          </div>

          <div className="chat-messages">
            {loading && messages.length === 0 ? (
              <div className="chat-loading">
                <Spin tip="Đang kết nối..." />
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg._id} className="message-container">
                    <ChatBubble
                      message={msg.message.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                      isUser={msg.sender_type === 'user'}
                      timestamp={msg.timestamp}
                    />
                    {msg.sender_type === 'bot' && (
                      <div className="message-feedback">
                        <Tooltip title="Hữu ích">
                          <Button
                            type="text"
                            size="small"
                            icon={<LikeOutlined />}
                            onClick={() => sendFeedback(msg.message_id, 'like')}
                          />
                        </Tooltip>
                        <Tooltip title="Không hữu ích">
                          <Button
                            type="text"
                            size="small"
                            icon={<DislikeOutlined />}
                            onClick={() => sendFeedback(msg.message_id, 'dislike')}
                          />
                        </Tooltip>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="chat-input">
            <Input
              placeholder="Nhập tin nhắn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPressEnter={() => sendMessage()}
              disabled={loading && !sessionId}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => sendMessage()}
              disabled={loading && !sessionId}
            />
          </div>
        </div>
      ) : (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          className="chat-button"
          onClick={openChat}
        />
      )}

      <style jsx>{`
        .chat-widget-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
        }

        .chat-widget-container.inline {
          position: static;
          height: 100%;
          width: 100%;
        }

        .chat-widget-container.inline .chat-widget {
          height: 100%;
          width: 100%;
          box-shadow: none;
          border: 1px solid #eee;
        }

        .chat-button {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .chat-widget {
          width: 350px;
          height: 500px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        
        /* Thêm CSS để hiển thị xuống dòng và căn trái */
        :global(.chat-bubble .message-content) {
          white-space: pre-wrap;
          word-break: break-word;
          text-align: left;
          display: block;
        }
        
        /* Đảm bảo các phần tử trong bubble đều căn trái */
        :global(.chat-bubble) {
          text-align: left;
        }

        .chat-input {
          padding: 12px 16px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
        }

        .chat-input :global(input) {
          margin-right: 8px;
        }

        .chat-loading {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-container {
          position: relative;
        }

        .message-feedback {
          position: absolute;
          bottom: -5px;
          right: ${messages.length > 0 && messages[messages.length - 1].sender_type === 'bot' ? '0' : 'auto'};
          left: ${messages.length > 0 && messages[messages.length - 1].sender_type === 'user' ? '0' : 'auto'};
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;
