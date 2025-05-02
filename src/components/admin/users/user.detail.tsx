'use client'
import { Avatar, Button, Card, Descriptions, Divider, Modal, Space, Statistic, Table, Tag, Timeline, Typography } from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { UserOutlined, WalletOutlined, ShoppingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface IProps {
    isDetailModalOpen: boolean;
    setIsDetailModalOpen: (value: boolean) => void;
    user: any;
}

const UserDetail = (props: IProps) => {
    const { isDetailModalOpen, setIsDetailModalOpen, user } = props;
    const [userBookings, setUserBookings] = useState<any[]>([]);
    const [userPayments, setUserPayments] = useState<any[]>([]);
    const [hotelDetails, setHotelDetails] = useState<Record<string, { name: string }>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!user?._id) return;
            
            setLoading(true);
            try {
                // Lấy lịch sử đặt phòng của người dùng
                const bookingsRes = await sendRequest({
                    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings?user_id=${user._id}&limit=5`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session?.user?.access_token}`
                    }
                });
                
                if (bookingsRes?.data?.results) {
                    const bookings = bookingsRes.data.results;
                    setUserBookings(bookings);
                    
                    // Lấy danh sách hotel_id từ các booking
                    const hotelIds = Array.from(new Set(bookings.map((booking: any) => booking.hotel_id as string)));
                    await fetchHotelDetails(hotelIds);
                }
                
                // Lấy lịch sử giao dịch của người dùng
                const paymentsRes = await sendRequest({
                    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments?user_id=${user._id}&limit=5`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session?.user?.access_token}`
                    }
                });
                
                if (paymentsRes?.data?.results) {
                    setUserPayments(paymentsRes.data.results);
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchHotelDetails = async (hotelIds: string[]) => {
            if (!hotelIds.length) return;
            
            try {
                // Lấy thông tin từng khách sạn
                const hotelPromises = hotelIds.map(async (hotelId) => {
                    if (!hotelId) return null;
                    
                    const res = await sendRequest({
                        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels/${hotelId}`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${session?.user?.access_token}`
                        }
                    });
                    
                    if (res?.data) {
                        return {
                            id: hotelId,
                            name: res.data.name || 'N/A'
                        };
                    }
                    return null;
                });
                
                const hotels = (await Promise.all(hotelPromises)).filter(Boolean);
                
                // Chuyển đổi mảng kết quả thành đối tượng để dễ truy cập
                const hotelMap = hotels.reduce((acc, hotel) => {
                    if (hotel) {
                        acc[hotel.id] = { name: hotel.name };
                    }
                    return acc;
                }, {} as Record<string, { name: string }>);
                
                setHotelDetails(hotelMap);
            } catch (error) {
                console.error('Error fetching hotel details:', error);
            }
        };

        if (isDetailModalOpen && user) {
            fetchUserDetails();
        } else {
            setUserBookings([]);
            setUserPayments([]);
            setHotelDetails({});
        }
    }, [user, isDetailModalOpen, session]);

    if (!user) return null;

    // Map transaction type to Vietnamese labels
    const getTransactionTypeLabel = (type: string) => {
        const typeMap: Record<string, string> = {
            'DEPOSIT': 'Nạp tiền',
            'REFUND': 'Hoàn tiền',
            'PAYMENT': 'Thanh toán',
            'WITHDRAWAL': 'Rút tiền'
        };
        return typeMap[type] || type;
    };

    // Generate color for transaction amount
    const getAmountColor = (amount: number, type: string) => {
        if (['DEPOSIT', 'REFUND'].includes(type)) return 'green';
        if (['PAYMENT', 'WITHDRAWAL'].includes(type)) return 'red';
        return 'inherit';
    };

    // Lấy tên khách sạn từ hotel_id
    const getHotelName = (hotelId: string) => {
        return hotelDetails[hotelId]?.name || 'N/A';
    };

    // Render transactions table if available
    const renderTransactionsTable = () => {
        if (!user.transactions || user.transactions.length === 0) {
            return <Text type="secondary">Không có lịch sử giao dịch</Text>;
        }

        const columns = [
            {
                title: 'Loại giao dịch',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => <Tag>{getTransactionTypeLabel(type)}</Tag>
            },
            {
                title: 'Số tiền',
                dataIndex: 'amount',
                key: 'amount',
                render: (amount: number, record: any) => (
                    <span style={{ color: getAmountColor(amount, record.type) }}>
                        {record.type === 'PAYMENT' || record.type === 'WITHDRAWAL' ? '-' : '+'}{amount.toLocaleString('vi-VN')} VNĐ
                    </span>
                )
            },
            {
                title: 'Mô tả',
                dataIndex: 'description',
                key: 'description'
            },
            {
                title: 'Thời gian',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
            }
        ];

        return (
            <Table
                columns={columns}
                dataSource={user.transactions}
                rowKey={(record, index) => index?.toString() || '0'}
                pagination={false}
                size="small"
            />
        );
    };

    return (
        <Modal
            title={<Title level={4}>Thông tin người dùng</Title>}
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            width={800}
            footer={[
                <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
                    Đóng
                </Button>
            ]}
        >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar 
                    size={80} 
                    src={user.image} 
                    icon={!user.image && <UserOutlined />} 
                />
                <Title level={4} style={{ marginTop: 8, marginBottom: 0 }}>{user.name}</Title>
                <Text type="secondary">{user.email}</Text>
            </div>

            <Descriptions title="Thông tin cơ bản" bordered column={2}>
                <Descriptions.Item label="Họ và tên">
                    {user.name}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                    {user.email}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                    <Tag color={user.role === 'ADMIN' ? 'gold' : 'blue'}>
                        {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={user.isActive ? 'green' : 'red'}>
                        {user.isActive ? 'Đang hoạt động' : 'Chưa kích hoạt'}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                    {user.phone || 'Chưa cập nhật'}
                </Descriptions.Item>
                <Descriptions.Item label="Số dư tài khoản">
                    <Text strong style={{ color: '#1890ff' }}>{user.account_balance?.toLocaleString('vi-VN')} VNĐ</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tham gia">
                    {user.createdAt ? dayjs(user.createdAt).format('DD/MM/YYYY') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">
                    {user.updatedAt ? dayjs(user.updatedAt).format('DD/MM/YYYY') : 'N/A'}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
                <Card bordered={false} style={{ width: '45%' }}>
                    <Statistic
                        title="Tổng số đặt phòng"
                        value={userBookings.length}
                        prefix={<ShoppingOutlined />}
                    />
                </Card>
                <Card bordered={false} style={{ width: '45%' }}>
                    <Statistic
                        title="Tổng giao dịch"
                        value={userPayments.length}
                        prefix={<WalletOutlined />}
                    />
                </Card>
            </div>

            {/* Lịch sử giao dịch */}
            <Divider orientation="left">Lịch sử giao dịch ví</Divider>
            {renderTransactionsTable()}

            {/* Lịch sử đặt phòng gần đây */}
            {userBookings.length > 0 && (
                <>
                    <Divider orientation="left">Đặt phòng gần đây</Divider>
                    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {userBookings.map((booking, index) => (
                            <Card size="small" key={index} style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div><strong>Mã đặt phòng:</strong> {booking.booking_id}</div>
                                        <div><strong>Khách sạn:</strong> {getHotelName(booking.hotel_id)}</div>
                                        <div>
                                            <strong>Ngày:</strong> {dayjs(booking.check_in_date).format('DD/MM/YYYY')} - {dayjs(booking.check_out_date).format('DD/MM/YYYY')}
                                        </div>
                                    </div>
                                    <div>
                                        <div><strong>Số tiền:</strong> {booking.total_amount?.toLocaleString('vi-VN')} VNĐ</div>
                                        <div>
                                            <Tag color={
                                                booking.status === 'confirmed' ? 'green' :
                                                booking.status === 'pending' ? 'orange' :
                                                booking.status === 'canceled' ? 'red' : 'blue'
                                            }>
                                                {booking.status === 'confirmed' ? 'Đã xác nhận' :
                                                booking.status === 'pending' ? 'Chờ xác nhận' :
                                                booking.status === 'canceled' ? 'Đã hủy' :
                                                booking.status === 'completed' ? 'Hoàn thành' : booking.status}
                                            </Tag>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </Modal>
    );
};

export default UserDetail;
