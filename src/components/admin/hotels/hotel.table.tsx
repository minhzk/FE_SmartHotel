'use client'
import { handleDeleteHotelAction } from "@/utils/actions";
import { DeleteTwoTone, EditTwoTone, EyeTwoTone, SearchOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Table, Tag, Image, Input, Select, Row, Col, Card } from "antd";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import HotelCreate from "./hotel.create";
import HotelUpdate from "./hotel.update";
import HotelDetail from "./hotel.detail";

interface IProps {
    hotels: any[];
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    }
}

const HotelTable = (props: IProps) => {
    const { hotels = [], meta = { current: 1, pageSize: 10, pages: 0, total: 0 } } = props;
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const { data: session } = useSession();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [selectedHotel, setSelectedHotel] = useState<any>(null);
    const [hotelsState, setHotelsState] = useState<any[]>(hotels);
    const [metaState, setMetaState] = useState(meta);
    const [loading, setLoading] = useState<boolean>(false);

    // Filter state
    const [filterName, setFilterName] = useState<string>(searchParams.get('name') || '');
    const [filterCity, setFilterCity] = useState<string>(searchParams.get('city') || '');
    const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('is_active') || '');
    const [filterRating, setFilterRating] = useState<string>(searchParams.get('rating') || '');
    const [filterSentimentScore, setFilterSentimentScore] = useState<string>(searchParams.get('sentiment_score') || '');
    const [filterMinPrice, setFilterMinPrice] = useState<string>(searchParams.get('min_price') || '');
    const [filterMaxPrice, setFilterMaxPrice] = useState<string>(searchParams.get('max_price') || '');
    const [filterCapacity, setFilterCapacity] = useState<string>(searchParams.get('capacity') || '');
    const [filterSearch, setFilterSearch] = useState<string>(searchParams.get('search') || '');
    const [filterAdults, setFilterAdults] = useState<string>(searchParams.get('adults') || '');
    const [filterChildren, setFilterChildren] = useState<string>(searchParams.get('children') || '');
    const [filterCheckIn, setFilterCheckIn] = useState<string>(searchParams.get('check_in') || '');
    const [filterCheckOut, setFilterCheckOut] = useState<string>(searchParams.get('check_out') || '');

    // Fetch hotels when search params or session change
    useEffect(() => {
        fetchHotels();
    }, [searchParams, session]);

    const fetchHotels = async () => {
        if (!session?.user?.access_token) return;
        setLoading(true);
        try {
            const queryParams: any = {};
            // Pagination params
            if (searchParams.has('current')) queryParams.current = searchParams.get('current');
            if (searchParams.has('pageSize')) queryParams.pageSize = searchParams.get('pageSize');
            // Filter params
            if (searchParams.has('name')) queryParams.name = searchParams.get('name');
            if (searchParams.has('city')) queryParams.city = searchParams.get('city');
            if (searchParams.has('is_active')) queryParams.is_active = searchParams.get('is_active');
            if (searchParams.has('rating')) queryParams.rating = searchParams.get('rating');
            if (searchParams.has('sentiment_score')) queryParams.sentiment_score = searchParams.get('sentiment_score');
            if (searchParams.has('min_price')) queryParams.min_price = searchParams.get('min_price');
            if (searchParams.has('max_price')) queryParams.max_price = searchParams.get('max_price');
            if (searchParams.has('capacity')) queryParams.capacity = searchParams.get('capacity');
            if (searchParams.has('search')) queryParams.search = searchParams.get('search');
            if (searchParams.has('adults')) queryParams.adults = searchParams.get('adults');
            if (searchParams.has('children')) queryParams.children = searchParams.get('children');
            // Call API
            const res = await sendRequest({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels`,
                method: 'GET',
                queryParams,
                headers: session?.user?.access_token
                    ? { Authorization: `Bearer ${session.user.access_token}` }
                    : undefined,
            });
            if (res?.data) {
                setHotelsState(res.data.results || []);
                setMetaState(res.data.meta || meta);
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error fetching hotels:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handler for filter
    const handleFilter = () => {
        const params = new URLSearchParams(searchParams);
        if (filterName) params.set('name', filterName); else params.delete('name');
        if (filterCity) params.set('city', filterCity); else params.delete('city');
        if (filterStatus) params.set('is_active', filterStatus); else params.delete('is_active');
        if (filterRating) params.set('rating', filterRating); else params.delete('rating');
        if (filterSentimentScore) params.set('sentiment_score', filterSentimentScore); else params.delete('sentiment_score');
        if (filterMinPrice) params.set('min_price', filterMinPrice); else params.delete('min_price');
        if (filterMaxPrice) params.set('max_price', filterMaxPrice); else params.delete('max_price');
        if (filterCapacity) params.set('capacity', filterCapacity); else params.delete('capacity');
        if (filterSearch) params.set('search', filterSearch); else params.delete('search');
        if (filterAdults) params.set('adults', filterAdults); else params.delete('adults');
        if (filterChildren) params.set('children', filterChildren); else params.delete('children');
        params.set('current', '1');
        replace(`${pathname}?${params.toString()}`);
    };

    const columns = [
        {
            title: "STT",
            render: (_: any, __: any, index: any) => {
                return (
                    <>{(index + 1) + (meta.current - 1) * (meta.pageSize)}</>
                )
            }
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            render: (images: Array<{ url: string, description: string }>) => (
                <Image
                    width={100}
                    src={images && images.length > 0 ? images[0].url : 'https://via.placeholder.com/100'}
                    preview={true}
                    alt={images && images.length > 0 ? images[0].description : 'Hotel image'}
                    title={images && images.length > 0 ? images[0].description : ''}
                />
            )
        },
        {
            title: 'Tên khách sạn',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Thành phố',
            dataIndex: 'city',
            key: 'city',
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number) => `${rating} sao`
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (is_active: boolean) => (
                <Tag color={is_active ? 'green' : 'red'}>
                    {is_active ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            render: (_: any, record: any) => {
                return (
                    <>
                        <EyeTwoTone
                            twoToneColor="#1890ff" 
                            style={{ cursor: "pointer", marginRight: "20px" }}
                            onClick={() => {
                                setSelectedHotel(record);
                                setIsDetailModalOpen(true);
                            }}
                        />
                        <EditTwoTone
                            twoToneColor="#f57800" 
                            style={{ cursor: "pointer", margin: "0 20px" }}
                            onClick={() => {
                                setIsUpdateModalOpen(true);
                                setDataUpdate(record);
                            }}
                        />
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa khách sạn"}
                            description={"Bạn có chắc chắn muốn xóa khách sạn này?"}
                            onConfirm={async () => await handleDeleteHotelAction(record?._id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer" }}>
                                <DeleteTwoTone twoToneColor="#ff4d4f" />
                            </span>
                        </Popconfirm>
                    </>
                )
            }
        }
    ];

    const onChange = (pagination: any) => {
        if (pagination && pagination.current) {
            const params = new URLSearchParams(searchParams);
            params.set('current', pagination.current);
            replace(`${pathname}?${params.toString()}`);
        }
    };

    return (
        <>
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 20
            }}>
                <span>Quản lý khách sạn</span>
                <Button onClick={() => setIsCreateModalOpen(true)}>Thêm mới</Button>
            </div>

            {/* Bộ lọc quản lý hotel */}
            <div style={{ marginBottom: 16 }}>
                <Row gutter={[12, 8]}>
                    {/* Hàng 1 */}
                    <Col xs={24} sm={24} md={12} lg={6}>
                        <Input
                            placeholder="Tìm kiếm chung"
                            value={filterSearch}
                            onChange={e => setFilterSearch(e.target.value)}
                            allowClear
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={6}>
                        <Input
                            placeholder="Tên khách sạn"
                            value={filterName}
                            onChange={e => setFilterName(e.target.value)}
                            allowClear
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Select
                            placeholder="Thành phố"
                            value={filterCity || undefined}
                            onChange={v => setFilterCity(v)}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="ha noi">Hà Nội</Select.Option>
                            <Select.Option value="ho chi minh">Hồ Chí Minh</Select.Option>
                            <Select.Option value="da nang">Đà Nẵng</Select.Option>
                            <Select.Option value="nha trang">Nha Trang</Select.Option>
                            <Select.Option value="da lat">Đà Lạt</Select.Option>
                            <Select.Option value="phu quoc">Phú Quốc</Select.Option>
                            <Select.Option value="hue">Huế</Select.Option>
                            <Select.Option value="quy nhon">Quy Nhơn</Select.Option>
                            <Select.Option value="vung tau">Vũng Tàu</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Select
                            placeholder="Trạng thái"
                            value={filterStatus || undefined}
                            onChange={v => setFilterStatus(v)}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="true">Hoạt động</Select.Option>
                            <Select.Option value="false">Không hoạt động</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Select
                            placeholder="Đánh giá"
                            value={filterRating || undefined}
                            onChange={v => setFilterRating(v)}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="5">5 sao</Select.Option>
                            <Select.Option value="4">4 sao</Select.Option>
                            <Select.Option value="3">3 sao</Select.Option>
                            <Select.Option value="2">2 sao</Select.Option>
                            <Select.Option value="1">1 sao</Select.Option>
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[12, 8]} style={{ marginTop: 8 }}>
                    {/* Hàng 2 */}
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Input
                            placeholder="Sức chứa"
                            value={filterCapacity}
                            onChange={e => setFilterCapacity(e.target.value)}
                            allowClear
                            type="number"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Input
                            placeholder="Giá tối thiểu"
                            value={filterMinPrice}
                            onChange={e => setFilterMinPrice(e.target.value)}
                            allowClear
                            type="number"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Input
                            placeholder="Giá tối đa"
                            value={filterMaxPrice}
                            onChange={e => setFilterMaxPrice(e.target.value)}
                            allowClear
                            type="number"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Input
                            placeholder="Người lớn"
                            value={filterAdults}
                            onChange={e => setFilterAdults(e.target.value)}
                            allowClear
                            type="number"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Input
                            placeholder="Trẻ em"
                            value={filterChildren}
                            onChange={e => setFilterChildren(e.target.value)}
                            allowClear
                            type="number"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Select
                            placeholder="Lọc theo cảm xúc"
                            value={filterSentimentScore || undefined}
                            onChange={setFilterSentimentScore}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="10">Hoàn hảo (10)</Select.Option>
                            <Select.Option value="9">Tuyệt vời (9+)</Select.Option>
                            <Select.Option value="8">Xuất sắc (8+)</Select.Option>
                            <Select.Option value="7">Rất tốt (7+)</Select.Option>
                            <Select.Option value="6">Hài lòng (6+)</Select.Option>
                            <Select.Option value="5">Trung bình (5+)</Select.Option>
                            <Select.Option value="4">Tệ (4+)</Select.Option>
                            <Select.Option value="3">Rất tệ (3+)</Select.Option>
                            <Select.Option value="2">Kém (2+)</Select.Option>
                            <Select.Option value="1">Rất kém (1+)</Select.Option>
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[12, 8]} style={{ marginTop: 8 }}>
                    <Button icon={<SearchOutlined />} type="primary" onClick={handleFilter} block>
                        Lọc
                    </Button>
                </Row>
                
            </div>

            <Table
                bordered
                dataSource={hotelsState}
                columns={columns}
                rowKey={"_id"}
                loading={loading}
                pagination={
                    {
                        current: metaState.current,
                        pageSize: metaState.pageSize,
                        showSizeChanger: true,
                        total: metaState.total,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} kết quả</div>) }
                    }
                }
                onChange={onChange}
            />

            <HotelCreate
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
            />

            <HotelUpdate
                isUpdateModalOpen={isUpdateModalOpen}
                setIsUpdateModalOpen={setIsUpdateModalOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
            />

            <HotelDetail
                isDetailModalOpen={isDetailModalOpen}
                setIsDetailModalOpen={setIsDetailModalOpen}
                hotel={selectedHotel}
            />
        </>
    )
}

export default HotelTable;
