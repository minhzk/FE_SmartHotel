'use client'
import { Layout } from 'antd';

const AdminFooter = () => {
    const { Footer} = Layout;
    return (
        <>
            <Footer style={{ textAlign: 'center' }}>
                Minh Dev ©{new Date().getFullYear()} Created by Minh Dev
            </Footer>
        </>
    )
}

export default AdminFooter