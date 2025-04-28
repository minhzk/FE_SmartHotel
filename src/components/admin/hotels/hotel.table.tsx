'use client'
import { handleDeleteHotelAction } from "@/utils/actions";
import { DeleteTwoTone, EditTwoTone, EyeTwoTone } from "@ant-design/icons";
import { Button, Popconfirm, Table, Tag, Image } from "antd";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from "react";
import HotelCreate from "./hotel.create";
import HotelUpdate from "./hotel.update";

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

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<any>(null);

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
                            onClick={() => window.open(`/hotels/${record._id}`, '_blank')}
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
            <Table
                bordered
                dataSource={hotels}
                columns={columns}
                rowKey={"_id"}
                pagination={
                    {
                        current: meta.current,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
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
        </>
    )
}

export default HotelTable;
