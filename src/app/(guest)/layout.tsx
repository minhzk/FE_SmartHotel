'use client';

import UserHeader from "@/components/layout/user.header";
import { useSession } from "next-auth/react";
import { Layout, ConfigProvider, Spin } from "antd";
import Footer from "@/components/layout/user.footer";

const { Content } = Layout;

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use next-auth's useSession hook instead of calling auth() directly
  const { data: session, status } = useSession();

  // Show loading while session is being determined
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <UserHeader session={session} />
        <Content style={{ padding: '0 50px', marginTop: 20 }}>
          <div className="site-layout-content">{children}</div>
        </Content>
        <Footer />
        
        <style jsx global>{`
          .site-layout-content {
            min-height: 280px;
            padding: 24px;
            background: #fff;
          }
        `}</style>
      </Layout>
    </ConfigProvider>
  );
}
