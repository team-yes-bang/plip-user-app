import { NotificationInboxTemplate } from "@/components/templates";
import * as notificationService from "@/services/notificationService";
import type { UiNotificationInbox } from "@/types/notification/ui";

const EMPTY_INBOX: UiNotificationInbox = { items: [], unreadCount: 0 };

export default async function NotificationsPage() {
  let inbox = EMPTY_INBOX;
  try {
    inbox = await notificationService.ensureSeededInbox();
  } catch {
    inbox = EMPTY_INBOX;
  }
  return <NotificationInboxTemplate inbox={inbox} />;
}
