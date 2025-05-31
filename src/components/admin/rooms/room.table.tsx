'use client'

import { Table, Button, Space, Tag, Popconfirm, message, Card, Input, Select, Tooltip, Image, Row, Col } from "antd";
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
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const { data: session } = useSession();

    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState<boolean>(false);
    const [selectedRoomForAvailability, setSelectedRoomForAvailability] = useState<IRoom | null>(null);

    // Filter state
    const [filterHotel, setFilterHotel] = useState<string>(searchParams.get('hotel_id') || '');
    const [filterRoomType, setFilterRoomType] = useState<string>(searchParams.get('room_type') || '');
    const [filterActive, setFilterActive] = useState<string>(searchParams.get('is_active') || '');
    const [filterBookable, setFilterBookable] = useState<string>(searchParams.get('is_bookable') || '');
    const [filterSearch, setFilterSearch] = useState<string>(searchParams.get('search') || '');

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

    // Fetch rooms when searchParams or session changes
    useEffect(() => {
        fetchRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, session]);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const queryParams: any = {};
            if (searchParams.has('current')) queryParams.current = searchParams.get('current');
            if (searchParams.has('pageSize')) queryParams.pageSize = searchParams.get('pageSize');
            if (searchParams.has('hotel_id')) queryParams.hotel_id = searchParams.get('hotel_id');
            if (searchParams.has('room_type')) queryParams.room_type = searchParams.get('room_type');
            if (searchParams.has('is_active')) queryParams.is_active = searchParams.get('is_active');
            if (searchParams.has('is_bookable')) queryParams.is_bookable = searchParams.get('is_bookable');
            if (searchParams.has('search')) queryParams.search = searchParams.get('search');
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms`,
                method: 'GET',
                queryParams,
                headers: session?.user?.access_token
                    ? { Authorization: `Bearer ${session.user.access_token}` }
                    : undefined,
            });
            if (res?.data) {
                setDataSource(res.data.results || []);
                setPagination({
                    ...pagination,
                    total: res.data.meta?.total || 0
                });
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            message.error('Không thể tải dữ liệu phòng');
        } finally {
            setLoading(false);
        }
    };

    // Handler for filter
    const handleFilter = () => {
        const params = new URLSearchParams(searchParams);
        if (filterHotel) params.set('hotel_id', filterHotel); else params.delete('hotel_id');
        if (filterRoomType) params.set('room_type', filterRoomType); else params.delete('room_type');
        if (filterActive) params.set('is_active', filterActive); else params.delete('is_active');
        if (filterBookable) params.set('is_bookable', filterBookable); else params.delete('is_bookable');
        if (filterSearch) params.set('search', filterSearch); else params.delete('search');
        params.set('current', '1');
        replace(`${pathname}?${params.toString()}`);
    };

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
                { text: 'Executive', value: 'executive' },
                { text: 'Family', value: 'family' },
                { text: 'Villa', value: 'villa' },
                { text: 'Bungalow', value: 'bungalow' },
                { text: 'Studio', value: 'studio' },
                { text: 'Connecting', value: 'connecting' },
                { text: 'Accessible', value: 'accessible' },
                { text: 'Penthouse', value: 'penthouse' },
                { text: 'Presidential', value: 'presidential' }
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

    // Gọi lại fetchRooms khi chuyển trang hoặc đổi pageSize
    useEffect(() => {
        fetchRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize]);

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
            {/* Bộ lọc phòng */}
            <Row gutter={[12, 8]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={6}>
                    <Select
                        placeholder="Khách sạn"
                        value={filterHotel || undefined}
                        onChange={v => setFilterHotel(v)}
                        allowClear
                        style={{ width: '100%' }}
                        options={hotels.map(h => ({ value: h._id, label: h.name }))}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Select
                        placeholder="Loại phòng"
                        value={filterRoomType || undefined}
                        onChange={v => setFilterRoomType(v)}
                        allowClear
                        style={{ width: '100%' }}
                        options={[
                            { value: 'Standard', label: 'Standard' },
                            { value: 'Deluxe', label: 'Deluxe' },
                            { value: 'Suite', label: 'Suite' },
                            { value: 'Executive', label: 'Executive' },
                            { value: 'Family', label: 'Family' },
                            { value: 'Villa', label: 'Villa' },
                            { value: 'Bungalow', label: 'Bungalow' },
                            { value: 'Studio', label: 'Studio' },
                            { value: 'Connecting', label: 'Connecting' },
                            { value: 'Accessible', label: 'Accessible' },
                            { value: 'Penthouse', label: 'Penthouse' },
                            { value: 'Presidential', label: 'Presidential' }
                        ]}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Select
                        placeholder="Hoạt động"
                        value={filterActive || undefined}
                        onChange={v => setFilterActive(v)}
                        allowClear
                        style={{ width: '100%' }}
                        options={[
                            { value: 'true', label: 'Hoạt động' },
                            { value: 'false', label: 'Không hoạt động' }
                        ]}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Select
                        placeholder="Có thể đặt"
                        value={filterBookable || undefined}
                        onChange={v => setFilterBookable(v)}
                        allowClear
                        style={{ width: '100%' }}
                        options={[
                            { value: 'true', label: 'Có thể đặt' },
                            { value: 'false', label: 'Ngừng đặt' }
                        ]}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Input
                        placeholder="Tìm kiếm tên phòng"
                        value={filterSearch}
                        onChange={e => setFilterSearch(e.target.value)}
                        allowClear
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Button icon={<SearchOutlined />} type="primary" onClick={handleFilter} block>
                        Lọc
                    </Button>
                </Col>
            </Row>
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
                onSuccess={() => fetchRooms()}
            />

            <RoomUpdate 
                isUpdateModalOpen={isUpdateModalOpen} 
                setIsUpdateModalOpen={setIsUpdateModalOpen} 
                dataUpdate={dataUpdate} 
                setDataUpdate={setDataUpdate} 
                hotels={hotels}
                onSuccess={() => fetchRooms()}
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
