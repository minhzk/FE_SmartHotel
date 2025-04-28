'use client';

import UserHeader from "@/components/layout/user.header";
import { auth } from "@/auth";
import { useEffect, useState } from "react";
import { Layout, ConfigProvider } from "antd";
import Footer from "@/components/layout/user.footer";
import { Session } from "next-auth";

const { Content } = Layout;

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const currentSession = await auth();
      setSession(currentSession);
    };
    
    getSession();
  }, []);

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
