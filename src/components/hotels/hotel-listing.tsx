'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Row, Col, Typography, Space, Pagination, Spin, Select, Checkbox, Rate, Slider, Input, Button, Empty, Badge, Divider, Breadcrumb } from "antd";
import { FilterOutlined, HomeOutlined, SearchOutlined } from "@ant-design/icons";
import { sendRequest } from "@/utils/api";
import HotelCard from "./hotel-card";
import queryString from 'query-string';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

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
  const [name, setName] = useState<string>(searchParams.get('name') || '');
  const [city, setCity] = useState<string>(searchParams.get('city') || '');
  const [rating, setRating] = useState<number | null>(
    searchParams.get('rating') ? Number(searchParams.get('rating')) : null
  );
  const [minPrice, setMinPrice] = useState<number | null>(
    searchParams.get('min_price') ? Number(searchParams.get('min_price')) : null
  );
  const [maxPrice, setMaxPrice] = useState<number | null>(
    searchParams.get('max_price') ? Number(searchParams.get('max_price')) : null
  );
  const [capacity, setCapacity] = useState<number | null>(
    searchParams.get('capacity') ? Number(searchParams.get('capacity')) : null
  );
  const [current, setCurrent] = useState<number>(
    searchParams.get('current') ? Number(searchParams.get('current')) : 1
  );
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'rating_desc');
  
  // Hàm chuẩn hóa văn bản trước khi tìm kiếm
  const normalizeSearchText = (text: string): string => {
    if (!text) return '';
    
    // Giữ nguyên dấu, chỉ loại bỏ các ký tự đặc biệt không cần thiết
    return text.trim()
      .replace(/[^\p{L}\p{N}\s]/gu, '') // Giữ lại chữ cái, chữ số và khoảng trắng từ mọi ngôn ngữ
      .replace(/\s+/g, ' ');            // Chuẩn hóa khoảng trắng
  };

  // Load data khi component mount và khi các filter thay đổi
  useEffect(() => {
    fetchHotels();
  }, [current, sortBy]);
  
  // Hàm lấy danh sách khách sạn từ API
  const fetchHotels = async () => {
    setLoading(true);
    
    // Tạo query params cho request
    const queryParams: any = {
      current,
      pageSize: 10,
    };
    
    // Chuẩn hóa dữ liệu trước khi gửi request
    if (name) queryParams.name = normalizeSearchText(name);
    if (city) queryParams.city = city;
    if (rating) queryParams.rating = rating;
    if (minPrice) queryParams.min_price = minPrice;
    if (maxPrice) queryParams.max_price = maxPrice;
    if (capacity) queryParams.capacity = capacity;
    
    // Xử lý sort
    if (sortBy) {
      const [field, order] = sortBy.split('_');
      queryParams.sort = order === 'asc' ? field : `-${field}`;
    }
    
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
  
  // Hàm áp dụng các bộ lọc
  const applyFilters = () => {
    const params: any = {};
    
    // Chuẩn hóa các tham số tìm kiếm
    if (name) params.name = normalizeSearchText(name);
    if (city) params.city = city;
    if (rating) params.rating = rating;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (capacity) params.capacity = capacity;
    if (sortBy) params.sortBy = sortBy;
    
    // Reset về trang 1 khi filter thay đổi
    params.current = 1;
    setCurrent(1);
    
    // Cập nhật URL với params mới
    const queryStr = queryString.stringify(params);
    router.push(`/hotels?${queryStr}`);
    
    // Gọi API
    fetchHotels();
  };
  
  // Xử lý khi thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrent(page);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('current', page.toString());
    router.push(`/hotels?${params.toString()}`);
  };
  
  // Reset các bộ lọc
  const resetFilters = () => {
    setName('');
    setCity('');
    setRating(null);
    setMinPrice(null);
    setMaxPrice(null);
    setCapacity(null);
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
              <Title level={5}>Tìm kiếm</Title>
              <Search
                placeholder="Tên khách sạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onSearch={() => applyFilters()}
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
            
            <Divider />
            
            <div className="filter-section">
              <Title level={5}>Khoảng giá (VND)</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="Giá tối thiểu"
                  value={minPrice || ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
                  type="number"
                  addonBefore="Từ"
                />
                <Input
                  placeholder="Giá tối đa"
                  value={maxPrice || ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                  type="number"
                  addonBefore="Đến"
                />
              </Space>
            </div>
            
            <Divider />
            
            <div className="filter-section">
              <Title level={5}>Số lượng khách</Title>
              <Input
                placeholder="Số khách"
                value={capacity || ''}
                onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : null)}
                type="number"
                min={1}
              />
            </div>
            
            <div className="filter-buttons">
              <Button type="primary" onClick={applyFilters} icon={<FilterOutlined />} block>
                Áp dụng bộ lọc
              </Button>
              <Button onClick={resetFilters} style={{ marginTop: 10 }} block>
                Xóa bộ lọc
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
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
              
              <div className="pagination-container">
                <Pagination
                  current={current}
                  pageSize={meta?.pageSize || 10}
                  total={meta?.total || 0}
                  onChange={handlePageChange}
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
