import { AgitListTemplate } from "@/components/templates";
import { listMyAgits } from "@/services/agitService";
import { getInboxUnreadCount } from "@/services/notificationService";
import { getServerUserUuid } from "@/lib/auth/server-token";
import type { UiAgit } from "@/types/agit/ui";

export default async function AgitListPage() {
  let items: UiAgit[] = [];
  let error: string | undefined;
  let inboxUnreadCount = 0;
  const currentUserUuid = await getServerUserUuid();

  try {
    items = await listMyAgits();
  } catch (caught) {
    items = [];
    error =
      caught instanceof Error ? caught.message : "아지트 목록을 불러오지 못했습니다.";
  }

  if (currentUserUuid) {
    try {
      inboxUnreadCount = await getInboxUnreadCount(currentUserUuid);
    } catch {
      inboxUnreadCount = 0;
    }
  }

  return (
    <AgitListTemplate
      items={items}
      error={error}
      currentUserUuid={currentUserUuid}
      inboxUnreadCount={inboxUnreadCount}
    />
  );
}
