'use client'

import { handleUpdateRoomAction } from "@/utils/actions";
import { InfoCircleOutlined, PlusOutlined, LoadingOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Switch, Tooltip, Upload, message } from "antd";
import { useEffect, useState } from "react";
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { sendRequest } from "@/utils/api";
import { ROOM_AMENITIES } from "@/constants/room.constants";

// Định nghĩa interface cho file upload với cloudinary_id
interface CustomUploadFile extends UploadFile {
    cloudinary_id?: string;
}

// Thêm enum BedType từ backend
enum BedType {
    SINGLE = 'single',
    DOUBLE = 'double',
    QUEEN = 'queen',
    KING = 'king',
    TWIN = 'twin',
    SOFA = 'sofa_bed',
    BUNK = 'bunk_bed',
    MURPHY = 'murphy_bed',
    FUTON = 'futon',
}

interface IRoomUpdateProps {
    isUpdateModalOpen: boolean;
    setIsUpdateModalOpen: (v: boolean) => void;
    dataUpdate: any;
    setDataUpdate: (v: any) => void;
    hotels?: any[];
    onSuccess?: () => void;
}

const RoomUpdate = ({ isUpdateModalOpen, setIsUpdateModalOpen, dataUpdate, setDataUpdate, hotels = [], onSuccess }: IRoomUpdateProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [fileList, setFileList] = useState<CustomUploadFile[]>([]);
    const [uploadingImages, setUploadingImages] = useState<boolean>(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    useEffect(() => {
        if (dataUpdate && !initialLoadDone) {
            // Fill form data
            form.setFieldsValue({
                name: dataUpdate.name,
                hotel_id: dataUpdate.hotel_id,
                room_type: dataUpdate.room_type,
                description: dataUpdate.description,
                price_per_night: dataUpdate.price_per_night,
                capacity: dataUpdate.capacity,
                max_adults: dataUpdate.max_adults,
                max_children: dataUpdate.max_children,
                size: dataUpdate.size,
                number_of_rooms: dataUpdate.number_of_rooms || 1,
                is_bookable: dataUpdate.is_bookable,
                is_active: dataUpdate.is_active,
                amenities: dataUpdate.amenities || [],
                bed_configuration: dataUpdate.bed_configuration || [{ type: BedType.DOUBLE, count: 1 }],
            });

            // Process existing images
            if (dataUpdate.images && Array.isArray(dataUpdate.images)) {
                const existingImages = dataUpdate.images.map((image: any, index: number) => ({
                    uid: image.cloudinary_id || `existing-${index}`,
                    name: image.description || `image-${index}.jpg`,
                    status: 'done',
                    url: image.url,
                    thumbUrl: image.url,
                    cloudinary_id: image.cloudinary_id || '',
                }));
                setFileList(existingImages);
                setInitialLoadDone(true);
            } else {
                setFileList([]);
                setInitialLoadDone(true);
            }
        }
    }, [dataUpdate, form, initialLoadDone]);

    const handleCancel = () => {
        form.resetFields();
        setIsUpdateModalOpen(false);
        setDataUpdate(null);
        setFileList([]);
        setInitialLoadDone(false);
    };

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            
            // Process images
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
                    description: file.name || 'Room image'
                };
            });
            
            const validImages = images.filter(img => img.url && img.url.trim() !== '');
            
            console.log('Images sending to API:', validImages);

            const payload = {
                _id: dataUpdate._id,
                name: values.name,
                hotel_id: values.hotel_id,
                room_type: values.room_type,
                description: values.description,
                price_per_night: Number(values.price_per_night || 0),
                capacity: Number(values.capacity || 2),
                max_adults: Number(values.max_adults || 2),
                max_children: Number(values.max_children || 0),
                size: Number(values.size || 0),
                number_of_rooms: Number(values.number_of_rooms || 1),
                is_bookable: values.is_bookable,
                is_active: values.is_active,
                amenities: values.amenities || [],
                bed_configuration: values.bed_configuration || [],
                images: validImages
            };

            // Gọi action và chờ kết quả - giống như trong hotel.update.tsx
            await handleUpdateRoomAction(payload);
            
            message.success('Cập nhật phòng thành công!');
            handleCancel();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            // Xử lý lỗi giống như trong hotel.update.tsx
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phòng');
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
            
            // Nén ảnh trước khi tải lên
            const base64 = await compressImage(file);
            
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
                    cloudinary_id: res.data.public_id // Đảm bảo lưu cloudinary_id
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

    // Nén ảnh trước khi tải lên để giảm kích thước
    const compressImage = async (file: RcFile): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Giảm kích thước xuống tối đa 800x800 pixels
                    const MAX_SIZE = 800;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    // Giảm chất lượng ảnh xuống 0.7 (70%)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
            };
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

    const bedTypes = [
        { label: 'Giường đơn', value: BedType.SINGLE },
        { label: 'Giường đôi', value: BedType.DOUBLE },
        { label: 'Giường Queen', value: BedType.QUEEN },
        { label: 'Giường King', value: BedType.KING },
        { label: 'Giường Twin', value: BedType.TWIN },
        { label: 'Giường sofa', value: BedType.SOFA },
        { label: 'Giường tầng', value: BedType.BUNK },
        { label: 'Giường xếp', value: BedType.MURPHY },
        { label: 'Giường futon', value: BedType.FUTON },
    ];

    return (
        <Modal
            title="Cập nhật phòng"
            open={isUpdateModalOpen}
            onCancel={handleCancel}
            footer={null}
            maskClosable={false}
            width={800}
        >
            <Form
                form={form}
                name="update-room"
                onFinish={onFinish}
                layout="vertical"
            >
                <Row gutter={[16, 0]}>
                    <Col span={12}>
                        <Form.Item
                            label="Tên phòng"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
                        >
                            <Input placeholder="Tên phòng" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Khách sạn"
                            name="hotel_id"
                            rules={[{ required: true, message: 'Vui lòng chọn khách sạn!' }]}
                        >
                            <Select placeholder="Chọn khách sạn">
                                {hotels.map(hotel => (
                                    <Select.Option key={hotel._id} value={hotel._id}>{hotel.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 0]}>
                    <Col span={8}>
                        <Form.Item
                            label="Loại phòng"
                            name="room_type"
                            rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
                        >
                            <Select placeholder="Chọn loại phòng">
                                <Select.Option value="Standard">Standard</Select.Option>
                                <Select.Option value="Deluxe">Deluxe</Select.Option>
                                <Select.Option value="Suite">Suite</Select.Option>
                                <Select.Option value="Family">Family</Select.Option>
                                <Select.Option value="Executive">Executive</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Số lượng phòng"
                            name="number_of_rooms"
                            tooltip="Số lượng phòng cùng loại"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng phòng!' }]}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Diện tích (m²)"
                            name="size"
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Thêm phần cấu hình giường */}
                <Form.List name="bed_configuration">
                    {(fields, { add, remove }) => (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <h4 style={{ margin: 0 }}>Cấu hình giường</h4>
                                <Button 
                                    type="dashed" 
                                    onClick={() => add({ type: BedType.SINGLE, count: 1 })} 
                                    icon={<PlusOutlined />} 
                                    style={{ marginLeft: 8 }}
                                >
                                    Thêm loại giường
                                </Button>
                            </div>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'type']}
                                        style={{ marginBottom: 0, flex: 1, marginRight: 8 }}
                                        rules={[{ required: true, message: 'Chọn loại giường' }]}
                                    >
                                        <Select placeholder="Loại giường" options={bedTypes} />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'count']}
                                        style={{ marginBottom: 0, width: 120, marginRight: 8 }}
                                        rules={[{ required: true, message: 'Nhập số lượng' }]}
                                    >
                                        <InputNumber
                                            placeholder="Số lượng"
                                            min={1}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                    
                                    <MinusCircleOutlined
                                        onClick={() => remove(name)}
                                        style={{ color: '#ff4d4f' }}
                                    />
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <Form.Item>
                                    <Button 
                                        type="dashed" 
                                        onClick={() => add({ type: BedType.DOUBLE, count: 1 })} 
                                        block 
                                        icon={<PlusOutlined />}
                                    >
                                        Thêm cấu hình giường
                                    </Button>
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form.List>

                <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                    <Input.TextArea rows={4} placeholder="Mô tả về phòng" />
                </Form.Item>

                <Row gutter={[16, 0]}>
                    <Col span={8}>
                        <Form.Item
                            label="Giá/đêm"
                            name="price_per_night"
                            rules={[{ required: true, message: 'Vui lòng nhập giá phòng!' }]}
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
                    <Col span={8}>
                        <Form.Item
                            label="Sức chứa (người)"
                            name="capacity"
                            tooltip="Số người tối đa có thể ở trong phòng"
                            rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Người lớn tối đa"
                            name="max_adults"
                        >
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label="Trẻ em tối đa"
                            name="max_children"
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 0]}>
                    <Col span={12}>
                        <Form.Item 
                            label="Trạng thái phòng" 
                            name="is_bookable"
                            valuePropName="checked"
                            tooltip="Xác định liệu loại phòng này có thể được đặt hay không (không liên quan đến lịch phòng hàng ngày)"
                        >
                            <Switch checkedChildren="Có thể đặt" unCheckedChildren="Ngừng đặt" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            label="Kích hoạt" 
                            name="is_active"
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Tiện nghi phòng"
                    name="amenities"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một tiện nghi!' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn tiện nghi"
                        style={{ width: '100%' }}
                        options={ROOM_AMENITIES}
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
                        <Button 
                            type="primary" 
                            onClick={() => form.submit()}
                            loading={loading}
                        >
                            Cập nhật
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RoomUpdate;
