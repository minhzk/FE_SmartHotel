'use client'

import { Button, Descriptions, Divider, Modal, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { ROOM_AMENITIES } from "@/constants/room.constants";

const { Title, Text } = Typography;

interface IProps {
    isDetailModalOpen: boolean;
    setIsDetailModalOpen: (value: boolean) => void;
    room: any;
}

const RoomDetail = (props: IProps) => {
    const { isDetailModalOpen, setIsDetailModalOpen, room } = props;

    if (!room) return null;

    return (
        <Modal
            title={<Title level={4}>Chi tiết phòng</Title>}
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            width={700}
            footer={[
                <Button key="back" onClick={() => setIsDetailModalOpen(false)}>
                    Đóng
                </Button>
            ]}
        >
            <Descriptions title="Thông tin phòng" bordered column={2}>
                <Descriptions.Item label="Tên phòng" span={2}>
                    {room.name}
                </Descriptions.Item>
                <Descriptions.Item label="Loại phòng">
                    {room.room_type}
                </Descriptions.Item>
                <Descriptions.Item label="Giá/đêm">
                    <Text strong>{room.price_per_night?.toLocaleString('vi-VN')} VNĐ</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng phòng">
                    {room.number_of_rooms}
                </Descriptions.Item>
                <Descriptions.Item label="Sức chứa">
                    {room.capacity} người
                </Descriptions.Item>
                <Descriptions.Item label="Diện tích">
                    {room.size ? `${room.size} m²` : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={room.is_active ? 'blue' : 'default'}>
                        {room.is_active ? 'Hoạt động' : 'Không hoạt động'}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Có thể đặt">
                    <Tag color={room.is_bookable ? 'green' : 'red'}>
                        {room.is_bookable ? 'Có thể đặt' : 'Ngừng đặt'}
                    </Tag>
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Tiện ích</Divider>
            <Space wrap>
                {room.amenities && room.amenities.length > 0 ? (
                    room.amenities.map((amenity: string, index: number) => {
                        const amenityInfo = ROOM_AMENITIES.find(a => a.value === amenity);
                        return (
                            <Tag key={index} color="blue" icon={amenityInfo?.icon}>
                                {amenityInfo?.label || amenity}
                            </Tag>
                        );
                    })
                ) : (
                    <Text type="secondary">Không có thông tin về tiện ích</Text>
                )}
            </Space>

            <Divider orientation="left">Cấu hình giường</Divider>
            <Space wrap>
                {room.bed_configuration && room.bed_configuration.length > 0 ? (
                    room.bed_configuration.map((bed: any, index: number) => (
                        <Tag key={index} color="purple">
                            {bed.count} x {bed.type}
                        </Tag>
                    ))
                ) : (
                    <Text type="secondary">Không có thông tin về cấu hình giường</Text>
                )}
            </Space>

            <Divider orientation="left">Mô tả</Divider>
            <Text>{room.description || 'Không có mô tả'}</Text>
        </Modal>
    );
};

export default RoomDetail;