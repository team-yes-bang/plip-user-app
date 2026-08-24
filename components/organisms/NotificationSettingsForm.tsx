"use client";

import { patchNotificationSettingsAction } from "@/actions/userActions";
import { SubmitButton } from "@/components/atoms";
import { DailyToggle, DiaryNotifyTimePicker, SettingsRow } from "@/components/molecules";
import { toast } from "@/components/ui/toast";
import { handleClientActionResult } from "@/lib/action/handleClientActionResult";
import { normalizeDiaryNotifyTime } from "@/lib/user/diaryNotifyTime";
import type { UiNotificationSettings } from "@/types/user/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type NotificationSettingsFormProps = {
  initialSettings: UiNotificationSettings;
};

export function NotificationSettingsForm({ initialSettings }: NotificationSettingsFormProps) {
  const router = useRouter();
  const normalizedInitialTime = normalizeDiaryNotifyTime(initialSettings.diaryNotifyTime);
  const [settings, setSettings] = useState({
    ...initialSettings,
    diaryNotifyTime: normalizedInitialTime,
  });
  const [draftDiaryNotifyTime, setDraftDiaryNotifyTime] = useState(normalizedInitialTime);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const hasDraftTimeChanges = draftDiaryNotifyTime !== settings.diaryNotifyTime;

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
    setDraftDiaryNotifyTime(result.data.diaryNotifyTime);
    toast.add({ type: "success", title: "알림 설정을 저장했습니다" });
  }

  async function handleAgitToggle(checked: boolean) {
    await patchPartial({ agitNotifyEnabled: checked }, "agit");
  }

  async function handleDiaryToggle(checked: boolean) {
    await patchPartial({ diaryNotifyEnabled: checked }, "diary");
  }

  function handleDraftTimeChange(value: string) {
    setDraftDiaryNotifyTime(normalizeDiaryNotifyTime(value));
  }

  async function handleTimeSave() {
    if (!settings.diaryNotifyEnabled || !hasDraftTimeChanges) return;
    await patchPartial({ diaryNotifyTime: draftDiaryNotifyTime }, "time");
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
        <p className="m-0 text-sm font-semibold text-[var(--dl-color-text-primary)]">다이어리 알림 시간</p>
        <div className="flex w-full flex-col gap-[14px]">
          <DiaryNotifyTimePicker
            className="w-full"
            value={draftDiaryNotifyTime}
            disabled={!settings.diaryNotifyEnabled || pendingKey === "time"}
            onChange={handleDraftTimeChange}
          />
          <SubmitButton
            type="button"
            variant="brand"
            disabled={
              !settings.diaryNotifyEnabled ||
              pendingKey === "time" ||
              !hasDraftTimeChanges
            }
            onClick={handleTimeSave}
          >
            {pendingKey === "time" ? "저장 중..." : "설정"}
          </SubmitButton>
        </div>
      </div>
    </section>
  );
}
