import { ReactNode } from 'react';
import {
    WifiOutlined,
    CustomerServiceOutlined,
    ThunderboltOutlined,
    ShoppingOutlined,
    SkinOutlined,
    DollarOutlined,
    LaptopOutlined,
    CoffeeOutlined,
    BorderlessTableOutlined,
    SecurityScanOutlined,
    FullscreenExitOutlined,
    GlobalOutlined,
    ControlOutlined,
    BgColorsOutlined,
    HomeFilled,
    CrownOutlined,
    PictureOutlined,
    SlackOutlined,
    GatewayOutlined,
    DeploymentUnitOutlined,
} from '@ant-design/icons';

export interface RoomAmenityOption {
    label: string;
    value: string;
    icon?: ReactNode;
}

export const ROOM_AMENITIES: RoomAmenityOption[] = [
    { label: 'WiFi', value: 'wifi', icon: <WifiOutlined /> },
    { label: 'TV', value: 'tv', icon: <PictureOutlined /> },
    { label: 'Điều hòa', value: 'ac', icon: <ThunderboltOutlined /> },
    { label: 'Minibar', value: 'minibar', icon: <CoffeeOutlined /> },
    { label: 'Két an toàn', value: 'safe', icon: <SecurityScanOutlined /> },
    { label: 'Ban công', value: 'balcony', icon: <FullscreenExitOutlined /> },
    { label: 'Bồn tắm', value: 'bathtub', icon: <SkinOutlined /> },
    { label: 'Máy sấy tóc', value: 'hairdryer', icon: <BgColorsOutlined /> },
    {
        label: 'Bàn làm việc',
        value: 'workspace',
        icon: <BorderlessTableOutlined />,
    },
    {
        label: 'Dịch vụ phòng',
        value: 'room_service',
        icon: <CustomerServiceOutlined />,
    },
    { label: 'Tủ quần áo', value: 'wardrobe', icon: <HomeFilled /> },
    {
        label: 'Đồ dùng phòng tắm miễn phí',
        value: 'toiletries',
        icon: <GatewayOutlined />,
    },
    { label: 'Bàn là/ủi', value: 'iron', icon: <SlackOutlined /> },
    {
        label: 'Máy pha cà phê/trà',
        value: 'coffee_maker',
        icon: <CoffeeOutlined />,
    },
    { label: 'View đẹp', value: 'nice_view', icon: <GlobalOutlined /> },
    {
        label: 'Phòng tắm riêng',
        value: 'private_bathroom',
        icon: <DeploymentUnitOutlined />,
    },
    { label: 'Máy tính', value: 'computer', icon: <LaptopOutlined /> },
    { label: 'Máy lạnh', value: 'air_purifier', icon: <ControlOutlined /> },
    {
        label: 'Dịch vụ đánh thức',
        value: 'wake_up_service',
        icon: <CustomerServiceOutlined />,
    },
    {
        label: 'Bữa sáng tại phòng',
        value: 'breakfast_in_room',
        icon: <DollarOutlined />,
    },
    { label: 'VIP', value: 'vip_services', icon: <CrownOutlined /> },
    {
        label: 'Đồ dùng cao cấp',
        value: 'premium_amenities',
        icon: <ShoppingOutlined />,
    },
];
