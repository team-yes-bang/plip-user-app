import { AppChromeTemplate } from "@/components/templates/AppChromeTemplate";
import { ChatMessageFullSection } from "@/components/organisms/ChatMessageFullSection";

export function AgitChatMessageTemplate({
  agitId,
  messageId,
}: {
  agitId: string;
  messageId: string;
}) {
  return (
    <AppChromeTemplate activeTab="agit" variant="light">
      <ChatMessageFullSection agitId={agitId} messageId={messageId} />
    </AppChromeTemplate>
  );
}
