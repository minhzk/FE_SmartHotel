'use client';

import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Empty, message, Tabs, DatePicker, Space } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { BookingService } from '@/services/booking.service';
import { HotelService } from '@/services/hotel.service';
import { RoomService } from '@/services/room.service';
import { ReviewService } from '@/services/review.service';
import { useRouter } from 'next/navigation';
import BookingDetail from './booking-detail';
import BookingCancel from './booking-cancel';
import ReviewModal from '@/components/reviews/review-modal';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface BookingListProps {
  session: any;
}

// Enum và kiểu dữ liệu tương ứng với backend
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
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  deposit_amount: number;
  deposit_status: DepositStatus;
  remaining_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests?: string;
  number_of_guests: number;
  createdAt: string;
  updatedAt: string;
  hotel_name?: string;
  room_name?: string;
}

const BookingList: React.FC<BookingListProps> = ({ session }) => {
  const router = useRouter();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [hotelDetails, setHotelDetails] = useState<Record<string, { name: string }>>({});
  const [roomDetails, setRoomDetails] = useState<Record<string, { name: string }>>({});
  const [reviewedBookings, setReviewedBookings] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.access_token) {
      fetchBookings();
      // Gọi API để kiểm tra những booking nào đã được đánh giá
      fetchUserReviews();
    }
  }, [session, activeTab, dateRange]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let queryParams: any = { current: 1, pageSize: 100 };

      // Thêm filter theo status nếu không phải tab "all"
      if (activeTab !== 'all') {
        queryParams.status = activeTab;
      }

      // Thêm filter theo ngày nếu có
      if (dateRange[0] && dateRange[1]) {
        queryParams.dateRange = `${dateRange[0].format('YYYY-MM-DD')},${dateRange[1].format('YYYY-MM-DD')}`;
      }

      const res = await BookingService.getBookings(queryParams, session.user.access_token);

      if (res?.data?.results) {
        const bookings = res.data.results;
        setBookings(bookings);
        
        // Lấy thông tin khách sạn và phòng
        await fetchHotelAndRoomDetails(bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error('Không thể tải thông tin đơn đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelAndRoomDetails = async (bookings: IBooking[]) => {
    const uniqueHotelIds = Array.from(new Set(bookings.map(booking => booking.hotel_id)));
    const uniqueRoomIds = Array.from(new Set(bookings.map(booking => booking.room_id)));
    
    try {
      // Fetch hotel details
      const hotelPromises = uniqueHotelIds.map(async (hotelId) => {
        const res = await HotelService.getHotelById(hotelId, session.user.access_token);
        
        if (res?.data) {
          return { id: hotelId, name: res.data.name };
        }
        return null;
      });
      
      const hotels = (await Promise.all(hotelPromises)).filter(Boolean);
      
      // Fetch room details
      const roomPromises = uniqueRoomIds.map(async (roomId) => {
        const res = await RoomService.getRoomById(roomId, session.user.access_token);
        
        if (res?.data) {
          return { id: roomId, name: res.data.name };
        }
        return null;
      });
      
      const rooms = (await Promise.all(roomPromises)).filter(Boolean);
      
      // Update state with fetched details
      setHotelDetails(
        hotels.reduce((acc, hotel) => {
          if (hotel) acc[hotel.id] = { name: hotel.name };
          return acc;
        }, {} as Record<string, { name: string }>),
      );
      
      setRoomDetails(
        rooms.reduce((acc, room) => {
          if (room) acc[room.id] = { name: room.name };
          return acc;
        }, {} as Record<string, { name: string }>),
      );
    } catch (error) {
      console.error('Error fetching hotel/room details:', error);
    }
  };

  // Cập nhật hàm để tải các đánh giá của người dùng theo hotel_id
  const fetchUserReviews = async () => {
    try {
      console.log('Fetching user reviews with token:', session.user.access_token);
      let queryParams: any = { current: 1, pageSize: 100 };
      
      // Truyền thêm pageSize vào params
      const res = await ReviewService.getUserReviews(queryParams, session.user.access_token);

      console.log('User reviews API response:', res?.data);

      if (res?.data?.results) {
        // Lấy danh sách booking_id từ các đánh giá đã tồn tại (để tương thích ngược)
        const reviewedBookings = res.data.results.map((review: any) => {
          if (review.booking_id && typeof review.booking_id === 'object' && review.booking_id._id) {
            return review.booking_id._id;
          }
          return review.booking_id;
        });
        
        console.log('Extracted reviewed booking IDs:', reviewedBookings);
        setReviewedBookings(reviewedBookings);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  const handleViewDetail = (booking: IBooking) => {
    setSelectedBooking({
      ...booking,
      hotel_name: hotelDetails[booking.hotel_id]?.name || 'Unknown Hotel',
      room_name: roomDetails[booking.room_id]?.name || 'Unknown Room'
    });
    setIsDetailModalVisible(true);
  };

  const handleCancelBooking = (booking: IBooking) => {
    setSelectedBooking({
      ...booking,
      hotel_name: hotelDetails[booking.hotel_id]?.name || 'Unknown Hotel',
      room_name: roomDetails[booking.room_id]?.name || 'Unknown Room'
    });
    setIsCancelModalVisible(true);
  };

  const handleReviewBooking = (booking: IBooking) => {
    setSelectedBooking({
      ...booking,
      hotel_name: hotelDetails[booking.hotel_id]?.name || 'Unknown Hotel',
      room_name: roomDetails[booking.room_id]?.name || 'Unknown Room'
    });
    setIsReviewModalVisible(true);
  };

  // Cập nhật hàm canReview để kiểm tra booking_id và thời hạn 30 ngày
  const canReview = (booking: IBooking) => {
    
    // Kiểm tra xem booking_id có trong danh sách reviewedBookings không
    const hasReviewedBooking = reviewedBookings.some(id => id === booking._id);
    
    // Kiểm tra xem check_out_date có quá 30 ngày so với hiện tại không
    const checkoutDate = dayjs(booking.check_out_date);
    const currentDate = dayjs();
    const daysSinceCheckout = currentDate.diff(checkoutDate, 'day');
    const isWithin30Days = daysSinceCheckout <= 30;
    
    // Điều kiện để hiển thị nút đánh giá:
    // 1. Booking đã hoàn thành
    // 2. Đã thanh toán đầy đủ
    // 3. Chưa đánh giá booking này
    // 4. Ngày checkout không quá 30 ngày so với hiện tại
    return (
      booking.status === BookingStatus.COMPLETED && 
      booking.payment_status === PaymentStatus.PAID &&
      !hasReviewedBooking &&
      isWithin30Days
    );
  };

  const handlePayment = (booking: IBooking) => {
    // Nếu đã đặt cọc, điều hướng đến trang thanh toán số tiền còn lại
    if (booking.payment_status === PaymentStatus.PARTIALLY_PAID || 
        booking.deposit_status === DepositStatus.PAID) {
      router.push(`/bookings/payment/${booking.booking_id}?type=remaining`);
    } else {
      // Nếu chưa thanh toán, điều hướng đến trang thanh toán bình thường
      router.push(`/bookings/payment/${booking.booking_id}`);
    }
  };

  const getStatusTag = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <Tag icon={<ClockCircleOutlined />} color="orange">Chờ xác nhận</Tag>;
      case BookingStatus.CONFIRMED:
        return <Tag icon={<CheckCircleOutlined />} color="green">Đã xác nhận</Tag>;
      case BookingStatus.CANCELED:
        return <Tag icon={<CloseCircleOutlined />} color="red">Đã hủy</Tag>;
      case BookingStatus.COMPLETED:
        return <Tag icon={<CheckCircleOutlined />} color="blue">Hoàn thành</Tag>;
      case BookingStatus.EXPIRED:
        return <Tag icon={<CloseCircleOutlined />} color="volcano">Hết hạn</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getPaymentStatusTag = (status: PaymentStatus, depositStatus: DepositStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return <Tag color="orange">Chưa thanh toán</Tag>;
      case PaymentStatus.PAID:
        return <Tag color="green">Đã thanh toán</Tag>;
      case PaymentStatus.PARTIALLY_PAID:
        return <Tag color="blue">Đã đặt cọc</Tag>;
      case PaymentStatus.FAILED:
        return <Tag color="red">Thanh toán thất bại</Tag>;
      case PaymentStatus.REFUNDED:
        return <Tag color="purple">Đã hoàn tiền</Tag>;
      case PaymentStatus.EXPIRED:
        return <Tag color="volcano">Hết hạn thanh toán</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã đặt phòng',
      dataIndex: 'booking_id',
      key: 'booking_id',
      width: 120,
    },
    {
      title: 'Khách sạn & Phòng',
      key: 'hotel',
      render: (_, record: IBooking) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {hotelDetails[record.hotel_id]?.name || 'Đang tải...'}
          </div>
          <div>
            {roomDetails[record.room_id]?.name || 'Đang tải...'}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày',
      key: 'dates',
      render: (_, record: IBooking) => {
        // Chuyển đổi sang UTC và chỉ giữ lại phần ngày để tính toán chính xác
        const checkInDate = dayjs(record.check_in_date).startOf('day');
        const checkOutDate = dayjs(record.check_out_date).startOf('day');
        
        // Tính số đêm dựa trên sự khác biệt giữa ngày
        const nights = checkOutDate.diff(checkInDate, 'day');
        
        return (
          <div>
            <div>Nhận: {dayjs(record.check_in_date).format('DD/MM/YYYY')}</div>
            <div>Trả: {dayjs(record.check_out_date).format('DD/MM/YYYY')}</div>
            <div>
              {nights} đêm
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số tiền',
      key: 'amount',
      render: (_, record: IBooking) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.total_amount.toLocaleString('vi-VN')} VND
          </div>
          {record.deposit_status === DepositStatus.PAID && (
            <div style={{ fontSize: 12 }}>
              Đặt cọc: {record.deposit_amount.toLocaleString('vi-VN')} VND
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record: IBooking) => (
        <div>
          {getStatusTag(record.status)}
          <div style={{ marginTop: 4 }}>
            {getPaymentStatusTag(record.payment_status, record.deposit_status)}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record: IBooking) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          
          {/* Chỉ hiện nút thanh toán nếu chưa thanh toán hoặc mới đặt cọc */}
          {record.payment_status === PaymentStatus.PENDING && 
            record.status !== BookingStatus.CANCELED && (
            <Button 
              type="default" 
              size="small"
              onClick={() => handlePayment(record)}
            >
              Thanh toán
            </Button>
          )}
          
          {/* Hiển thị nút thanh toán phần còn lại nếu đã đặt cọc */}
          {record.payment_status === PaymentStatus.PARTIALLY_PAID && 
            record.status !== BookingStatus.CANCELED && (
            <Button 
              type="default" 
              size="small"
              onClick={() => handlePayment(record)}
            >
              Thanh toán còn lại
            </Button>
          )}
          
          {/* Chỉ hiện nút hủy nếu đã đặt cọc nhưng chưa thanh toán toàn bộ */}
          {record.deposit_status === DepositStatus.PAID && 
            record.payment_status === PaymentStatus.PARTIALLY_PAID &&
            record.status !== BookingStatus.COMPLETED && 
            record.status !== BookingStatus.CANCELED && (
            <Button 
              danger 
              size="small" 
              onClick={() => handleCancelBooking(record)}
            >
              Hủy
            </Button>
          )}
          
          {/* Hiển thị nút đánh giá nếu đơn hàng đã hoàn thành và đã qua ngày check-out */}
          {canReview(record) && (
            <Button 
              type="default" 
              size="small" 
              icon={<StarOutlined />}
              onClick={() => handleReviewBooking(record)}
            >
              Đánh giá
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  return (
    <div className="booking-list">
      <Card>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <RangePicker 
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                placeholder={['Check-in', 'Check-out']}
              />
            </div>
          </div>
        </Space>

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Tất cả" key="all" />
          <TabPane tab="Chờ xác nhận" key={BookingStatus.PENDING} />
          <TabPane tab="Đã xác nhận" key={BookingStatus.CONFIRMED} />
          <TabPane tab="Hoàn thành" key={BookingStatus.COMPLETED} />
          <TabPane tab="Đã hủy" key={BookingStatus.CANCELED} />
          <TabPane tab="Hết hạn" key={BookingStatus.EXPIRED} />
        </Tabs>

        {bookings.length > 0 ? (
          <Table 
            dataSource={bookings} 
            columns={columns} 
            rowKey="_id" 
            loading={loading}
            pagination={false}
          />
        ) : (
          <Empty 
            description={
              <span>
                {loading ? 'Đang tải dữ liệu...' : 'Không có đơn đặt phòng nào'}
              </span>
            }
          />
        )}
      </Card>

      {/* Modal chi tiết đơn đặt phòng */}
      {selectedBooking && (
        <BookingDetail
          booking={selectedBooking}
          visible={isDetailModalVisible}
          onClose={() => setIsDetailModalVisible(false)}
          session={session}
          onRefresh={fetchBookings}
        />
      )}

      {/* Modal hủy đơn đặt phòng */}
      {selectedBooking && (
        <BookingCancel
          booking={selectedBooking}
          visible={isCancelModalVisible}
          onClose={() => setIsCancelModalVisible(false)}
          session={session}
          onSuccess={() => {
            setIsCancelModalVisible(false);
            fetchBookings();
          }}
        />
      )}

      {/* Modal đánh giá */}
      {selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          visible={isReviewModalVisible}
          onClose={() => setIsReviewModalVisible(false)}
          session={session}
          onSuccess={async () => {
            setIsReviewModalVisible(false);
            message.success('Đánh giá của bạn đã được gửi thành công!');
            await fetchBookings(); // Fetch lại danh sách booking mới nhất
            await fetchUserReviews(); // Fetch lại danh sách reviewedBookings để cập nhật trạng thái nút đánh giá
          }}
        />
      )}
    </div>
  );
};

export default BookingList;
