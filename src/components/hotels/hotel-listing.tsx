'use client';

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Row, Col, Typography, Space, Pagination, Spin, Select, Checkbox, Rate, Input, Button, Empty, Divider, Breadcrumb, DatePicker } from "antd";
import { FilterOutlined, HomeOutlined } from "@ant-design/icons";
import { sendRequest } from "@/utils/api";
import HotelCard from "./hotel-card";
import queryString from 'query-string';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface IHotelListingProps {
  session: any;
}

const HotelListing = ({ session }: IHotelListingProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [hotels, setHotels] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  
  // Filters
  const [search, setSearch] = useState<string>(searchParams?.get('search') || '');
  const [name, setName] = useState<string>(searchParams?.get('name') || '');
  const [city, setCity] = useState<string>(searchParams?.get('city') || '');
  const [rating, setRating] = useState<number | null>(
    searchParams?.get('rating') ? Number(searchParams.get('rating')) : null
  );
  const [sentimentScore, setSentimentScore] = useState<number | null>(
    searchParams?.get('sentiment_score') ? Number(searchParams.get('sentiment_score')) : null
  );
  const [minPrice, setMinPrice] = useState<number | null>(
    searchParams?.get('min_price') ? Number(searchParams.get('min_price')) : null
  );
  const [maxPrice, setMaxPrice] = useState<number | null>(
    searchParams?.get('max_price') ? Number(searchParams.get('max_price')) : null
  );
  const [capacity, setCapacity] = useState<number | null>(
    searchParams?.get('capacity') ? Number(searchParams.get('capacity')) : null
  );
  const [adults, setAdults] = useState<number | null>(
    searchParams?.get('adults') ? Number(searchParams.get('adults')) : null
  );
  const [children, setChildren] = useState<number | null>(
    searchParams?.get('children') ? Number(searchParams.get('children')) : null
  );
  const [current, setCurrent] = useState<number>(
    searchParams?.get('current') ? Number(searchParams.get('current')) : 1
  );
  const [sortBy, setSortBy] = useState<string>(searchParams?.get('sortBy') || 'rating_desc');
  const [checkIn, setCheckIn] = useState<string | null>(
    searchParams?.get('check_in') || null
  );
  const [checkOut, setCheckOut] = useState<string | null>(
    searchParams?.get('check_out') || null
  );
  const [dateRange, setDateRange] = useState<any>(
    checkIn && checkOut 
      ? [dayjs(checkIn), dayjs(checkOut)] 
      : null
  );
  
  // State cho input debouncing - dữ liệu người dùng đang nhập
  const [searchInput, setSearchInput] = useState<string>(search);
  const [nameInput, setNameInput] = useState<string>(name);
  const [minPriceInput, setMinPriceInput] = useState<string>(minPrice?.toString() || '');
  const [maxPriceInput, setMaxPriceInput] = useState<string>(maxPrice?.toString() || '');
  const [capacityInput, setCapacityInput] = useState<string>(capacity?.toString() || '');
  const [adultsInput, setAdultsInput] = useState<string>(adults?.toString() || '');
  const [childrenInput, setChildrenInput] = useState<string>(children?.toString() || '');

  // Tạo các hàm debounced để cập nhật state chính
  const updateSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
    }, 500),
    []
  );

  const updateName = useCallback(
    debounce((value: string) => {
      setName(value);
    }, 500),
    []
  );

  const updateMinPrice = useCallback(
    debounce((value: number | null) => {
      setMinPrice(value);
    }, 500),
    []
  );

  const updateMaxPrice = useCallback(
    debounce((value: number | null) => {
      setMaxPrice(value);
    }, 500),
    []
  );

  const updateCapacity = useCallback(
    debounce((value: number | null) => {
      setCapacity(value);
    }, 500),
    []
  );

  // Hàm chuẩn hóa văn bản trước khi tìm kiếm
  const normalizeSearchText = (text: string): string => {
    if (!text) return '';
    
    return text.trim()
      .replace(/\s+/g, ' ');
  };

  // Effect để cập nhật URL khi các giá trị filter thay đổi
  useEffect(() => {
    const params: any = {};
    
    if (search) params.search = search;
    if (name) params.name = normalizeSearchText(name);
    if (city) params.city = city;
    if (rating) params.rating = rating;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (capacity) params.capacity = capacity;
    if (adults) params.adults = adults;
    if (children) params.children = children;
    if (checkIn) params.check_in = checkIn;
    if (checkOut) params.check_out = checkOut;
    if (sortBy) params.sortBy = sortBy;
    if (sentimentScore) params.sentiment_score = sentimentScore;
    params.current = current;
    
    const queryStr = queryString.stringify(params);
    router.push(`/hotels?${queryStr}`);
  }, [search, name, city, rating, minPrice, maxPrice, capacity, adults, children, checkIn, checkOut, sortBy, current, sentimentScore]);

  // Load data khi component mount và khi các filter thay đổi
  useEffect(() => {
    fetchHotels();
  }, [current, sortBy, city, rating, minPrice, maxPrice, capacity, search, name, adults, children, checkIn, checkOut, sentimentScore]);
  
  // Xử lý thay đổi range ngày
  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const startDate = dates[0]?.format('YYYY-MM-DD');
      const endDate = dates[1]?.format('YYYY-MM-DD');
      setDateRange(dates);
      setCheckIn(startDate);
      setCheckOut(endDate);
    } else {
      setDateRange(null);
      setCheckIn(null);
      setCheckOut(null);
    }
  };

  // Hàm lấy danh sách khách sạn từ API
  const fetchHotels = async () => {
    setLoading(true);
    
    const queryParams: any = {
      current,
      pageSize: 5,
    };
    
    if (search) queryParams.search = normalizeSearchText(search);
    if (name) queryParams.name = normalizeSearchText(name);
    if (city) queryParams.city = city;
    if (rating) queryParams.rating = rating;
    if (sentimentScore) queryParams.sentiment_score = sentimentScore;
    if (minPrice) queryParams.min_price = minPrice;
    if (maxPrice) queryParams.max_price = maxPrice;
    if (capacity) queryParams.capacity = capacity;
    if (adults) queryParams.adults = adults;
    if (children) queryParams.children = children;
    if (checkIn) queryParams.check_in = checkIn;
    if (checkOut) queryParams.check_out = checkOut;
    if (sortBy) queryParams.sortBy = sortBy;
    
    try {
      const res = await sendRequest<IBackendRes<IModelPaginate<any>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/hotels`,
        method: "GET",
        queryParams,
        headers: session?.user?.access_token ? {
          Authorization: `Bearer ${session?.user?.access_token}`,
        } : undefined
      });
      
      if (res?.data) {
        setHotels(res.data.results || []);
        setMeta(res.data.meta || {});
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset các bộ lọc
  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setNameInput('');
    setName('');
    setCity('');
    setRating(null);
    setMinPriceInput('');
    setMinPrice(null);
    setMaxPriceInput('');
    setMaxPrice(null);
    setCapacityInput('');
    setCapacity(null);
    setAdultsInput('');
    setAdults(null);
    setChildrenInput('');
    setChildren(null);
    setDateRange(null);
    setCheckIn(null);
    setCheckOut(null);
    setSortBy('rating_desc');
    setCurrent(1);
    router.push('/hotels');
  };

  return (
    <div className="hotel-listing-container">
      <Breadcrumb 
        items={[
          { title: <HomeOutlined />, href: '/' },
          { title: 'Khách sạn' },
        ]}
        style={{ marginBottom: 16 }}
      />
      
      <Title level={2}>Danh Sách Khách Sạn</Title>
      
      <Row gutter={[24, 24]}>
        {/* Bộ lọc khách sạn */}
        <Col xs={24} sm={24} md={6} lg={6} xl={5}>
          <Card title="Bộ lọc" className="filter-card">
            <div className="filter-section">
              <Title level={5}>Tìm kiếm chung</Title>
              <Search
                placeholder="Tìm theo tên hoặc thành phố"
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchInput(value);
                  updateSearch(value);
                }}
                onSearch={() => {}}
                style={{ marginBottom: 16 }}
              />
            </div>
            
            <div className="filter-section">
              <Title level={5}>Tên khách sạn</Title>
              <Search
                placeholder="Tên khách sạn"
                value={nameInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setNameInput(value);
                  updateName(value);
                }}
                onSearch={() => {}}
                style={{ marginBottom: 16 }}
              />
            </div>
            
            <div className="filter-section">
              <Title level={5}>Thành phố</Title>
              <Select
                placeholder="Chọn thành phố"
                style={{ width: '100%' }}
                value={city || undefined}
                onChange={(value) => setCity(value)}
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="ha noi">Hà Nội</Option>
                <Option value="ho chi minh">Hồ Chí Minh</Option>
                <Option value="da nang">Đà Nẵng</Option>
                <Option value="nha trang">Nha Trang</Option>
                <Option value="da lat">Đà Lạt</Option>
                <Option value="phu quoc">Phú Quốc</Option>
                <Option value="hue">Huế</Option>
                <Option value="quy nhon">Quy Nhơn</Option>
                <Option value="vung tau">Vũng Tàu</Option>
              </Select>
            </div>
            
            <Divider />
            
            <div className="filter-section">
              <Title level={5}>Đánh giá sao</Title>
              <div>
                <div className="rating-option" onClick={() => setRating(rating === 5 ? null : 5)}>
                  <Checkbox checked={rating === 5} /> 
                  <Rate disabled defaultValue={5} />
                </div>
                <div className="rating-option" onClick={() => setRating(rating === 4 ? null : 4)}>
                  <Checkbox checked={rating === 4} />
                  <Rate disabled defaultValue={4} />
                </div>
                <div className="rating-option" onClick={() => setRating(rating === 3 ? null : 3)}>
                  <Checkbox checked={rating === 3} />
                  <Rate disabled defaultValue={3} />
                </div>
                <div className="rating-option" onClick={() => setRating(rating === 2 ? null : 2)}>
                  <Checkbox checked={rating === 2} />
                  <Rate disabled defaultValue={2} />
                </div>
                <div className="rating-option" onClick={() => setRating(rating === 1 ? null : 1)}>
                  <Checkbox checked={rating === 1} />
                  <Rate disabled defaultValue={1} />
                </div>
              </div>
            </div>
            
            <div className="filter-section">
              <Title level={5}>Cảm xúc</Title>
              <Select
                placeholder="Chọn mức độ cảm xúc"
                style={{ width: '100%' }}
                value={sentimentScore || undefined}
                onChange={(value) => setSentimentScore(value)}
                allowClear
              >
                <Option value={10}>Hoàn hảo (10)</Option>
                <Option value={9}>Tuyệt vời (9+)</Option>
                <Option value={8}>Xuất sắc (8+)</Option>
                <Option value={7}>Rất tốt (7+)</Option>
                <Option value={6}>Hài lòng (6+)</Option>
                <Option value={5}>Trung bình (5+)</Option>
                <Option value={4}>Tệ (4+)</Option>
                <Option value={3}>Rất tệ (3+)</Option>
                <Option value={2}>Kém (2+)</Option>
                <Option value={1}>Rất kém (1+)</Option>
              </Select>
            </div>
            
            <Divider />
            
            <div className="filter-section">
              <Title level={5}>Khoảng giá (VND)</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="Giá tối thiểu"
                  value={minPriceInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMinPriceInput(value);
                    updateMinPrice(value ? Number(value) : null);
                  }}
                  type="number"
                  addonBefore="Từ"
                />
                <Input
                  placeholder="Giá tối đa"
                  value={maxPriceInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMaxPriceInput(value);
                    updateMaxPrice(value ? Number(value) : null);
                  }}
                  type="number"
                  addonBefore="Đến"
                />
              </Space>
            </div>
            
            <Divider />
            
            <div className="filter-section">
              <Title level={5}>Ngày đặt phòng</Title>
              <RangePicker 
                style={{ width: '100%' }}
                value={dateRange}
                onChange={handleDateChange}
                format="DD/MM/YYYY"
                placeholder={['Nhận phòng', 'Trả phòng']}
              />
              <div className="date-filter-tip" style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Chọn ngày để tìm phòng còn trống
              </div>
            </div>
            
            <Divider />
            
            <div className="filter-section">
              <Title level={5}>Số lượng khách</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="Số người lớn"
                  value={adultsInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAdultsInput(value);
                    setAdults(value ? Number(value) : null);
                  }}
                  type="number"
                  min={0}
                  addonBefore="Người lớn"
                />
                <Input
                  placeholder="Số trẻ em"
                  value={childrenInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setChildrenInput(value);
                    setChildren(value ? Number(value) : null);
                  }}
                  type="number"
                  min={0}
                  addonBefore="Trẻ em"
                />
              </Space>
            </div>
            
            <div className="filter-section">
              <Title level={5}>Sức chứa</Title>
              <Input
                placeholder="Số khách"
                value={capacityInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setCapacityInput(value);
                  updateCapacity(value ? Number(value) : null);
                }}
                type="number"
                min={1}
              />
            </div>
            
            <div className="filter-buttons">
              <Button onClick={resetFilters} block>
                Xóa tất cả bộ lọc
              </Button>
            </div>
          </Card>
        </Col>
        
        {/* Danh sách khách sạn */}
        <Col xs={24} sm={24} md={18} lg={18} xl={19}>
          <div className="hotel-list-header">
            <div className="hotel-count">
              <Text>Tìm thấy {meta?.total || 0} khách sạn</Text>
            </div>
            
            <div className="hotel-sort">
              <Text style={{ marginRight: 8 }}>Sắp xếp theo:</Text>
              <Select
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value);
                  setCurrent(1);
                }}
                style={{ width: 200 }}
              >
                <Option value="rating_desc">Đánh giá (Cao đến thấp)</Option>
                <Option value="rating_asc">Đánh giá (Thấp đến cao)</Option>
                <Option value="min_price_asc">Giá (Thấp đến cao)</Option>
                <Option value="min_price_desc">Giá (Cao đến thấp)</Option>
                <Option value="name_asc">Tên (A-Z)</Option>
                <Option value="name_desc">Tên (Z-A)</Option>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : hotels.length > 0 ? (
            <div className="hotel-list">
              {hotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} session={session} />
              ))}
              
              <div className="pagination-container">
                <Pagination
                  current={current}
                  pageSize={meta?.pageSize || 10}
                  total={meta?.total || 0}
                  onChange={(page) => setCurrent(page)}
                  showSizeChanger={false}
                />
              </div>
            </div>
          ) : (
            <Empty
              description="Không tìm thấy khách sạn nào phù hợp"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Col>
      </Row>
      
      <style jsx global>{`
        .hotel-listing-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .filter-card {
          position: sticky;
          top: 20px;
        }
        
        .filter-section {
          margin-bottom: 16px;
        }
        
        .rating-option {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          cursor: pointer;
        }
        
        .hotel-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .hotel-count {
          font-size: 16px;
        }
        
        .hotel-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .pagination-container {
          margin-top: 24px;
          display: flex;
          justify-content: center;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 40px 0;
        }
        
        .filter-buttons {
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
};

export default HotelListing;
