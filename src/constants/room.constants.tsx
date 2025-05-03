import { ReactNode } from 'react';
import {
    FaWifi, FaConciergeBell, FaSnowflake, FaShoppingBag,
    FaSpa, FaDollarSign, FaLaptop, FaCoffee, FaTable,
    FaShieldAlt, FaExpand, FaGlobe, FaDumbbell, FaPaintBrush,
    FaHome, FaCrown, FaChevronRight
} from 'react-icons/fa';
import { TbAirConditioning } from "react-icons/tb";

import { MdTv, MdRoomService, MdBalcony, MdOutlineBathtub } from 'react-icons/md';
import { GiHanger, GiToothbrush, GiIronCross, GiCoffeeCup, GiMountainClimbing } from 'react-icons/gi';
import { BsFillDoorClosedFill, BsAlarm } from 'react-icons/bs';
import { ImCool } from 'react-icons/im';
import { BiSolidHotel } from 'react-icons/bi';
import { PiHairDryer } from "react-icons/pi";

export interface RoomAmenityOption {
    label: string;
    value: string;
    icon?: ReactNode;
}

export const ROOM_AMENITIES: RoomAmenityOption[] = [
    { label: 'WiFi', value: 'wifi', icon: <FaWifi /> },
    { label: 'TV', value: 'tv', icon: <MdTv /> },
    { label: 'Điều hòa', value: 'ac', icon: <TbAirConditioning /> },
    { label: 'Minibar', value: 'minibar', icon: <GiCoffeeCup /> },
    { label: 'Két an toàn', value: 'safe', icon: <FaShieldAlt /> },
    { label: 'Ban công', value: 'balcony', icon: <MdBalcony /> },
    { label: 'Bồn tắm', value: 'bathtub', icon: <MdOutlineBathtub /> },
    { label: 'Máy sấy tóc', value: 'hairdryer', icon: <PiHairDryer /> },
    {
        label: 'Bàn làm việc',
        value: 'workspace',
        icon: <FaTable />,
    },
    {
        label: 'Dịch vụ phòng',
        value: 'room_service',
        icon: <MdRoomService />,
    },
    { label: 'Tủ quần áo', value: 'wardrobe', icon: <GiHanger /> },
    {
        label: 'Đồ dùng phòng tắm miễn phí',
        value: 'toiletries',
        icon: <GiToothbrush />,
    },
    { label: 'Bàn là/ủi', value: 'iron', icon: <GiIronCross /> },
    {
        label: 'Máy pha cà phê/trà',
        value: 'coffee_maker',
        icon: <FaCoffee />,
    },
    { label: 'View đẹp', value: 'nice_view', icon: <GiMountainClimbing /> },
    {
        label: 'Phòng tắm riêng',
        value: 'private_bathroom',
        icon: <BsFillDoorClosedFill />,
    },
    { label: 'Máy tính', value: 'computer', icon: <FaLaptop /> },
    { label: 'Máy lạnh', value: 'air_purifier', icon: <ImCool /> },
    {
        label: 'Dịch vụ đánh thức',
        value: 'wake_up_service',
        icon: <BsAlarm />,
    },
    {
        label: 'Bữa sáng tại phòng',
        value: 'breakfast_in_room',
        icon: <BiSolidHotel />,
    },
    { label: 'VIP', value: 'vip_services', icon: <FaCrown /> },
    {
        label: 'Đồ dùng cao cấp',
        value: 'premium_amenities',
        icon: <FaShoppingBag />,
    },
];
