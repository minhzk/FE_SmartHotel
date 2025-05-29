'use client';

import React, { useState } from 'react';
import { Table, Card, Button, Tooltip, Modal, Badge, Tag, Space } from 'antd';
import { EyeOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { sendRequest } from '@/utils/api';
import ChatDetail from './chat-detail';

interface ChatSession {
  _id: string;
  session_id: string;
  user_id: string;
  status: string;
  start_time: string;
  end_time?: string;
  context: any;
}

interface ChatManagementProps {
  chatSessions: ChatSession[];
}

const ChatManagement: React.FC<ChatManagementProps> = ({ chatSessions }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const columns = [
    {
      title: 'ID phiên',
      dataIndex: 'session_id',
      key: 'session_id',
      render: (text: string) => <span>{text.substring(0, 8)}...</span>,
    },
    {
      title: 'Người dùng',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userId: string) => <span>{userId || 'Khách'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? (
            <>
              <Badge status="processing" color="green" /> Đang hoạt động
            </>
          ) : (
            <>
              <CheckCircleOutlined /> Đã kết thúc
            </>
          )}
        </Tag>
      ),
      filters: [
        { text: 'Đang hoạt động', value: 'active' },
        { text: 'Đã kết thúc', value: 'closed' },
      ],
      onFilter: (value: boolean | React.Key, record: ChatSession) => record.status === value,
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (time: string) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {new Date(time).toLocaleString('vi-VN')}
        </span>
      ),
      sorter: (a: ChatSession, b: ChatSession) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'end_time',
      key: 'end_time',
      render: (time?: string) =>
        time ? (
          <span>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {new Date(time).toLocaleString('vi-VN')}
          </span>
        ) : (
          <span>-</span>
        ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: ChatSession) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => viewSessionDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const viewSessionDetail = (session: ChatSession) => {
    setSelectedSession(session);
    setIsDetailModalVisible(true);
  };

  return (
    <>
      <Card title="Quản lý phiên chat">
        <Table
          columns={columns}
          dataSource={chatSessions}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {selectedSession && (
        <ChatDetail
          session={selectedSession}
          visible={isDetailModalVisible}
          onClose={() => setIsDetailModalVisible(false)}
        />
      )}
    </>
  );
};

export default ChatManagement;
