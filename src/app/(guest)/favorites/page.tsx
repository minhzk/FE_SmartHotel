import { auth } from "@/auth";
import FavoritesList from "@/components/favorites/favorites-list";
import { redirect } from "next/navigation";

export default async function FavoritesPage() {
  const session = await auth();
  
  // Yêu cầu đăng nhập để xem trang yêu thích
  if (!session) {
    redirect('/auth/login?callbackUrl=/favorites');
  }
  
  return (
    <FavoritesList session={session} />
  );
}
