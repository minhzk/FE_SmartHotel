'use client'

import { handleCreateHotelAction } from "@/utils/actions";
import { InfoCircleOutlined, PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Switch, Tooltip, Upload, message } from "antd";
import { useState } from "react";
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { sendRequest } from "@/utils/api";

interface IProps {
    isCreateModalOpen: boolean;
    setIsCreateModalOpen: (v: boolean) => void;
}

const HotelCreate = (props: IProps) => {
    const { isCreateModalOpen, setIsCreateModalOpen } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploadingImages, setUploadingImages] = useState<boolean>(false);

    const handleCancel = () => {
        form.resetFields();
        setIsCreateModalOpen(false);
        setFileList([]);
    };

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            
            // Process Cloudinary image data
            const images = fileList.map(file => ({
                url: file.url || '',
                cloudinary_id: file.cloudinary_id || '',
                description: file.name || 'Hotel image'
            }));
            
            // Prepare payload with location
            const payload = {
                ...values,
                rating: Number(values.rating || 5),
                min_price: Number(values.min_price || 0),
                max_price: Number(values.max_price || 0),
                max_capacity: Number(values.max_capacity || 1),
                location: {
                    latitude: Number(values.latitude || 0),
                    longitude: Number(values.longitude || 0),
                },
                images
            };

            await handleCreateHotelAction(payload);
            message.success('Thêm khách sạn thành công!');
            handleCancel();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm khách sạn');
        } finally {
            setLoading(false);
        }
    };

    const beforeUpload = async (file: RcFile) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Bạn chỉ có thể tải lên tệp hình ảnh!');
            return false;
        }
        
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Hình ảnh phải nhỏ hơn 5MB!');
            return false;
        }

        try {
            setUploadingImages(true);
            
            // Convert file to base64
            const base64 = await convertFileToBase64(file);
            
            // Upload to Cloudinary via our backend
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/uploads/base64`,
                method: 'POST',
                body: {
                    base64Image: base64,
                    description: file.name,
                }
            });
            
            if (res?.data) {
                // Create new file with Cloudinary URL
                const newFile: UploadFile = {
                    uid: res.data.public_id,
                    name: file.name,
                    status: 'done',
                    url: res.data.secure_url,
                    thumbUrl: res.data.secure_url,
                    cloudinary_id: res.data.public_id,
                };
                
                setFileList(prev => [...prev, newFile]);
            } else {
                message.error('Tải ảnh lên thất bại');
            }
            
            // Return false to prevent default upload behavior
            return false;
        } catch (error) {
            console.error("Upload error:", error);
            message.error('Có lỗi xảy ra khi tải ảnh lên');
            return false;
        } finally {
            setUploadingImages(false);
        }
    };

    const convertFileToBase64 = (file: RcFile): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        // Only update fileList for file deletions, additions are handled by beforeUpload
        setFileList(prev => {
            // Find files that were removed
            const removedFiles = prev.filter(
                p => !newFileList.some(n => n.uid === p.uid)
            );
            
            // If files were removed, handle the removal
            if (removedFiles.length > 0) {
                return newFileList;
            }
            
            // If no removals happened, keep the current state
            return prev;
        });
    };

    const uploadButton = (
        <div>
            {uploadingImages ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Tải lên</div>
        </div>
    );

    return (
        <Modal
            title="Tạo mới khách sạn"
            open={isCreateModalOpen}
            onCancel={handleCancel}
            footer={null}
            maskClosable={false}
            width={800}
        >
            <Form
                form={form}
                name="create-hotel"
                onFinish={onFinish}
                layout="vertical"
                initialValues={{
                    is_active: true,
                    accept_deposit: true,
                    rating: 5,
                    city: 'ha noi',
                }}
            >
                <Row gutter={[16, 0]}>
                    <Col span={12}>
                        <Form.Item
                            label="Tên khách sạn"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên khách sạn!' }]}
                        >
                            <Input placeholder="Tên khách sạn" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Thành phố"
                            name="city"
                            rules={[{ required: true, message: 'Vui lòng chọn thành phố!' }]}
                        >
                            <Select
                                placeholder="Chọn thành phố"
                            >
                                <Select.Option value="ha noi">Hà Nội</Select.Option>
                                <Select.Option value="ho chi minh">Hồ Chí Minh</Select.Option>
                                <Select.Option value="da nang">Đà Nẵng</Select.Option>
                                <Select.Option value="nha trang">Nha Trang</Select.Option>
                                <Select.Option value="da lat">Đà Lạt</Select.Option>
                                <Select.Option value="phu quoc">Phú Quốc</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                    <Input placeholder="Địa chỉ khách sạn" />
                </Form.Item>

                <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                    <Input.TextArea rows={4} placeholder="Mô tả về khách sạn" />
                </Form.Item>

                <Row gutter={[16, 0]}>
                    <Col span={12}>
                        <Form.Item
                            label="Vĩ độ (Latitude)"
                            name="latitude"
                            tooltip="Vĩ độ của khách sạn trên bản đồ"
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 21.0285" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Kinh độ (Longitude)"
                            name="longitude"
                            tooltip="Kinh độ của khách sạn trên bản đồ"
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 105.8542" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 0]}>
                    <Col span={6}>
                        <Form.Item
                            label={
                                <span>
                                    Đánh giá
                                    <Tooltip title="Số sao của khách sạn (1-5)">
                                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                                    </Tooltip>
                                </span>
                            }
                            name="rating"
                            rules={[{ required: true, message: 'Vui lòng nhập đánh giá!' }]}
                        >
                            <InputNumber min={1} max={5} placeholder="Số sao" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="Giá tối thiểu"
                            name="min_price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá tối thiểu!' }]}
                        >
                            <InputNumber 
                                min={0}
                                placeholder="VND"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="Giá tối đa"
                            name="max_price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá tối đa!' }]}
                        >
                            <InputNumber 
                                min={0}
                                placeholder="VND"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="Sức chứa tối đa"
                            name="max_capacity"
                            tooltip="Số lượng người tối đa mà khách sạn có thể phục vụ"
                        >
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 0]}>
                    <Col span={12}>
                        <Form.Item 
                            label="Hoạt động" 
                            name="is_active"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            label="Chấp nhận đặt cọc" 
                            name="accept_deposit"
                            valuePropName="checked"
                            tooltip="Cho phép khách hàng đặt cọc khi đặt phòng"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Tiện ích"
                    name="amenities"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một tiện ích!' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn tiện ích"
                        style={{ width: '100%' }}
                        options={[
                            { label: 'WiFi', value: 'wifi' },
                            { label: 'Hồ bơi', value: 'pool' },
                            { label: 'Phòng gym', value: 'gym' },
                            { label: 'Nhà hàng', value: 'restaurant' },
                            { label: 'Bãi đỗ xe', value: 'parking' },
                            { label: 'Spa', value: 'spa' },
                            { label: 'Điều hòa', value: 'ac' },
                            { label: 'Dịch vụ phòng', value: 'room_service' }
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    label="Hình ảnh"
                    name="images"
                >
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                        multiple
                        maxCount={10}
                        customRequest={({ onSuccess }) => {
                            // Dummy request to work with our custom upload
                            setTimeout(() => {
                                onSuccess?.("ok", undefined as any);
                            }, 0);
                        }}
                    >
                        {fileList.length >= 10 ? null : uploadButton}
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 10 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Tạo mới
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default HotelCreate;
