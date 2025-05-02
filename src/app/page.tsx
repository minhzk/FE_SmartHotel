import { auth } from "@/auth";
import HomePage from "@/components/layout/homepage";
import UserHeader from "@/components/layout/user.header";
import Footer from "@/components/layout/user.footer";

export default async function Home() {
  // Lấy session để truyền vào header
  const session = await auth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header với các điều hướng */}
      <UserHeader session={session} />
      
      {/* Nội dung chính */}
      <div style={{ flex: 1 }}>
        <HomePage />
      </div>
    </div>
  );
}
