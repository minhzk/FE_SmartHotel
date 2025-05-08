import { auth } from "@/auth";
import ChatManagement from "@/components/admin/chats/chat-management";
import { sendRequest } from "@/utils/api";

export default async function ChatManagementPage() {
  const session = await auth();
  
  const response = await sendRequest<IBackendRes<any>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chatbot/sessions`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${session?.user?.access_token}`,
    },
    nextOption: {
      next: { tags: ['chat-sessions'] }
    }
  });
  
  return (
    <div>
      <ChatManagement chatSessions={response?.data || []} />
    </div>
  );
}
