import { NotificationSettingsTemplate } from "@/components/templates";
import * as userService from "@/services/userService";
import type { UiNotificationSettings } from "@/types/user/ui";

const DEFAULT_SETTINGS: UiNotificationSettings = {
  agitNotifyEnabled: true,
  diaryNotifyEnabled: true,
  diaryNotifyTime: "21:00",
};

export default async function NotificationSettingsPage() {
  let settings = DEFAULT_SETTINGS;

  try {
    settings = await userService.getNotificationSettings();
  } catch {
    settings = DEFAULT_SETTINGS;
  }

  return <NotificationSettingsTemplate settings={settings} />;
}
