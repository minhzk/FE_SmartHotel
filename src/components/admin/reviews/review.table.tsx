'use client'
import { EyeTwoTone, MessageOutlined, FilterOutlined, StarFilled } from "@ant-design/icons";
import { Button, Table, Tag, DatePicker, Select, Form, Row, Col, Card, Space, Tooltip, Rate } from "antd";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";
import ReviewDetail from "./review.detail";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import ReviewReply from "./review.reply";

const { RangePicker } = DatePicker;

interface IProps {
    reviews: any[];
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    }
}

enum SentimentLabel {
  NEGATIVE = 'Tiêu cực',
  NEUTRAL = 'Trung lập',
  SATISFIED = 'Hài lòng',
  EXCELLENT = 'Tuyệt vời',
  PERFECT = 'Hoàn hảo',
}

interface IReview {
    _id: string;
    review_id: string;
    user_id: string;
    hotel_id: string;
    rating: number;
    sentiment?: number;
    sentiment_label?: SentimentLabel;
    review_text: string;
    response?: {
        response_text: string;
        response_by: string;
        response_date: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    // Thông tin bổ sung
    user_name?: string;
    user_email?: string;
    hotel_name?: string;
}

const ReviewTable = (props: IProps) => {
    const { reviews = [], meta = { current: 1, pageSize: 10, pages: 0, total: 0 } } = props;
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const { data: session } = useSession();

    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [form] = Form.useForm();
    const [userDetails, setUserDetails] = useState<Record<string, { name: string, email: string }>>({});
    const [hotelDetails, setHotelDetails] = useState<Record<string, { name: string }>>({});

    useEffect(() => {
        const fetchUserDetails = async () => {
            const uniqueUserIds = Array.from(new Set(reviews.map(review => review.user_id)));
            if (uniqueUserIds.length === 0) return;

            try {
                const userPromises = uniqueUserIds.map(async (userId) => {
                    const res = await sendRequest({
                        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userId}`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${session?.user?.access_token}`
                        }
                    });

                    if (res?.data) {
                        return {
                            userId,
                            name: res.data.name || res.data.fullname || 'N/A',
                            email: res.data.email || 'N/A'
                        };
                    }
                    return { userId, name: 'N/A', email: 'N/A' };
                });

                const usersData = await Promise.all(userPromises);
                const usersMap = usersData.reduce((acc, user) => {
                    acc[user.userId] = { name: user.name, email: user.email };
                    return acc;
                }, {} as Record<string, { name: string, email: string }>);

                setUserDetails(usersMap);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        const fetchHotelDetails = async () => {
            const uniqueHotelIds = Array.from(new Set(reviews.map(review => review.hotel_id)));
            if (uniqueHotelIds.length === 0) return;

            try {
                const hotelPromises = uniqueHotelIds.map(async (hotelId) => {
                    const res = await sendRequest({
                        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels/${hotelId}`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${session?.user?.access_token}`
                        }
                    });

                    if (res?.data) {
                        return {
                            hotelId,
                            name: res.data.name || 'N/A'
                        };
                    }
                    return { hotelId, name: 'N/A' };
                });

                const hotelsData = await Promise.all(hotelPromises);
                const hotelsMap = hotelsData.reduce((acc, hotel) => {
                    acc[hotel.hotelId] = { name: hotel.name };
                    return acc;
                }, {} as Record<string, { name: string }>);

                setHotelDetails(hotelsMap);
            } catch (error) {
                console.error('Error fetching hotel details:', error);
            }
        };

        if (reviews.length > 0 && session?.user?.access_token) {
            fetchUserDetails();
            fetchHotelDetails();
        }
    }, [reviews, session]);

    const sentimentColors = {
        [SentimentLabel.NEGATIVE]: 'red',
        [SentimentLabel.NEUTRAL]: 'orange',
        [SentimentLabel.SATISFIED]: 'blue',
        [SentimentLabel.EXCELLENT]: 'green',
        [SentimentLabel.PERFECT]: 'purple'
    };

    const handleReply = (review: IReview) => {
        setSelectedReview(review);
        setIsReplyModalOpen(true);
    };

    const columns: ColumnsType<IReview> = [
        {
            title: "STT",
            width: 60,
            render: (_: any, __: any, index: any) => {
                return (
                    <>{(index + 1) + (meta.current - 1) * (meta.pageSize)}</>
                )
            }
        },
        {
            title: 'Khách sạn',
            dataIndex: 'hotel_id',
            key: 'hotel_id',
            render: (hotelId: string) => {
                return hotelDetails[hotelId]?.name || 'N/A';
            }
        },
        {
            title: 'Người đánh giá',
            dataIndex: 'user_id',
            key: 'user_id',
            render: (userId: string) => {
                const user = userDetails[userId] || { name: 'N/A', email: 'N/A' };
                return (
                    <div>
                        <div>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{user.email}</div>
                    </div>
                );
            }
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number) => (
                <Rate disabled defaultValue={rating} style={{ fontSize: '16px', color: '#fadb14' }} />
            ),
            sorter: (a, b) => a.rating - b.rating,
            filters: [
                { text: '5 sao', value: 5 },
                { text: '4 sao', value: 4 },
                { text: '3 sao', value: 3 },
                { text: '2 sao', value: 2 },
                { text: '1 sao', value: 1 }
            ],
            onFilter: (value: any, record) => record.rating === value,
        },
        {
            title: 'Nội dung',
            dataIndex: 'review_text',
            key: 'review_text',
            render: (text: string) => (
                <div style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {text}
                </div>
            )
        },
        {
            title: 'Cảm xúc',
            dataIndex: 'sentiment_label',
            key: 'sentiment_label',
            render: (label: SentimentLabel) => (
                label ? <Tag color={sentimentColors[label]}>{label}</Tag> : <Tag>Chưa phân tích</Tag>
            ),
            filters: Object.values(SentimentLabel).map(value => ({ text: value, value })),
            onFilter: (value: any, record) => record.sentiment_label === value,
        },
        {
            title: 'Phản hồi',
            key: 'response',
            render: (_, record) => (
                <Tag color={record.response ? 'green' : 'default'}>
                    {record.response ? 'Đã phản hồi' : 'Chưa phản hồi'}
                </Tag>
            ),
            filters: [
                { text: 'Đã phản hồi', value: 'responded' },
                { text: 'Chưa phản hồi', value: 'not_responded' }
            ],
            onFilter: (value: any, record) => {
                if (value === 'responded') return !!record.response;
                return !record.response;
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A',
            sorter: (a, b) => {
                if (!a.createdAt) return -1;
                if (!b.createdAt) return 1;
                return dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix();
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <EyeTwoTone
                            twoToneColor="#1890ff" 
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setSelectedReview(record);
                                setIsDetailModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Phản hồi">
                        <MessageOutlined
                            style={{ cursor: "pointer", color: "#52c41a" }}
                            onClick={() => handleReply(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        }
    ];

    const onChange = (pagination: any) => {
        if (pagination && pagination.current) {
            const params = new URLSearchParams(searchParams);
            params.set('current', pagination.current);
            replace(`${pathname}?${params.toString()}`);
        }
    };

    const onFinish = (values: any) => {
        const params = new URLSearchParams(searchParams);
        
        // Reset to first page when filtering
        params.set('current', '1');
        
        if (values.dateRange) {
            const [startDate, endDate] = values.dateRange;
            if (startDate && endDate) {
                params.set('startDate', startDate.format('YYYY-MM-DD'));
                params.set('endDate', endDate.format('YYYY-MM-DD'));
            }
        } else {
            params.delete('startDate');
            params.delete('endDate');
        }
        
        if (values.sentiment_label) {
            params.set('sentiment_label', values.sentiment_label);
        } else {
            params.delete('sentiment_label');
        }
        
        if (values.rating) {
            params.set('rating', values.rating);
        } else {
            params.delete('rating');
        }
        
        replace(`${pathname}?${params.toString()}`);
    };

    const resetFilters = () => {
        form.resetFields();
        
        const params = new URLSearchParams();
        params.set('current', '1');
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <>
            <Card title="Tìm kiếm đánh giá" style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    name="review-filter"
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={{
                        sentiment_label: searchParams.get('sentiment_label') || undefined,
                        rating: searchParams.get('rating') || undefined,
                        dateRange: searchParams.has('startDate') && searchParams.has('endDate')
                            ? [dayjs(searchParams.get('startDate')), dayjs(searchParams.get('endDate'))]
                            : undefined
                    }}
                >
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="dateRange" label="Thời gian đánh giá">
                                <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="sentiment_label" label="Cảm xúc">
                                <Select
                                    allowClear
                                    placeholder="Chọn loại cảm xúc"
                                    options={Object.values(SentimentLabel).map((value) => ({ value, label: value }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="rating" label="Đánh giá">
                                <Select
                                    allowClear
                                    placeholder="Chọn số sao đánh giá"
                                    options={[
                                        { value: '5', label: '5 sao' },
                                        { value: '4', label: '4 sao' },
                                        { value: '3', label: '3 sao' },
                                        { value: '2', label: '2 sao' },
                                        { value: '1', label: '1 sao' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Button style={{ marginRight: 8 }} onClick={resetFilters}>
                                Xóa bộ lọc
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
                                Lọc
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card title="Quản lý đánh giá">
                <Table
                    bordered
                    dataSource={reviews}
                    columns={columns}
                    rowKey={"_id"}
                    pagination={{
                        current: meta.current,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => { 
                            return (<div> {range[0]}-{range[1]} trên {total} kết quả</div>) 
                        }
                    }}
                    onChange={onChange}
                />
            </Card>

            <ReviewDetail
                isDetailModalOpen={isDetailModalOpen}
                setIsDetailModalOpen={setIsDetailModalOpen}
                review={selectedReview}
                userDetails={userDetails}
                hotelDetails={hotelDetails}
            />

            <ReviewReply
                isReplyModalOpen={isReplyModalOpen}
                setIsReplyModalOpen={setIsReplyModalOpen}
                review={selectedReview}
                onSuccess={() => {
                    window.location.reload();
                }}
            />
        </>
    )
}

export default ReviewTable;
