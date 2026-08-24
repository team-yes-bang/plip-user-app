"use client";

import { patchNotificationSettingsAction } from "@/actions/userActions";
import { Input } from "@/components/atoms";
import { DailyToggle, SettingsRow } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import type { UiNotificationSettings } from "@/types/user/ui";
import { useState } from "react";

type NotificationSettingsFormProps = {
  initialSettings: UiNotificationSettings;
};

export function NotificationSettingsForm({ initialSettings }: NotificationSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  async function patchPartial(
    payload: Partial<UiNotificationSettings>,
    pendingLabel: string,
  ) {
    if (pendingKey) return;

    setPendingKey(pendingLabel);
    const result = await patchNotificationSettingsAction(payload);
    setPendingKey(null);

    if (!result.ok) {
      toast.add({ type: "error", title: "알림 설정 저장 실패", description: result.error });
      return;
    }

    setSettings(result.data);
    toast.add({ type: "success", title: "알림 설정을 저장했습니다" });
  }

  async function handleAgitToggle(checked: boolean) {
    await patchPartial({ agitNotifyEnabled: checked }, "agit");
  }

  async function handleDiaryToggle(checked: boolean) {
    await patchPartial({ diaryNotifyEnabled: checked }, "diary");
  }

  async function handleTimeChange(value: string) {
    setSettings((current) => ({ ...current, diaryNotifyTime: value }));
    await patchPartial({ diaryNotifyTime: value }, "time");
  }

  return (
    <section className="flex w-full flex-col gap-3.5">
      <SettingsRow
        icon="bell"
        title="아지트 알림"
        description="아지트 활동 알림"
        trailing={
          <DailyToggle
            checked={settings.agitNotifyEnabled}
            label="아지트 알림"
            onChange={handleAgitToggle}
          />
        }
        showChevron={false}
      />

      <SettingsRow
        icon="calendarBrand"
        title="다이어리 알림"
        description={settings.diaryNotifyEnabled ? "알림 켜짐" : "알림 꺼짐"}
        trailing={
          <DailyToggle
            checked={settings.diaryNotifyEnabled}
            label="다이어리 알림"
            onChange={handleDiaryToggle}
          />
        }
        showChevron={false}
      />

      <div className="flex w-full flex-col gap-2 rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[14px]">
        <label htmlFor="diary-notify-time" className="text-sm font-semibold text-[var(--dl-color-text-primary)]">
          다이어리 알림 시간
        </label>
        <Input
          id="diary-notify-time"
          type="time"
          variant="daily"
          step={600}
          value={settings.diaryNotifyTime}
          disabled={!settings.diaryNotifyEnabled || pendingKey === "time"}
          onChange={(event) => handleTimeChange(event.target.value)}
        />
      </div>
    </section>
  );
}
