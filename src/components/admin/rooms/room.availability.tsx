'use client'

import { Button, Calendar, Modal, Select, Tooltip, Tag, message } from "antd";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { handleGenerateRoomAvailabilityAction, handleUpdateRoomAvailabilityStatusAction } from "@/utils/actions";
import { auth } from "@/auth";
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

interface IRoomAvailabilityProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    room: any;
}

const RoomAvailability = ({ isModalOpen, setIsModalOpen, room }: IRoomAvailabilityProps) => {
    const [availabilityData, setAvailabilityData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('available');

    useEffect(() => {
        if (isModalOpen && room?._id) {
            fetchAvailabilityData();
        }
    }, [isModalOpen, room]);

    const fetchAvailabilityData = async () => {
        if (!room?._id) return;
        
        setLoading(true);
        try {
            const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
            const endDate = dayjs().endOf('month').add(2, 'month').format('YYYY-MM-DD');
            
            const session = await auth();
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/room-availability/room/${room._id}/date-range?startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session?.user?.access_token}`,
                }
            });
            
            if (!res.ok) {
                throw await res.json();
            }
            
            const data = await res.json();
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
        setSelectedDate(null);
        setSelectedStatus('available');
    };

    const handleUpdateAvailability = async () => {
        if (!selectedDate || !room?._id) return;
        
        try {
            setLoading(true);
            
            await handleUpdateRoomAvailabilityStatusAction({
                roomId: room._id,
                startDate: selectedDate.format('YYYY-MM-DD'),
                endDate: selectedDate.format('YYYY-MM-DD'),
                status: selectedStatus
            });
            
            message.success('Cập nhật trạng thái phòng thành công!');
            fetchAvailabilityData();
            setSelectedDate(null);
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
        const dateData = availabilityData.find(item => 
            dayjs(item.date).format('YYYY-MM-DD') === dateStr
        );
        
        if (!dateData) return null;
        
        let color;
        switch (dateData.status) {
            case 'available':
                color = 'green';
                break;
            case 'booked':
                color = 'red';
                break;
            case 'maintenance':
                color = 'orange';
                break;
            default:
                color = 'default';
        }
        
        return (
            <div className="date-cell">
                <Tag color={color}>
                    {dateData.status === 'available' ? 'Trống' : 
                     dateData.status === 'booked' ? 'Đã đặt' : 'Bảo trì'}
                </Tag>
            </div>
        );
    };

    const handleSelect = (date: Dayjs) => {
        setSelectedDate(date);
    };

    return (
        <Modal
            title={`Quản lý lịch phòng: ${room?.name}`}
            open={isModalOpen}
            onCancel={handleCancel}
            width={800}
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
                <p>Chọn ngày trên lịch để thay đổi trạng thái phòng:</p>
                {selectedDate && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                        <span>Ngày {selectedDate.format('DD/MM/YYYY')}:</span>
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
            
            <Calendar 
                fullscreen={false} 
                cellRender={dateCellRender}
                onSelect={handleSelect}
                loading={loading}
            />
        </Modal>
    );
};

export default RoomAvailability;
