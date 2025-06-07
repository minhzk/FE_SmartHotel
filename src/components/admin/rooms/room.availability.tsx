'use client'

import { Button, Calendar, Modal, Select, Tooltip, Tag, message } from "antd";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { handleGenerateRoomAvailabilityAction, handleUpdateRoomAvailabilityStatusAction } from "@/utils/actions";
import { RoomAvailabilityService } from "@/services/room-availability.service";
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
        setSelectedDate(null);
        setSelectedStatus('available');
    };

    const handleUpdateAvailability = async () => {
        if (!selectedDate || !room?._id) return;
        
        try {
            setLoading(true);

            console.log('updating room availability for:', room._id, 'on', selectedDate.format('YYYY-MM-DD'), 'to', selectedStatus);
            
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
        const dateData = availabilityData.find(item => {
            // Use start_date instead of date field
            const itemDateStr = dayjs(item.start_date).format('YYYY-MM-DD');
            return itemDateStr === dateStr;
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
