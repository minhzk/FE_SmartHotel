'use client';

import { useEffect, useState } from 'react';
import ReviewList from '@/components/reviews/review-list';
import { Breadcrumb, Typography } from 'antd';
import { HomeOutlined, StarOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

export default function ReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/reviews');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  if (loading || status === 'loading') {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="reviews-page">
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
              title: 'Đánh giá của tôi',
              href: '/reviews',
            },
          ]}
          style={{ marginBottom: 16 }}
        />
        
        <Title level={2}>
          <StarOutlined /> Đánh giá của tôi
        </Title>
        
        <ReviewList session={session} />
      </div>
    </div>
  );
}