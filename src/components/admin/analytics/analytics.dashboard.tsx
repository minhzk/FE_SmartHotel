'use client'

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Spin, Typography, Button, Space } from 'antd';
import { 
    FaDollarSign, 
    FaBook, 
    FaUser, 
    FaHotel, 
    FaArrowUp, 
    FaCalendarAlt, 
    FaFileAlt 
} from "react-icons/fa";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { AnalyticsService } from '@/services/analytics.service';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface OverviewStats {
    totalRevenue: number;
    totalBookings: number;
    totalUsers: number;
    totalHotels: number;
    revenueGrowth: number;
    bookingGrowth: number;
}

const AnalyticsDashboard: React.FC = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);
    const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('day');
    
    // States for different data
    const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [bookingData, setBookingData] = useState<any[]>([]);
    const [hotelsByCity, setHotelsByCity] = useState<any[]>([]);
    const [topHotels, setTopHotels] = useState<any[]>([]);
    const [userStats, setUserStats] = useState<any[]>([]);

    useEffect(() => {
        if (session?.user?.access_token) {
            fetchAllData();
        }
    }, [session, dateRange, timePeriod]);

    const fetchAllData = async () => {
        if (!session?.user?.access_token) return;
        
        setLoading(true);
        try {
            const [startDate, endDate] = dateRange;
            const params = {
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
                period: timePeriod
            };

            // Fetch all analytics data
            const [
                overviewRes,
                revenueRes,
                bookingRes,
                hotelsByCityRes,
                topHotelsRes,
                userStatsRes
            ] = await Promise.all([
                AnalyticsService.getOverviewStats(session.user.access_token),
                AnalyticsService.getRevenueStats(params, session.user.access_token),
                AnalyticsService.getBookingStats(params, session.user.access_token),
                AnalyticsService.getHotelsByCity(session.user.access_token),
                AnalyticsService.getTopHotels({ limit: 10 }, session.user.access_token),
                AnalyticsService.getUserStats(params, session.user.access_token)
            ]);

            if (overviewRes?.data) setOverviewStats(overviewRes.data);
            if (revenueRes?.data) setRevenueData(revenueRes.data);
            if (bookingRes?.data) setBookingData(bookingRes.data);
            if (hotelsByCityRes?.data) {
                const cityData = Object.entries(hotelsByCityRes.data).map(([city, count]) => ({
                    name: city,
                    value: count
                }));
                setHotelsByCity(cityData);
            }
            if (topHotelsRes?.data) {
                // Process top hotels data - ensure proper format and sort by revenue
                interface TopHotel {
                    name: string;
                    revenue: number;
                    bookings: number;
                }

                const processedTopHotels: TopHotel[] = Array.isArray(topHotelsRes.data) 
                    ? topHotelsRes.data
                        .map((hotel: any): TopHotel => ({
                            name: hotel.name || 'Unknown Hotel',
                            revenue: Number(hotel.revenue) || 0,
                            bookings: hotel.bookings || 0
                        }))
                        .sort((a: TopHotel, b: TopHotel) => b.revenue - a.revenue) // Sort by revenue descending
                        .slice(0, 10) // Take only top 5
                    : [];
                console.log('Processed top hotels:', processedTopHotels); // Debug log
                setTopHotels(processedTopHotels);
            }
            if (userStatsRes?.data) setUserStats(userStatsRes.data);

        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (dates: any) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 20 }}>Đang tải dữ liệu báo cáo...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Báo cáo và Thống kê</Title>
                <Space size="large">
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateChange}
                        format="DD/MM/YYYY"
                    />
                    <Select
                        value={timePeriod}
                        onChange={setTimePeriod}
                        style={{ width: 120 }}
                    >
                        <Select.Option value="day">Theo ngày</Select.Option>
                        <Select.Option value="week">Theo tuần</Select.Option>
                        <Select.Option value="month">Theo tháng</Select.Option>
                    </Select>
                    <Button type="primary" onClick={fetchAllData}>
                        Cập nhật
                    </Button>
                </Space>
            </div>

            {/* Overview Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={overviewStats?.totalRevenue || 0}
                            formatter={value => formatCurrency(Number(value))}
                            prefix={<FaDollarSign />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <FaArrowUp style={{ color: '#3f8600' }} />
                            <span style={{ color: '#3f8600', marginLeft: 4 }}>
                                +{overviewStats?.revenueGrowth || 0}%
                            </span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng đặt phòng"
                            value={overviewStats?.totalBookings || 0}
                            prefix={<FaBook />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <FaArrowUp style={{ color: '#1890ff' }} />
                            <span style={{ color: '#1890ff', marginLeft: 4 }}>
                                +{overviewStats?.bookingGrowth || 0}%
                            </span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng người dùng"
                            value={overviewStats?.totalUsers || 0}
                            prefix={<FaUser />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng khách sạn"
                            value={overviewStats?.totalHotels || 0}
                            prefix={<FaHotel />}
                            valueStyle={{ color: '#fa541c' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Revenue Chart */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Biểu đồ doanh thu theo thời gian">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']} />
                                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Biểu đồ số lượng đặt phòng">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={bookingData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="bookings" stroke="#8884d8" name="Đặt phòng" />
                                <Line type="monotone" dataKey="completedBookings" stroke="#82ca9d" name="Hoàn thành" />
                                <Line type="monotone" dataKey="cancelledBookings" stroke="#ff7c7c" name="Đã hủy" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Hotels by City and Top Hotels */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Phân bố khách sạn theo thành phố">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={hotelsByCity}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {hotelsByCity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Top 10 khách sạn có doanh thu cao nhất">
                        {topHotels && topHotels.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart 
                                    data={topHotels}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="name"
                                        angle={-30}
                                        textAnchor="end"
                                        interval={0}
                                        height={80}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis 
                                        tickFormatter={(value) => {
                                            if (value >= 1000000) {
                                                return `${(value / 1000000).toFixed(1)}M`;
                                            } else if (value >= 1000) {
                                                return `${(value / 1000).toFixed(0)}K`;
                                            }
                                            return value.toString();
                                        }}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']}
                                        labelFormatter={(label) => `${label}`}
                                    />
                                    <Bar dataKey="revenue" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                                Không có dữ liệu để hiển thị
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* User Registration Trends */}
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card title="Xu hướng đăng ký người dùng mới">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={userStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="newUsers" 
                                    stackId="1"
                                    stroke="#8884d8" 
                                    fill="#8884d8" 
                                    name="Người dùng mới"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="activeUsers" 
                                    stackId="1"
                                    stroke="#82ca9d" 
                                    fill="#82ca9d" 
                                    name="Người dùng hoạt động"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AnalyticsDashboard;
