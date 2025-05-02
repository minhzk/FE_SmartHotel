'use client'
import { EyeTwoTone, FilterOutlined, EditTwoTone, DeleteTwoTone, PlusOutlined } from "@ant-design/icons";
import { Button, Table, Tag, Form, Row, Col, Card, Space, Tooltip, message, Input, Select, Popconfirm } from "antd";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import UserDetail from "./user.detail";
import UserCreate from "./user.create";
import UserUpdate from "./user.update";
import { handleDeleteUserAction } from "@/utils/actions";

interface IProps {
    users: any[];
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    }
}

interface IUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    role: string;
    isActive: boolean;
    account_balance: number;
    transactions?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}

const UserTable = (props: IProps) => {
    const { users: initialUsers = [], meta: initialMeta = { current: 1, pageSize: 10, pages: 0, total: 0 } } = props;
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const { data: session } = useSession();

    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [form] = Form.useForm();
    const [users, setUsers] = useState<any[]>(initialUsers);
    const [meta, setMeta] = useState(initialMeta);
    const [loading, setLoading] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<IUser | null>(null);

    // Fetch users when search params change
    useEffect(() => {
        fetchUsers();
    }, [searchParams, session]);

    const fetchUsers = async () => {
        if (!session?.user?.access_token) return;

        setLoading(true);
        try {
            const queryParams: any = {};

            // Pagination params
            if (searchParams.has('current')) queryParams.current = searchParams.get('current');
            if (searchParams.has('pageSize')) queryParams.pageSize = searchParams.get('pageSize');

            // Filter params
            if (searchParams.has('role')) queryParams.role = searchParams.get('role');
            if (searchParams.has('isActive')) queryParams.isActive = searchParams.get('isActive');

            // Search term
            if (searchParams.has('search')) queryParams.search = searchParams.get('search');

            const res = await sendRequest({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
                method: 'GET',
                queryParams: queryParams,
                headers: {
                    'Authorization': `Bearer ${session.user.access_token}`
                }
            });

            if (res?.data) {
                setUsers(res.data.results || []);
                setMeta(res.data.meta || initialMeta);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Không thể tải dữ liệu người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (record: IUser) => {
        setDataUpdate(record);
        setIsUpdateModalOpen(true);
    };

    const confirmDelete = async (userId: string) => {
        try {
            setLoading(true);
            await handleDeleteUserAction(userId);

            message.success('Xóa người dùng thành công');
            fetchUsers(); // Fetch lại dữ liệu sau khi xóa
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<IUser> = [
        {
            title: "STT",
            width: 60,
            render: (_: any, __: any, index: any) => {
                return (
                    <>{(index + 1) + (meta.current - 1) * (meta.pageSize)}</>
                )
            }
        },
        {
            title: 'Tên người dùng',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={role === 'ADMIN' ? 'gold' : 'blue'}>
                    {role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Số dư ví',
            dataIndex: 'account_balance',
            key: 'account_balance',
            render: (balance: number) => balance ? balance.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
        },
        {
            title: 'Thao tác',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <EyeTwoTone
                            twoToneColor="#1890ff" 
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setSelectedUser(record);
                                setIsDetailModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <EditTwoTone
                            twoToneColor="#f57800" 
                            style={{ cursor: "pointer" }}
                            onClick={() => handleUpdate(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa người dùng này?"
                            onConfirm={() => confirmDelete(record._id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <DeleteTwoTone 
                                twoToneColor="#ff4d4f"
                                style={{ cursor: "pointer" }} 
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    const onChange = (pagination: any) => {
        if (pagination && pagination.current) {
            const params = new URLSearchParams(searchParams);
            params.set('current', pagination.current);
            if (pagination.pageSize) {
                params.set('pageSize', pagination.pageSize);
            }
            replace(`${pathname}?${params.toString()}`);
        }
    };

    const onFinish = (values: any) => {
        const params = new URLSearchParams(searchParams);

        params.set('current', '1');

        if (values.role) {
            params.set('role', values.role);
        } else {
            params.delete('role');
        }

        if (values.isActive !== undefined) {
            params.set('isActive', values.isActive);
        } else {
            params.delete('isActive');
        }

        if (values.search) {
            params.set('search', values.search);
        } else {
            params.delete('search');
        }

        replace(`${pathname}?${params.toString()}`);
    };

    const resetFilters = () => {
        form.resetFields();

        const params = new URLSearchParams();
        params.set('current', '1');
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <>
            <Card title="Tìm kiếm người dùng" style={{ marginBottom: 16 }}>
                <Form
                    form={form}
                    name="user-filter"
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={{
                        role: searchParams.get('role') || undefined,
                        isActive: searchParams.has('isActive') 
                            ? searchParams.get('isActive') === 'true'
                            : undefined,
                        search: searchParams.get('search') || undefined,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="role" label="Vai trò">
                                <Select
                                    allowClear
                                    placeholder="Chọn vai trò"
                                    options={[
                                        { value: 'ADMIN', label: 'Quản trị viên' },
                                        { value: 'USER', label: 'Người dùng' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="isActive" label="Trạng thái">
                                <Select
                                    allowClear
                                    placeholder="Chọn trạng thái"
                                    options={[
                                        { value: true, label: 'Hoạt động' },
                                        { value: false, label: 'Không hoạt động' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="search" label="Tìm kiếm">
                                <Input placeholder="Tìm theo tên, email, số điện thoại..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Button style={{ marginRight: 8 }} onClick={resetFilters}>
                                Xóa bộ lọc
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
                                Lọc
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card 
                title="Quản lý người dùng"
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Thêm người dùng
                    </Button>
                }
            >
                <Table
                    bordered
                    dataSource={users}
                    columns={columns}
                    rowKey={"_id"}
                    loading={loading}
                    pagination={{
                        current: meta.current,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => { 
                            return (<div> {range[0]}-{range[1]} trên {total} kết quả</div>) 
                        }
                    }}
                    onChange={onChange}
                />
            </Card>

            <UserDetail
                isDetailModalOpen={isDetailModalOpen}
                setIsDetailModalOpen={setIsDetailModalOpen}
                user={selectedUser}
            />
            
            <UserCreate
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
                onSuccess={fetchUsers}
            />
            
            <UserUpdate
                isUpdateModalOpen={isUpdateModalOpen}
                setIsUpdateModalOpen={setIsUpdateModalOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                onSuccess={fetchUsers}
            />
        </>
    )
}

export default UserTable;
