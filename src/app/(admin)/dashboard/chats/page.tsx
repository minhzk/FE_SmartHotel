import { auth } from "@/auth";
import ChatManagement from "@/components/admin/chats/chat-management";
import { ChatService } from "@/services/chat.service";

export default async function ChatManagementPage() {
  const session = await auth();
  
  const response = await ChatService.getChatSessions(session?.user?.access_token!);
  
  return (
    <div>
      <ChatManagement chatSessions={response?.data || []} />
    </div>
  );
}
