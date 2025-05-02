import { auth } from "@/auth";
import HomePage from "@/components/layout/homepage";
import UserHeader from "@/components/layout/user.header";
import Footer from "@/components/layout/user.footer";

export default async function Home() {
  const session = await auth();

  return (
    <div className="main-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: '1520px',
      margin: '0 auto',
      position: 'relative'
    }}>
      <div className="header-container" style={{ 
        width: '100%'
      }}>
        <UserHeader session={session} />
      </div>
      
      <div style={{ flex: 1 }}>
        <HomePage />
      </div>
      
    </div>
  );
}
