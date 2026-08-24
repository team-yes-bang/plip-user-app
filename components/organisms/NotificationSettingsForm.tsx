"use client";

import { patchNotificationSettingsAction } from "@/actions/userActions";
import { DailyToggle, SettingsRow } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { handleClientActionResult } from "@/lib/action/handleClientActionResult";
import {
  DIARY_NOTIFY_TIME_OPTIONS,
  formatDiaryNotifyTimeLabel,
  normalizeDiaryNotifyTime,
} from "@/lib/user/diaryNotifyTime";
import type { UiNotificationSettings } from "@/types/user/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type NotificationSettingsFormProps = {
  initialSettings: UiNotificationSettings;
};

const timeSelectClassName =
  "h-12 w-full rounded-[var(--dl-radius-md)] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] px-4 text-base leading-6 text-[var(--dl-color-text-primary)] outline-none disabled:cursor-not-allowed disabled:opacity-50";

export function NotificationSettingsForm({ initialSettings }: NotificationSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState({
    ...initialSettings,
    diaryNotifyTime: normalizeDiaryNotifyTime(initialSettings.diaryNotifyTime),
  });
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  async function patchPartial(
    payload: Partial<UiNotificationSettings>,
    pendingLabel: string,
  ) {
    if (pendingKey) return;

    setPendingKey(pendingLabel);
    const result = await patchNotificationSettingsAction(payload);
    setPendingKey(null);

    if (!(await handleClientActionResult(result, router, { errorTitle: "알림 설정 저장 실패" }))) {
      return;
    }

    if (!result.ok) return;

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
    const normalized = normalizeDiaryNotifyTime(value);
    setSettings((current) => ({ ...current, diaryNotifyTime: normalized }));
    await patchPartial({ diaryNotifyTime: normalized }, "time");
  }

  return (
    <section className="flex w-full flex-col gap-3.5">
      <SettingsRow
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
        <select
          id="diary-notify-time"
          className={timeSelectClassName}
          value={settings.diaryNotifyTime}
          disabled={!settings.diaryNotifyEnabled || pendingKey === "time"}
          onChange={(event) => handleTimeChange(event.target.value)}
        >
          {DIARY_NOTIFY_TIME_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {formatDiaryNotifyTimeLabel(option)}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
