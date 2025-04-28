'use client'

import { Table, Button, Space, Tag, Popconfirm, message, Card, Input, Select, Tooltip, Image } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PictureOutlined, CalendarOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from "react";
import type { FilterDropdownProps, ColumnsType } from 'antd/es/table/interface';
import type { InputRef } from 'antd';
import Highlighter from 'react-highlight-words';
import RoomCreate from "./room.create";
import RoomUpdate from "./room.update";
import RoomAvailability from "./room.availability";
import { sendRequest } from "@/utils/api";
import { handleDeleteRoomAction } from "@/utils/actions";

interface IRoomTableProps {
    rooms?: IRoom[];
    meta?: IMetadata;
}

interface IRoom {
    _id: string;
    name: string;
    hotel_id: string;
    hotel_name?: string;
    room_type: string;
    price_per_night: number;
    capacity: number;
    description: string;
    images: IImage[];
    amenities: string[];
    size: number;
    max_adults: number;
    max_children: number;
    number_of_rooms: number;
    is_bookable: boolean;
    is_active: boolean;
}

interface IImage {
    url: string;
    description: string;
    cloudinary_id?: string;
}

interface IMetadata {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
}

const RoomTable = ({ rooms = [], meta = { current: 1, pageSize: 10, pages: 0, total: 0 } }: IRoomTableProps) => {
    const [dataSource, setDataSource] = useState<IRoom[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<IRoom | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [searchedColumn, setSearchedColumn] = useState<string>('');
    const [pagination, setPagination] = useState({
        current: meta.current,
        pageSize: meta.pageSize,
        total: meta.total
    });
    const [hotels, setHotels] = useState<any[]>([]);
    const searchInput = useRef<InputRef>(null);

    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState<boolean>(false);
    const [selectedRoomForAvailability, setSelectedRoomForAvailability] = useState<IRoom | null>(null);

    useEffect(() => {
        setDataSource(rooms);
        setPagination({
            ...pagination,
            total: meta.total
        });
    }, [rooms, meta]);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await sendRequest<IBackendRes<any>>({
                    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels`,
                    method: 'GET',
                    queryParams: { current: 1, pageSize: 100 }
                });
                
                if (res?.data) {
                    setHotels(res.data.results || []);
                }
            } catch (error) {
                console.error('Error fetching hotels:', error);
            }
        };
        
        fetchHotels();
    }, []);

    const handleUpdate = (record: IRoom) => {
        setDataUpdate(record);
        setIsUpdateModalOpen(true);
    };

    const confirmDelete = async (roomId: string) => {
        try {
            setLoading(true);
            await handleDeleteRoomAction(roomId);
            
            message.success('Xóa phòng thành công!');
            const newData = dataSource.filter(item => item._id !== roomId);
            setDataSource(newData);
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng!');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: string,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
            <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Xóa
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value: any, record: IRoom) =>
            record[dataIndex as keyof IRoom]
                ?.toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()) || false,
        onFilterDropdownOpenChange: (visible: boolean) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text: string) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleViewAvailability = (record: IRoom) => {
        setSelectedRoomForAvailability(record);
        setIsAvailabilityModalOpen(true);
    };

    const columns: ColumnsType<IRoom> = [
        {
            title: 'Tên phòng',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Ảnh',
            dataIndex: 'images',
            key: 'images',
            width: 100,
            render: (images: IImage[]) => {
                if (!images || images.length === 0) return <span>Chưa có ảnh</span>;
                return (
                    <Image 
                        src={images[0].url} 
                        alt="Room image" 
                        height={50} 
                        preview={{ 
                            src: images[0].url,
                            mask: <PictureOutlined />
                        }}
                    />
                )
            }
        },
        {
            title: 'Khách sạn',
            dataIndex: 'hotel_id',
            key: 'hotel_id',
            filters: hotels?.map(hotel => ({ text: hotel.name, value: hotel._id })),
            onFilter: (value: any, record: IRoom) => record.hotel_id === value,
            render: (hotel_id, record) => {
                const hotel = hotels.find(h => h._id === hotel_id);
                return hotel?.name || 'N/A';
            }
        },
        {
            title: 'Loại phòng',
            dataIndex: 'room_type',
            key: 'room_type',
            filters: [
                { text: 'Standard', value: 'standard' },
                { text: 'Deluxe', value: 'deluxe' },
                { text: 'Suite', value: 'suite' },
                { text: 'Family', value: 'family' },
                { text: 'Executive', value: 'executive' }
            ],
            onFilter: (value: any, record: IRoom) => record.room_type === value,
        },
        {
            title: 'Giá/đêm',
            dataIndex: 'price_per_night',
            key: 'price_per_night',
            sorter: (a, b) => a.price_per_night - b.price_per_night,
            render: (price) => price.toLocaleString('vi-VN') + ' ₫'
        },
        {
            title: 'Số người',
            dataIndex: 'capacity',
            key: 'capacity',
            filters: [
                { text: '1 người', value: 1 },
                { text: '2 người', value: 2 },
                { text: '3 người', value: 3 },
                { text: '4+ người', value: 4 }
            ],
            onFilter: (value: any, record: IRoom) => {
                if (value === 4) return record.capacity >= 4;
                return record.capacity === value;
            },
        },
        {
            title: 'Số phòng',
            dataIndex: 'number_of_rooms',
            key: 'number_of_rooms',
        },
        {
            title: 'Có thể đặt',
            dataIndex: 'is_bookable',
            key: 'is_bookable',
            filters: [
                { text: 'Có thể đặt', value: true },
                { text: 'Không thể đặt', value: false }
            ],
            onFilter: (value: any, record: IRoom) => record.is_bookable === value,
            render: (is_bookable) => (
                <Tag color={is_bookable ? 'green' : 'red'}>
                    {is_bookable ? 'Có thể đặt' : 'Ngừng đặt'}
                </Tag>
            ),
        },
        {
            title: 'Hoạt động',
            dataIndex: 'is_active',
            key: 'is_active',
            filters: [
                { text: 'Đang hoạt động', value: true },
                { text: 'Không hoạt động', value: false }
            ],
            onFilter: (value: any, record: IRoom) => record.is_active === value,
            render: (is_active) => (
                <Tag color={is_active ? 'blue' : 'default'}>
                    {is_active ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Lịch phòng">
                        <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={() => handleViewAvailability(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            type="primary" 
                            ghost 
                            icon={<EditOutlined />} 
                            onClick={() => handleUpdate(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa phòng này?"
                            onConfirm={() => confirmDelete(record._id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button 
                                danger 
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="Quản lý phòng"
            extra={
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Thêm phòng
                </Button>
            }
        >
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: (page, pageSize) => {
                        setPagination({
                            ...pagination,
                            current: page,
                            pageSize: pageSize || 10
                        });
                    }
                }}
            />

            <RoomCreate 
                isCreateModalOpen={isCreateModalOpen} 
                setIsCreateModalOpen={setIsCreateModalOpen} 
                hotels={hotels}
                onSuccess={() => {
                    window.location.reload();
                }}
            />

            <RoomUpdate 
                isUpdateModalOpen={isUpdateModalOpen} 
                setIsUpdateModalOpen={setIsUpdateModalOpen} 
                dataUpdate={dataUpdate} 
                setDataUpdate={setDataUpdate} 
                hotels={hotels}
                onSuccess={() => {
                    window.location.reload();
                }}
            />
            
            {selectedRoomForAvailability && (
                <RoomAvailability
                    isModalOpen={isAvailabilityModalOpen}
                    setIsModalOpen={setIsAvailabilityModalOpen}
                    room={selectedRoomForAvailability}
                />
            )}
        </Card>
    );
};

export default RoomTable;
