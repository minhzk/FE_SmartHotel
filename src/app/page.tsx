'use client';

import { useSession } from "next-auth/react";
import HomePage from "@/components/layout/homepage";
import UserHeader from "@/components/layout/user.header";
import Footer from "@/components/layout/user.footer";
import { useEffect, useState } from "react";
import { Spin } from "antd";

export default function Home() {
  const { data: session, status, update } = useSession();
  const [isReloading, setIsReloading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  console.log("Session data:", session);
  console.log("Session status:", status);

  // Check session manually and force reload if needed
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        console.log('Direct session API call result:', data);
        
        if (data && data.user && status === 'unauthenticated') {
          console.log('Found session but status is unauthenticated, reloading page...');
          setIsReloading(true);
          window.location.reload();
        } else {
          // Session check completed, safe to show content
          setIsInitialLoad(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setIsInitialLoad(false);
      }
    };
    
    // Always check session first before showing content
    if (status !== 'loading') {
      const timer = setTimeout(checkSession, 500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Show loading spinner until everything is ready
  if (status === 'loading' || isReloading || isInitialLoad) {
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
    <div className="main-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: '1520px',
      margin: '0 auto',
      position: 'relative'
    }}>
      <div className="header-container" style={{ width: '100%' }}>
        <UserHeader session={session} />
      </div>
      
      <div style={{ flex: 1 }}>
        <HomePage />
      </div>
    </div>
  );
}
