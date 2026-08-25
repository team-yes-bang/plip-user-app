import { AgitChatMessageTemplate } from "@/components/templates/AgitChatMessageTemplate";

type PageProps = {
  params: Promise<{ agitId: string; messageId: string }>;
};

export default async function AgitChatMessagePage({ params }: PageProps) {
  const { agitId, messageId } = await params;
  return <AgitChatMessageTemplate agitId={agitId} messageId={messageId} />;
}
