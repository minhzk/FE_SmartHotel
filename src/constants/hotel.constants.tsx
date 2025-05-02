import { ReactNode } from 'react';
import {
    WifiOutlined,
    CarOutlined,
    CoffeeOutlined,
    CustomerServiceOutlined,
    ShopOutlined,
    BankOutlined,
    HomeOutlined,
    ClockCircleOutlined,
    SkinOutlined,
    ControlOutlined,
    ShoppingOutlined,
    TeamOutlined,
    SafetyOutlined,
    EllipsisOutlined,
    ThunderboltOutlined,
    RocketOutlined,
    GlobalOutlined,
    LockOutlined,
    SmileOutlined,
    MedicineBoxOutlined,
} from '@ant-design/icons';

export interface AmenityOption {
    label: string;
    value: string;
    icon?: ReactNode;
}

export const HOTEL_AMENITIES: AmenityOption[] = [
    { label: 'WiFi', value: 'wifi', icon: <WifiOutlined /> },
    { label: 'Hồ bơi', value: 'pool', icon: <WifiOutlined /> },
    { label: 'Phòng gym', value: 'gym', icon: <ControlOutlined /> },
    { label: 'Nhà hàng', value: 'restaurant', icon: <ShopOutlined /> },
    { label: 'Bãi đỗ xe', value: 'parking', icon: <CarOutlined /> },
    { label: 'Spa', value: 'spa', icon: <SkinOutlined /> },
    { label: 'Điều hòa', value: 'ac', icon: <ThunderboltOutlined /> },
    {
        label: 'Dịch vụ phòng',
        value: 'room_service',
        icon: <CustomerServiceOutlined />,
    },
    {
        label: 'Trung tâm thương mại',
        value: 'business_center',
        icon: <ShoppingOutlined />,
    },
    { label: 'Giặt ủi', value: 'laundry', icon: <SkinOutlined /> },
    { label: 'Phòng họp', value: 'meeting_room', icon: <TeamOutlined /> },
    { label: 'Quầy bar', value: 'bar', icon: <ShopOutlined /> },
    { label: 'Bữa sáng', value: 'breakfast', icon: <CoffeeOutlined /> },
    {
        label: 'Đưa đón sân bay',
        value: 'airport_shuttle',
        icon: <RocketOutlined />,
    },
    {
        label: 'Lễ tân 24h',
        value: '24h_reception',
        icon: <ClockCircleOutlined />,
    },
    { label: 'Thang máy', value: 'elevator', icon: <BankOutlined /> },
    {
        label: 'Khu vực hút thuốc',
        value: 'smoking_area',
        icon: <GlobalOutlined />,
    },
    {
        label: 'Phòng không hút thuốc',
        value: 'non_smoking_rooms',
        icon: <LockOutlined />,
    },
    {
        label: 'Khu vui chơi trẻ em',
        value: 'kids_club',
        icon: <SmileOutlined />,
    },
    { label: 'Két an toàn', value: 'safety_box', icon: <SafetyOutlined /> },
    {
        label: 'Dịch vụ y tế',
        value: 'medical_service',
        icon: <MedicineBoxOutlined />,
    },
    { label: 'Tiện ích khác', value: 'other', icon: <EllipsisOutlined /> },
];
