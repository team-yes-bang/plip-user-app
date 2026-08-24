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
      <h2 className="m-0 text-[24px] font-bold leading-[35px] text-[var(--dl-color-text-primary)] m-dlTitleSection">
        알림 설정
      </h2>
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]">
        아지트·다이어리 알림을 각각 설정합니다.
      </p>
      <NotificationSettingsForm initialSettings={settings} />
    </DailyLoopAuthTemplate>
  );
}
