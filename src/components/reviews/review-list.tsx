'use client';

import React, { useState, useEffect } from 'react';
import { Card, Rate, Typography, Empty, Spin, Button, Modal, Form, Input, message, Tag, Pagination, DatePicker, Space, Select } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Session } from 'next-auth';
import { sendRequest } from '@/utils/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReviewListProps {
  session: Session | null;
}

interface Review {
  _id: string;
  review_id: string;
  hotel_id: {
    _id: string;
    name: string;
    address: string;
  };
  rating: number;
  review_text: string;
  sentiment_label?: string;
  response?: {
    response_text: string;
    response_date: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ session }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [sentimentFilter, setSentimentFilter] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('');

  useEffect(() => {
    if (session?.user?.access_token) {
      fetchReviews();
    }
  }, [session, dateRange, sentimentFilter, ratingFilter]);

  const fetchReviews = async (page = 1, pageSize = 10) => {
    if (!session?.user?.access_token) return;

    setLoading(true);
    try {
      let queryParams: any = { 
        current: page, 
        pageSize 
      };

      // Thêm filter theo ngày nếu có
      if (dateRange[0] && dateRange[1]) {
        queryParams.dateRange = `${dateRange[0].format('YYYY-MM-DD')},${dateRange[1].format('YYYY-MM-DD')}`;
      }

      // Thêm filter theo sentiment
      if (sentimentFilter) {
        queryParams.sentiment_label = sentimentFilter;
      }

      // Thêm filter theo rating
      if (ratingFilter) {
        queryParams.rating = ratingFilter;
      }

      const response = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/user`,
        method: 'GET',
        queryParams,
        headers: {
          Authorization: `Bearer ${session.user.access_token}`,
        },
      });

      if (response?.data) {
        setReviews(response.data.results || []);
        setPagination({
          current: response.data.meta?.current || page,
          pageSize: response.data.meta?.pageSize || pageSize,
          total: response.data.meta?.total || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: Review) => {
    setSelectedReview(review);
    form.setFieldsValue({
      rating: review.rating,
      review_text: review.review_text,
    });
    setEditModalVisible(true);
  };

  const handleDelete = (review: Review) => {
    setSelectedReview(review);
    setDeleteModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedReview || !session?.user?.access_token) return;

    try {
      const values = await form.validateFields();
      
      await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews`,
        method: 'PATCH',
        body: {
          _id: selectedReview._id,
          ...values,
        },
        headers: {
          Authorization: `Bearer ${session.user.access_token}`,
        },
      });

      message.success('Cập nhật đánh giá thành công');
      setEditModalVisible(false);
      fetchReviews(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error updating review:', error);
      message.error('Không thể cập nhật đánh giá');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReview || !session?.user?.access_token) return;

    try {
      await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reviews/${selectedReview._id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.user.access_token}`,
        },
      });

      message.success('Xóa đánh giá thành công');
      setDeleteModalVisible(false);
      fetchReviews(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error deleting review:', error);
      message.error('Không thể xóa đánh giá');
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'Rất tích cực': return 'green';
      case 'Tích cực': return 'cyan';
      case 'Trung lập': return 'blue';
      case 'Tiêu cực': return 'orange';
      case 'Rất tiêu cực': return 'red';
      default: return 'default';
    }
  };

  const getSentimentText = (sentiment?: string) => {
    switch (sentiment) {
      case 'Rất tích cực': return 'Rất tích cực';
      case 'Tích cực': return 'Tích cực';
      case 'Trung lập': return 'Trung lập';
      case 'Tiêu cực': return 'Tiêu cực';
      case 'Rất tiêu cực': return 'Rất tiêu cực';
      default: return 'Chưa phân tích';
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              placeholder={['Từ ngày', 'Đến ngày']}
              format="DD/MM/YYYY"
            />
            <Select
              placeholder="Chọn cảm xúc"
              value={sentimentFilter || undefined}
              onChange={setSentimentFilter}
              allowClear
              style={{ width: 150 }}
            >
              <Option value="Rất tích cực">Rất tích cực</Option>
              <Option value="Tích cực">Tích cực</Option>
              <Option value="Trung lập">Trung lập</Option>
              <Option value="Tiêu cực">Tiêu cực</Option>
              <Option value="Rất tiêu cực">Rất tiêu cực</Option>
            </Select>
            <Select
              placeholder="Chọn rating"
              value={ratingFilter || undefined}
              onChange={setRatingFilter}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="5">5 sao</Option>
              <Option value="4">4 sao</Option>
              <Option value="3">3 sao</Option>
              <Option value="2">2 sao</Option>
              <Option value="1">1 sao</Option>
            </Select>
            <Button onClick={() => {
              setDateRange([null, null]);
              setSentimentFilter('');
              setRatingFilter('');
            }}>
              Xóa bộ lọc
            </Button>
          </Space>
        </Space>
      </Card>

      {reviews.length === 0 ? (
        <Empty
          description="Bạn chưa có đánh giá nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <div className="review-list">
            {reviews.map((review) => (
              <Card
                key={review._id}
                style={{ marginBottom: 16 }}
                loading={loading}
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(review)}
                  >
                    Chỉnh sửa
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(review)}
                  >
                    Xóa
                  </Button>,
                ]}
              >
                <div style={{ marginBottom: 12 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {review.hotel_id.name}
                  </Title>
                  <Text type="secondary">{review.hotel_id.address}</Text>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <Rate disabled value={review.rating} />
                  <span style={{ marginLeft: 8 }}>
                    {review.rating}/5 sao
                  </span>
                  {review.sentiment_label && (
                    <Tag color={getSentimentColor(review.sentiment_label)} style={{ marginLeft: 8 }}>
                      {getSentimentText(review.sentiment_label)}
                    </Tag>
                  )}
                </div>

                <Paragraph>{review.review_text}</Paragraph>

                {review.response && (
                  <Card size="small" style={{ backgroundColor: '#f9f9f9', marginTop: 12 }}>
                    <Text strong>Phản hồi từ khách sạn:</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                      {review.response.response_text}
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(review.response.response_date).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </Card>
                )}

                <div style={{ marginTop: 12, textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Đánh giá lúc: {dayjs(review.createdAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={(page, pageSize) => fetchReviews(page, pageSize)}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} đánh giá`
            }
            style={{ textAlign: 'center', marginTop: 24 }}
          />
        </>
      )}

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa đánh giá"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="review_text"
            label="Nội dung đánh giá"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá' }]}
          >
            <TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa đánh giá này không?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </>
  );
};

export default ReviewList;