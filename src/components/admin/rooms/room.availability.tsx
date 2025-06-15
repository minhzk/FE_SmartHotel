'use client'

import { Button, Calendar, Modal, Select, Tooltip, Tag, message, DatePicker, Space, Typography, InputNumber } from "antd";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { handleGenerateRoomAvailabilityAction, handleUpdateRoomAvailabilityStatusAction } from "@/utils/actions";
import { RoomAvailabilityService } from "@/services/room-availability.service";
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface IRoomAvailabilityProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    room: any;
}

const RoomAvailability = ({ isModalOpen, setIsModalOpen, room }: IRoomAvailabilityProps) => {
    const [availabilityData, setAvailabilityData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDateRange, setSelectedDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [selectedStatus, setSelectedStatus] = useState<string>('available');
    const [updateMode, setUpdateMode] = useState<'single' | 'range'>('single');
    const [overridePrice, setOverridePrice] = useState<number | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        if (isModalOpen && room?._id) {
            fetchAvailabilityData();
        }
    }, [isModalOpen, room]);

    const fetchAvailabilityData = async () => {
        if (!room?._id || !session?.user?.access_token) return;
        
        setLoading(true);
        try {
            const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
            const endDate = dayjs().endOf('month').add(2, 'month').format('YYYY-MM-DD');
            
            console.log('Fetching room availability for:', room._id, 'from', startDate, 'to', endDate);
            
            const data = await RoomAvailabilityService.getRoomAvailabilityByDateRange(
                room._id, 
                startDate, 
                endDate, 
                session.user.access_token
            );
            
            if (data?.data) {
                setAvailabilityData(data.data);
            }
        } catch (error) {
            console.error('Error fetching room availability:', error);
            message.error('Không thể tải dữ liệu lịch phòng');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedDateRange([null, null]);
        setSelectedStatus('available');
        setUpdateMode('single');
        setOverridePrice(null);
    };

    const handleUpdateAvailability = async () => {
        if (!selectedDateRange[0] || !room?._id) return;
        
        try {
            setLoading(true);

            let startDate: string;
            let endDate: string;

            if (updateMode === 'range' && selectedDateRange[1]) {
                // Chế độ khoảng ngày
                startDate = selectedDateRange[0].format('YYYY-MM-DD');
                endDate = selectedDateRange[1].format('YYYY-MM-DD');
                
                console.log('updating room availability range for:', room._id, 'from', startDate, 'to', endDate, 'status:', selectedStatus);
            } else {
                // Chế độ ngày đơn
                startDate = selectedDateRange[0].format('YYYY-MM-DD');
                endDate = selectedDateRange[0].format('YYYY-MM-DD');
                
                console.log('updating room availability for:', room._id, 'on', startDate, 'to', selectedStatus);
            }
            
            await handleGenerateRoomAvailabilityAction({
                roomId: room._id,
                startDate,
                endDate,
                status: selectedStatus,
                priceOverride: overridePrice ?? null
            });
            
            if (updateMode === 'range' && selectedDateRange[1]) {
                const days = selectedDateRange[1].diff(selectedDateRange[0], 'day') + 1;
                message.success(`Cập nhật trạng thái phòng thành công cho ${days} ngày!`);
            } else {
                message.success('Cập nhật trạng thái phòng thành công!');
            }
            
            fetchAvailabilityData();
            setSelectedDateRange([null, null]);
            setOverridePrice(null);
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái phòng');
        } finally {
            setLoading(false);
        }
    };

    const generateAvailability = async () => {
        if (!room?._id) return;
        
        try {
            setLoading(true);
            
            const startDate = dayjs().format('YYYY-MM-DD');
            const endDate = dayjs().add(3, 'month').format('YYYY-MM-DD');
            
            await handleGenerateRoomAvailabilityAction({
                roomId: room._id,
                startDate,
                endDate,
                status: 'available',
                priceOverride: null
            });
            
            message.success('Tạo lịch phòng thành công!');
            fetchAvailabilityData();
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra khi tạo lịch phòng');
        } finally {
            setLoading(false);
        }
    };

    const dateCellRender = (date: Dayjs) => {
        const dateStr = date.format('YYYY-MM-DD');
        // Tìm bản ghi có ngày nằm trong khoảng start_date - end_date
        const dateData = availabilityData.find(item => {
            const start = dayjs(item.start_date).format('YYYY-MM-DD');
            const end = dayjs(item.end_date).format('YYYY-MM-DD');
            return dateStr >= start && dateStr <= end;
        });
        
        if (!dateData) return null;
        
        let color;
        let label;
        switch (dateData.status) {
            case 'available':
                color = 'green';
                label = 'Trống';
                break;
            case 'booked':
                color = 'red';
                label = 'Đã đặt';
                break;
            case 'maintenance':
                color = 'orange';
                label = 'Bảo trì';
                break;
            default:
                color = 'default';
                label = dateData.status;
        }
        
        return (
            <div className="date-cell">
                <Tag color={color} size="small">
                    {label}
                </Tag>
                {dateData.price_override && (
                    <div style={{ fontSize: 11, color: '#faad14' }}>
                        Giá: {dateData.price_override.toLocaleString('vi-VN')}₫
                    </div>
                )}
            </div>
        );
    };

    const handleSelect = (date: Dayjs) => {
        if (updateMode === 'single') {
            setSelectedDateRange([date, null]);
        }
        // Chế độ range sẽ được xử lý bởi RangePicker
    };

    const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates) {
            setSelectedDateRange(dates);
        } else {
            setSelectedDateRange([null, null]);
        }
    };

    return (
        <Modal
            title={`Quản lý lịch phòng: ${room?.name}`}
            open={isModalOpen}
            onCancel={handleCancel}
            width={900}
            footer={[
                <Button key="generate" type="default" onClick={generateAvailability} loading={loading}>
                    Tạo lịch 3 tháng
                </Button>,
                <Button key="cancel" onClick={handleCancel}>
                    Đóng
                </Button>
            ]}
        >
            <div style={{ marginBottom: 16 }}>
                <Text strong>Chế độ cập nhật:</Text>
                <Space style={{ marginLeft: 8, marginBottom: 16 }}>
                    <Button 
                        type={updateMode === 'single' ? 'primary' : 'default'}
                        size="small"
                        onClick={() => {
                            setUpdateMode('single');
                            setSelectedDateRange([null, null]);
                        }}
                    >
                        Ngày đơn lẻ
                    </Button>
                    <Button 
                        type={updateMode === 'range' ? 'primary' : 'default'}
                        size="small"
                        onClick={() => {
                            setUpdateMode('range');
                            setSelectedDateRange([null, null]);
                        }}
                    >
                        Khoảng thời gian
                    </Button>
                </Space>

                {updateMode === 'single' ? (
                    <div>
                        <p>Chọn ngày trên lịch để thay đổi trạng thái phòng:</p>
                        {selectedDateRange[0] && (
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                                <span>Ngày {selectedDateRange[0].format('DD/MM/YYYY')}:</span>
                                <Select 
                                    value={selectedStatus}
                                    onChange={setSelectedStatus}
                                    style={{ width: 120 }}
                                    options={[
                                        { label: 'Trống', value: 'available' },
                                        { label: 'Đã đặt', value: 'booked' },
                                        { label: 'Bảo trì', value: 'maintenance' },
                                    ]}
                                />
                                <InputNumber
                                    placeholder="Giá override"
                                    min={0}
                                    style={{ width: 120 }}
                                    value={overridePrice ?? undefined}
                                    onChange={v => setOverridePrice(v ?? null)}
                                    formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                    parser={v => v ? v.replace(/\$\s?|(,*)/g, '') : ''}
                                />
                                <Button 
                                    type="primary" 
                                    onClick={handleUpdateAvailability}
                                    loading={loading}
                                >
                                    Cập nhật
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <p>Chọn khoảng thời gian để thay đổi trạng thái phòng:</p>
                        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                            <RangePicker 
                                value={selectedDateRange}
                                onChange={handleRangeChange}
                                format="DD/MM/YYYY"
                                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                                style={{ width: '100%' }}
                            />
                            {selectedDateRange[0] && selectedDateRange[1] && (
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <span>
                                        Từ {selectedDateRange[0].format('DD/MM/YYYY')} đến {selectedDateRange[1].format('DD/MM/YYYY')} 
                                        ({selectedDateRange[1].diff(selectedDateRange[0], 'day') + 1} ngày):
                                    </span>
                                    <Select 
                                        value={selectedStatus}
                                        onChange={setSelectedStatus}
                                        style={{ width: 120 }}
                                        options={[
                                            { label: 'Trống', value: 'available' },
                                            { label: 'Đã đặt', value: 'booked' },
                                            { label: 'Bảo trì', value: 'maintenance' },
                                        ]}
                                    />
                                    <InputNumber
                                        placeholder="Giá override"
                                        min={0}
                                        style={{ width: 120 }}
                                        value={overridePrice ?? undefined}
                                        onChange={v => setOverridePrice(v ?? null)}
                                        formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                        parser={v => v ? v.replace(/\$\s?|(,*)/g, '') : ''}
                                    />
                                    <Button 
                                        type="primary" 
                                        onClick={handleUpdateAvailability}
                                        loading={loading}
                                    >
                                        Cập nhật khoảng thời gian
                                    </Button>
                                </div>
                            )}
                        </Space>
                    </div>
                )}
            </div>
            
            <Calendar 
                fullscreen={false} 
                cellRender={dateCellRender}
                onSelect={updateMode === 'single' ? handleSelect : undefined}
                loading={loading}
            />
        </Modal>
    );
};

export default RoomAvailability;
