'use client'
import { EyeTwoTone, FilterOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Table, Tag, DatePicker, Select, Form, Row, Col, Card, Space, Tooltip, message, Input } from "antd";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";
import BookingDetail from "./booking.detail";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useSession } from "next-auth/react";
import { BookingService } from "@/services/booking.service";

const { RangePicker } = DatePicker;

interface IProps {
    bookings: any[];
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    }
}

enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
}

enum DepositStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
}

interface IBooking {
    _id: string;
    booking_id: string;
    user_id: string;
    hotel_id: string;
    room_id: string;
    check_in_date: Date;
    check_out_date: Date;
    total_amount: number;
    deposit_amount: number;
    remaining_amount: number;
    deposit_status: DepositStatus;
    status: BookingStatus;
    payment_status: PaymentStatus;
    payment_method: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    special_requests?: string;
    number_of_guests: number;
    createdAt: Date;
    updatedAt: Date;
    
    // Joined fields
    hotel_name?: string;
    room_name?: string;
}

const BookingTable = (props: IProps) => {
    const { bookings: initialBookings = [], meta: initialMeta = { current: 1, pageSize: 10, pages: 0, total: 0 } } = props;
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const { data: session } = useSession();

    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [form] = Form.useForm();
    const [bookings, setBookings] = useState<any[]>(initialBookings);
    const [meta, setMeta] = useState(initialMeta);
    const [loading, setLoading] = useState<boolean>(false);
    
    // Fetch bookings when search params change
    useEffect(() => {
        fetchBookings();
    }, [searchParams, session]);
    
    const fetchBookings = async () => {
        if (!session?.user?.access_token) return;
        
        setLoading(true);
        try {
            const queryParams: any = {};

            if(searchParams) {
                // Pagination params
                if (searchParams.has('current')) queryParams.current = Number(searchParams.get('current'));
                if (searchParams.has('pageSize')) queryParams.pageSize = Number(searchParams.get('pageSize'));
                
                // Filter params
                if (searchParams.has('status')) queryParams.status = searchParams.get('status');
                if (searchParams.has('paymentStatus')) queryParams.payment_status = searchParams.get('paymentStatus');
                if (searchParams.has('depositStatus')) queryParams.deposit_status = searchParams.get('depositStatus');
                
                // Date range
                if (searchParams.has('startDate') && searchParams.has('endDate')) {
                    const startDate = searchParams.get('startDate');
                    const endDate = searchParams.get('endDate');
                    queryParams.dateRange = `${startDate},${endDate}`;
                }
                
                // Search term
                if (searchParams.has('search')) {
                    const searchValue = searchParams.get('search')?.trim();
                    if (searchValue) queryParams.search = searchValue;
                }
                
                console.log('Fetching bookings with params:', queryParams);
            }
            
            const res = await BookingService.getBookings(queryParams, session.user.access_token);
            
            if (res?.data) {
                setBookings(res.data.results || []);
                setMeta(res.data.meta || initialMeta);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            message.error('Không thể tải dữ liệu đặt phòng');
        } finally {
            setLoading(false);
        }
    };

    const handleManualUpdateCompletedBookings = async () => {
        if (!session?.user?.access_token) return;
        
        try {
            setLoading(true);
            const res = await BookingService.checkCompletedBookings(session.user.access_token);
            
            if (res?.data?.success) {
                message.success('Đã cập nhật trạng thái booking thành công');
                // Tải lại danh sách booking sau khi cập nhật
                fetchBookings();
            }
        } catch (error: any) {
            console.error('Error updating bookings:', error);
            // Log chi tiết hơn về lỗi
            if (error.response) {
                console.error('Response:', error.response);
            }
            message.error(error?.response?.data?.message || 'Cập nhật trạng thái booking thất bại');
        } finally {
            setLoading(false);
        }
    };

    const bookingStatusColors = {
        [BookingStatus.PENDING]: 'orange',
        [BookingStatus.CONFIRMED]: 'green',
        [BookingStatus.CANCELED]: 'red',
        [BookingStatus.COMPLETED]: 'blue',
        [BookingStatus.EXPIRED]: 'volcano'
    };

    const bookingStatusLabels = {
        [BookingStatus.PENDING]: 'Chờ xác nhận',
        [BookingStatus.CONFIRMED]: 'Đã xác nhận',
        [BookingStatus.CANCELED]: 'Đã hủy',
        [BookingStatus.COMPLETED]: 'Hoàn thành',
        [BookingStatus.EXPIRED]: 'Hết hạn'
    };

    const paymentStatusColors = {
        [PaymentStatus.PENDING]: 'orange',
        [PaymentStatus.PAID]: 'green',
        [PaymentStatus.PARTIALLY_PAID]: 'blue',
        [PaymentStatus.FAILED]: 'red',
        [PaymentStatus.REFUNDED]: 'purple',
        [PaymentStatus.EXPIRED]: 'volcano'
    };

    const paymentStatusLabels = {
        [PaymentStatus.PENDING]: 'Chờ thanh toán',
        [PaymentStatus.PAID]: 'Đã thanh toán',
        [PaymentStatus.PARTIALLY_PAID]: 'Thanh toán một phần',
        [PaymentStatus.FAILED]: 'Thanh toán thất bại',
        [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',
        [PaymentStatus.EXPIRED]: 'Hết hạn thanh toán'
    };

    const depositStatusLabels = {
        [DepositStatus.PAID]: 'Đã đặt cọc',
        [DepositStatus.UNPAID]: 'Chưa đặt cọc'
    };

    const columns: ColumnsType<IBooking> = [
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
            title: 'Mã đặt phòng',
            dataIndex: 'booking_id',
            key: 'booking_id',
            width: 120,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'guest_name',
            key: 'guest_name',
            render: (text, record) => (
                <div>
                    <div>{text}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{record.guest_email}</div>
                </div>
            )
        },
        {
            title: 'Checkin - Checkout',
            key: 'dates',
            render: (_, record) => {
                // Chuyển đổi sang UTC và chỉ giữ lại phần ngày để tính toán chính xác
                const checkInDate = dayjs(record.check_in_date).startOf('day');
                const checkOutDate = dayjs(record.check_out_date).startOf('day');
                
                // Tính số đêm dựa trên sự khác biệt giữa ngày
                const nights = checkOutDate.diff(checkInDate, 'day');
                
                return (
                    <div>
                        <div>{dayjs(record.check_in_date).format('DD/MM/YYYY')}</div>
                        <div>{dayjs(record.check_out_date).format('DD/MM/YYYY')}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            {nights} đêm
                        </div>
                    </div>
                )
            },
            sorter: (a, b) => dayjs(a.check_in_date).unix() - dayjs(b.check_in_date).unix()
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => amount?.toLocaleString('vi-VN') + ' VNĐ',
            sorter: (a, b) => a.total_amount - b.total_amount
        },
        {
            title: 'Trạng thái đặt phòng',
            dataIndex: 'status',
            key: 'status',
            render: (status: BookingStatus) => (
                <Tag color={bookingStatusColors[status] || 'default'}>
                    {bookingStatusLabels[status] || status}
                </Tag>
            ),
            filters: Object.entries(bookingStatusLabels).map(([value, text]) => ({ text, value })),
            onFilter: (value: any, record) => record.status === value,
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'payment_status',
            key: 'payment_status',
            render: (status: PaymentStatus) => (
                <Tag color={paymentStatusColors[status] || 'default'}>
                    {paymentStatusLabels[status] || status}
                </Tag>
            ),
            filters: Object.entries(paymentStatusLabels).map(([value, text]) => ({ text, value })),
            onFilter: (value: any, record) => record.payment_status === value,
        },
        {
            title: 'Đặt cọc',
            dataIndex: 'deposit_status',
            key: 'deposit_status',
            render: (status: DepositStatus) => (
                <Tag color={status === DepositStatus.PAID ? 'green' : 'orange'}>
                    {depositStatusLabels[status] || status}
                </Tag>
            ),
            filters: Object.entries(depositStatusLabels).map(([value, text]) => ({ text, value })),
            onFilter: (value: any, record) => record.deposit_status === value,
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
            width: 80,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <EyeTwoTone
                            twoToneColor="#1890ff" 
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setSelectedBooking(record);
                                setIsDetailModalOpen(true);
                            }}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const onChange = (pagination: any) => {
        if (pagination && pagination.current) {
            const params = new URLSearchParams(searchParams);
            params.set('current', pagination.current);
            if (pagination.pageSize) {
                params.set('pageSize', pagination.pageSize);
            }
            replace(`${pathname}?${params.toString()}`);
        }
    };

    const onFinish = (values: any) => {
        const params = new URLSearchParams(searchParams);
        
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
        
        if (values.status) {
            params.set('status', values.status);
        } else {
            params.delete('status');
        }
        
        if (values.paymentStatus) {
            params.set('paymentStatus', values.paymentStatus);
        } else {
            params.delete('paymentStatus');
        }
        
        if (values.depositStatus) {
            params.set('depositStatus', values.depositStatus);
        } else {
            params.delete('depositStatus');
        }
        
        if (values.search) {
            params.set('search', values.search);
        } else {
            params.delete('search');
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
            <Card title="Tìm kiếm đặt phòng" style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    name="booking-filter"
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={{
                        status: searchParams.get('status') || undefined,
                        paymentStatus: searchParams.get('paymentStatus') || undefined,
                        depositStatus: searchParams.get('depositStatus') || undefined,
                        search: searchParams.get('search') || undefined,
                        dateRange: searchParams.has('startDate') && searchParams.has('endDate')
                            ? [dayjs(searchParams.get('startDate')), dayjs(searchParams.get('endDate'))]
                            : undefined
                    }}
                >
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="dateRange" label="Thời gian check-in">
                                <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="status" label="Trạng thái đặt phòng">
                                <Select
                                    allowClear
                                    placeholder="Chọn trạng thái"
                                    options={Object.entries(bookingStatusLabels).map(([value, label]) => ({ value, label }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="paymentStatus" label="Trạng thái thanh toán">
                                <Select
                                    allowClear
                                    placeholder="Chọn trạng thái thanh toán"
                                    options={Object.entries(paymentStatusLabels).map(([value, label]) => ({ value, label }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="depositStatus" label="Trạng thái đặt cọc">
                                <Select
                                    allowClear
                                    placeholder="Chọn trạng thái đặt cọc"
                                    options={Object.entries(depositStatusLabels).map(([value, label]) => ({ value, label }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="search" label="Tìm kiếm">
                                <Input placeholder="Tìm theo mã, tên khách, email..." />
                            </Form.Item>
                        </Col>
                        <Col span={8} style={{ textAlign: 'right', alignSelf: 'flex-end' }}>
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

            <Card 
                title="Quản lý đặt phòng"
                extra={
                    <Button 
                        type="primary" 
                        icon={<SyncOutlined />} 
                        onClick={handleManualUpdateCompletedBookings}
                        loading={loading}
                    >
                        Cập nhật booking hoàn thành
                    </Button>
                }
            >
                <Table
                    bordered
                    dataSource={bookings}
                    columns={columns}
                    rowKey={"_id"}
                    loading={loading}
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

            <BookingDetail
                isDetailModalOpen={isDetailModalOpen}
                setIsDetailModalOpen={setIsDetailModalOpen}
                booking={selectedBooking}
            />
        </>
    )
}

export default BookingTable;
