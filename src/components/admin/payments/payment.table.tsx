'use client'
import { EyeTwoTone, FilterOutlined } from "@ant-design/icons";
import { Button, Table, Tag, DatePicker, Select, Form, Row, Col, Card, Space, Tooltip, message } from "antd";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";
import PaymentDetail from "./payment.detail";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PaymentService } from "@/services/payment.service";
import { UserService } from "@/services/user.service";
import { useSession } from "next-auth/react";

const { RangePicker } = DatePicker;

interface IProps {
    payments: any[];
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    }
}

type PaymentMethod = 'vnpay' | 'wallet' | 'cash';
type PaymentType = 'deposit' | 'remaining' | 'full_payment' | 'wallet_deposit' | 'refund';
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

interface IPayment {
    _id: string;
    transaction_id: string;
    booking_id: string;
    user_id: string;
    amount: number;
    payment_type: PaymentType;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    payment_date: Date;
    vnp_transaction_id?: string;
    vnp_transaction_no?: string;
    vnp_bank_code?: string;
    error_message?: string;
    // Additional fields from joined data
    user_name?: string;
    user_email?: string;
    hotel_name?: string;
}

const PaymentTable = (props: IProps) => {
    const { payments: initialPayments = [], meta: initialMeta = { current: 1, pageSize: 10, pages: 0, total: 0 } } = props;
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const { data: session } = useSession();

    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [form] = Form.useForm();
    const [userDetails, setUserDetails] = useState<Record<string, { name: string, email: string }>>({});
    
    const [payments, setPayments] = useState<any[]>(initialPayments);
    const [meta, setMeta] = useState(initialMeta);
    const [loading, setLoading] = useState<boolean>(false);
    
    useEffect(() => {
        fetchPayments();
    }, [searchParams, session]);
    
    const fetchPayments = async () => {
        if (!session?.user?.access_token) return;
        
        setLoading(true);
        try {
            const queryParams: any = {};
            
            if (searchParams.has('current')) queryParams.current = searchParams.get('current');
            if (searchParams.has('pageSize')) queryParams.pageSize = searchParams.get('pageSize');
            
            if (searchParams.has('status')) queryParams.status = searchParams.get('status');
            if (searchParams.has('paymentMethod')) queryParams.paymentMethod = searchParams.get('paymentMethod');
            if (searchParams.has('paymentType')) queryParams.paymentType = searchParams.get('paymentType');
            
            if (searchParams.has('startDate') && searchParams.has('endDate')) {
                const startDate = searchParams.get('startDate');
                const endDate = searchParams.get('endDate');
                queryParams.paymentDate = `${startDate},${endDate}`;
            }
            
            console.log('Fetching payments with params:', queryParams);
            
            const res = await PaymentService.getPayments(queryParams, session.user.access_token);
            
            if (res?.data) {
                setPayments(res.data.results || []);
                setMeta(res.data.meta || initialMeta);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            message.error('Không thể tải dữ liệu thanh toán');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            const uniqueUserIds = Array.from(new Set(payments.map(payment => payment.user_id)));
            if (uniqueUserIds.length === 0) return;

            try {
                const userPromises = uniqueUserIds.map(async (userId) => {
                    const res = await UserService.getUserById(userId, session?.user?.access_token!);

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

        if (payments.length > 0 && session?.user?.access_token) {
            fetchUserDetails();
        }
    }, [payments, session]);

    const paymentStatusColors = {
        'pending': 'orange',
        'completed': 'green',
        'failed': 'red',
        'refunded': 'blue'
    };

    const paymentMethodLabels: Record<PaymentMethod, string> = {
        'vnpay': 'VNPay',
        'wallet': 'Ví tiền',
        'cash': 'Tiền mặt'
    };

    const paymentTypeLabels: Record<PaymentType, string> = {
        'deposit': 'Đặt cọc',
        'remaining': 'Thanh toán còn lại',
        'full_payment': 'Thanh toán đầy đủ',
        'wallet_deposit': 'Nạp tiền ví',
        'refund': 'Hoàn tiền'
    };

    const columns: ColumnsType<IPayment> = [
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
            title: 'Mã giao dịch',
            dataIndex: 'transaction_id',
            key: 'transaction_id',
        },
        {
            title: 'Khách hàng',
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
            title: 'Loại thanh toán',
            dataIndex: 'payment_type',
            key: 'payment_type',
            render: (type: PaymentType) => <Tag>{paymentTypeLabels[type] || type}</Tag>,
            filters: Object.entries(paymentTypeLabels).map(([value, text]) => ({ text, value })),
            onFilter: (value: any, record) => record.payment_type === value,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => amount.toLocaleString('vi-VN') + ' VNĐ',
            sorter: (a, b) => a.amount - b.amount
        },
        {
            title: 'Phương thức',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method: PaymentMethod) => <Tag>{paymentMethodLabels[method] || method}</Tag>,
            filters: Object.entries(paymentMethodLabels).map(([value, text]) => ({ text, value })),
            onFilter: (value: any, record) => record.payment_method === value
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: PaymentStatus) => (
                <Tag color={paymentStatusColors[status] || 'default'}>
                    {status === 'pending' && 'Chờ thanh toán'}
                    {status === 'completed' && 'Hoàn thành'}
                    {status === 'failed' && 'Thất bại'}
                    {status === 'refunded' && 'Đã hoàn tiền'}
                </Tag>
            ),
            filters: [
                { text: 'Chờ thanh toán', value: 'pending' },
                { text: 'Hoàn thành', value: 'completed' },
                { text: 'Thất bại', value: 'failed' },
                { text: 'Đã hoàn tiền', value: 'refunded' },
            ],
            onFilter: (value: any, record) => record.status === value
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'payment_date',
            key: 'payment_date',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A',
            sorter: (a, b) => {
                if (!a.payment_date) return -1;
                if (!b.payment_date) return 1;
                return dayjs(a.payment_date).unix() - dayjs(b.payment_date).unix();
            }
        },
        {
            title: 'Thao tác',
            width: 80,
            render: (_, record) => {
                return (
                    <Space>
                        <Tooltip title="Xem chi tiết">
                            <EyeTwoTone
                                twoToneColor="#1890ff" 
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    setSelectedPayment(record);
                                    setIsDetailModalOpen(true);
                                }}
                            />
                        </Tooltip>
                    </Space>
                )
            }
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
        
        if (values.paymentMethod) {
            params.set('paymentMethod', values.paymentMethod);
        } else {
            params.delete('paymentMethod');
        }

        if (values.paymentType) {
            params.set('paymentType', values.paymentType);
        } else {
            params.delete('paymentType');
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
            <Card title="Tìm kiếm thanh toán" style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    name="payment-filter"
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={{
                        status: searchParams.get('status') || undefined,
                        paymentMethod: searchParams.get('paymentMethod') || undefined,
                        paymentType: searchParams.get('paymentType') || undefined,
                        dateRange: searchParams.has('startDate') && searchParams.has('endDate')
                            ? [dayjs(searchParams.get('startDate')), dayjs(searchParams.get('endDate'))]
                            : undefined
                    }}
                >
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="dateRange" label="Thời gian thanh toán">
                                <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="status" label="Trạng thái">
                                <Select
                                    allowClear
                                    placeholder="Chọn trạng thái"
                                    options={[
                                        { value: 'pending', label: 'Chờ thanh toán' },
                                        { value: 'completed', label: 'Hoàn thành' },
                                        { value: 'failed', label: 'Thất bại' },
                                        { value: 'refunded', label: 'Đã hoàn tiền' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="paymentType" label="Loại thanh toán">
                                <Select
                                    allowClear
                                    placeholder="Chọn loại thanh toán"
                                    options={Object.entries(paymentTypeLabels).map(([value, label]) => ({ value, label }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="paymentMethod" label="Phương thức thanh toán">
                                <Select
                                    allowClear
                                    placeholder="Chọn phương thức"
                                    options={Object.entries(paymentMethodLabels).map(([value, label]) => ({ value, label }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={16} style={{ textAlign: 'right', alignSelf: 'flex-end' }}>
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

            <Card title="Quản lý thanh toán">
                <Table
                    bordered
                    dataSource={payments}
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

            <PaymentDetail
                isDetailModalOpen={isDetailModalOpen}
                setIsDetailModalOpen={setIsDetailModalOpen}
                payment={selectedPayment}
            />
        </>
    )
}

export default PaymentTable;
