'use client';

import { useEffect, useState } from 'react';
import BookingList from '@/components/bookings/booking-list';
import { Breadcrumb, Typography } from 'antd';
import { HomeOutlined, BookOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/bookings');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="bookings-page">
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <Breadcrumb 
          items={[
            {
              title: (
                <Link href="/">
                  <HomeOutlined /> Trang chủ
                </Link>
              ),
            },
            {
              title: 'Đơn đặt phòng',
              href: '/bookings',
            },
          ]}
          style={{ marginBottom: 16 }}
        />
        
        <Title level={2}>
          <BookOutlined /> Đơn đặt phòng của tôi
        </Title>
        
        <BookingList session={session} />
      </div>
    </div>
  );
}
