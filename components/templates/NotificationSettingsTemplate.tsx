import { AuthTopBar } from "@/components/molecules";
import { NotificationSettingsForm } from "@/components/organisms";
import { DailyLoopAuthTemplate } from "@/components/templates/DailyLoopAuthTemplate";
import { ROUTES } from "@/config/routes";
import type { UiNotificationSettings } from "@/types/user/ui";

type NotificationSettingsTemplateProps = {
  settings: UiNotificationSettings;
};

export function NotificationSettingsTemplate({ settings }: NotificationSettingsTemplateProps) {
  return (
    <DailyLoopAuthTemplate>
      <AuthTopBar title="알림 설정" backHref={ROUTES.mypage.root} />
      <NotificationSettingsForm initialSettings={settings} />
    </DailyLoopAuthTemplate>
  );
}
