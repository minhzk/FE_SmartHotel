'use client'

import { handleCreateHotelAction } from "@/utils/actions";
import { InfoCircleOutlined, PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Switch, Tooltip, Upload, message } from "antd";
import { useState } from "react";
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { sendRequest } from "@/utils/api";
import { HOTEL_AMENITIES } from "@/constants/hotel.constants";

// Thêm định nghĩa interface cho file upload với cloudinary_id
interface CustomUploadFile extends UploadFile {
    cloudinary_id?: string;
}

interface IProps {
    isCreateModalOpen: boolean;
    setIsCreateModalOpen: (v: boolean) => void;
}

const HotelCreate = (props: IProps) => {
    const { isCreateModalOpen, setIsCreateModalOpen } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [fileList, setFileList] = useState<CustomUploadFile[]>([]);
    const [uploadingImages, setUploadingImages] = useState<boolean>(false);
    const [initialLoadDone, setInitialLoadDone] = useState(true);

    const handleCancel = () => {
        form.resetFields();
        setIsCreateModalOpen(false);
        setFileList([]);
    };

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            
            // Process images: logic giống với hotel.update
            const images = fileList.map(file => {
                const isCloudinaryUrl = file.url?.includes('res.cloudinary.com') || 
                                       file.thumbUrl?.includes('res.cloudinary.com');
                
                console.log('Processing image:', {
                    name: file.name,
                    isCloudinaryUrl,
                    url: file.url,
                    cloudinary_id: file.cloudinary_id || file.uid
                });
                
                return {
                    url: file.url || file.thumbUrl || '',
                    cloudinary_id: file.cloudinary_id || 
                        (typeof file.uid === 'string' && file.uid.includes('smarthotel/') ? file.uid : ''),
                    description: file.name || 'Hotel image'
                };
            });
            
            const validImages = images.filter(img => img.url && img.url.trim() !== '');
            
            console.log('Images sending to API:', validImages);
            
            const payload = {
                ...values,
                rating: 0,
                min_price: Number(values.min_price || 0),
                max_price: Number(values.max_price || 0),
                max_capacity: Number(values.max_capacity || 1),
                location: {
                    latitude: Number(values.latitude || 0),
                    longitude: Number(values.longitude || 0),
                },
                images: validImages
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
            
            const base64 = await convertFileToBase64(file);
            
            console.log('Uploading file to Cloudinary:', file.name);
            
            const res = await sendRequest<IBackendRes<any>>({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/uploads/base64`,
                method: 'POST',
                body: {
                    base64Image: base64,
                    description: file.name,
                }
            });
            
            console.log('Cloudinary response:', res?.data);
            
            if (res?.data && res?.data?.secure_url) {
                const newFile: CustomUploadFile = {
                    uid: res.data.public_id,
                    name: file.name,
                    status: 'done',
                    url: res.data.secure_url,
                    thumbUrl: res.data.secure_url,
                    cloudinary_id: res.data.public_id
                };
                
                setFileList(prev => {
                    const updatedList = [...prev, newFile];
                    console.log('fileList sau khi thêm ảnh mới:', updatedList);
                    return updatedList;
                });
                
                message.success(`Đã tải lên "${file.name}" thành công`);
            } else {
                message.error('Tải ảnh lên thất bại: Không nhận được URL');
                console.error('Missing secure_url in Cloudinary response:', res);
            }
            
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
        const isRemoval = fileList.length > newFileList.length;
        
        if (isRemoval) {
            const removedFiles = fileList.filter(
                p => !newFileList.some(n => n.uid === p.uid)
            );
            
            removedFiles.forEach(file => {
                if (file.cloudinary_id) {
                    console.log('File with cloudinary_id removed:', file.cloudinary_id);
                }
            });
            
            setFileList(newFileList as CustomUploadFile[]);
            console.log('fileList sau khi xóa ảnh:', newFileList);
        }
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
                    city: 'ha noi',
                }}
            >
                <Row gutter={[16, 0]}>
                    <Col span={12}>
                        <Form.Item
                            label="Tên khách sạn"
                            name="name"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên khách sạn!' },
                                { max: 100, message: 'Tên khách sạn tối đa 100 ký tự!' }
                            ]}
                        >
                            <Input placeholder="Tên khách sạn" maxLength={100} />
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
                    rules={[
                        { required: true, message: 'Vui lòng nhập địa chỉ!' },
                        { max: 200, message: 'Địa chỉ tối đa 200 ký tự!' }
                    ]}
                >
                    <Input placeholder="Địa chỉ khách sạn" maxLength={200} />
                </Form.Item>

                <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mô tả!' },
                        { max: 1000, message: 'Mô tả tối đa 1000 ký tự!' }
                    ]}
                >
                    <Input.TextArea rows={4} placeholder="Mô tả về khách sạn" maxLength={1000} />
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
                    <Col span={8}>
                        <Form.Item
                            label="Giá tối thiểu"
                            name="min_price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá tối thiểu!' }]}
                        >
                            <InputNumber 
                                min={0}
                                placeholder="VND"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as any}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Giá tối đa"
                            name="max_price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá tối đa!' }]}
                        >
                            <InputNumber 
                                min={0}
                                placeholder="VND"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as any}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Sức chứa tối đa"
                            name="max_capacity"
                            tooltip="Số lượng người tối đa mà khách sạn có thể phục vụ"
                            rules={[{ required: true, message: 'Vui lòng nhập số người tối đa!' }]}
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
                        options={HOTEL_AMENITIES}
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
