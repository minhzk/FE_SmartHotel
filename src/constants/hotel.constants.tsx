import { ReactNode } from 'react';
import { 
    FaWifi, FaSwimmingPool, FaDumbbell, FaUtensils, FaParking,
    FaSpa, FaSnowflake, FaConciergeBell, FaBriefcase, 
    FaTshirt, FaUsers, FaGlassMartiniAlt, FaCoffee, FaPlane,
    FaClock, FaSmoking, FaSmokingBan, FaChild,
    FaLock, FaFirstAid, FaEllipsisH, FaShoppingCart
} from 'react-icons/fa';
import { TbAirConditioning } from "react-icons/tb";
import { MdRoom, MdAirplanemodeActive, MdOutlineElevator } from 'react-icons/md';
import { GiVacuumCleaner } from 'react-icons/gi';

export interface AmenityOption {
    label: string;
    value: string;
    icon?: ReactNode;
}

export const HOTEL_AMENITIES: AmenityOption[] = [
    { label: 'WiFi', value: 'wifi', icon: <FaWifi /> },
    { label: 'Hồ bơi', value: 'pool', icon: <FaSwimmingPool /> },
    { label: 'Phòng gym', value: 'gym', icon: <FaDumbbell /> },
    { label: 'Nhà hàng', value: 'restaurant', icon: <FaUtensils /> },
    { label: 'Bãi đỗ xe', value: 'parking', icon: <FaParking /> },
    { label: 'Spa', value: 'spa', icon: <FaSpa /> },
    { label: 'Điều hòa', value: 'ac', icon: <TbAirConditioning /> },
    {
        label: 'Dịch vụ phòng',
        value: 'room_service',
        icon: <FaConciergeBell />,
    },
    {
        label: 'Trung tâm thương mại',
        value: 'business_center',
        icon: <FaShoppingCart />,
    },
    { label: 'Giặt ủi', value: 'laundry', icon: <FaTshirt /> },
    { label: 'Phòng họp', value: 'meeting_room', icon: <FaUsers /> },
    { label: 'Quầy bar', value: 'bar', icon: <FaGlassMartiniAlt /> },
    { label: 'Bữa sáng', value: 'breakfast', icon: <FaCoffee /> },
    {
        label: 'Đưa đón sân bay',
        value: 'airport_shuttle',
        icon: <MdAirplanemodeActive />,
    },
    {
        label: 'Lễ tân 24h',
        value: '24h_reception',
        icon: <FaClock />,
    },
    { label: 'Thang máy', value: 'elevator', icon: <MdOutlineElevator /> },
    {
        label: 'Khu vực hút thuốc',
        value: 'smoking_area',
        icon: <FaSmoking />,
    },
    {
        label: 'Phòng không hút thuốc',
        value: 'non_smoking_rooms',
        icon: <FaSmokingBan />,
    },
    {
        label: 'Khu vui chơi trẻ em',
        value: 'kids_club',
        icon: <FaChild />,
    },
    { label: 'Két an toàn', value: 'safety_box', icon: <FaLock /> },
    {
        label: 'Dịch vụ y tế',
        value: 'medical_service',
        icon: <FaFirstAid />,
    },
    { label: 'Tiện ích khác', value: 'other', icon: <FaEllipsisH /> },
];
