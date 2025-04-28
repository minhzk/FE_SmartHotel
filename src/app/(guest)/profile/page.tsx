import { auth } from "@/auth";
import ProfileComponent from "@/components/profile/profile-component";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  return <ProfileComponent session={session} />;
}
