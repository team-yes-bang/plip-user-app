"use client";

import { SubmitButton } from "@/components/atoms";
import { DestinationToggle, type DestinationId } from "@/components/molecules/DestinationToggle";
import { HeaderBackButton, ScreenHeader } from "@/components/molecules";
import { TopicChip } from "@/components/molecules/TopicChip";
import type { UiAgit } from "@/types/agit/ui";
import type { UiDiaryTheme } from "@/types/diary/ui";
import type { UiTopicListItem } from "@/types/topic/ui";

type CaptureUploadSettingsStageProps = {
  destinationKind: DestinationId;
  agits: UiAgit[];
  topics: UiTopicListItem[];
  themes: UiDiaryTheme[];
  selectedAgitUuid: string;
  selectedTopicUuid: string;
  selectedThemeId: string;
  destinationError: string | null;
  uploading: boolean;
  saveError: string | null;
  onDestinationKindChange: (value: DestinationId) => void;
  onAgitChange: (agitUuid: string) => void;
  onTopicChange: (topicUuid: string) => void;
  onThemeChange: (themeId: string) => void;
  onBack: () => void;
  onSave: () => void;
};

export function CaptureUploadSettingsStage({
  destinationKind,
  agits,
  topics,
  themes,
  selectedAgitUuid,
  selectedTopicUuid,
  selectedThemeId,
  destinationError,
  uploading,
  saveError,
  onDestinationKindChange,
  onAgitChange,
  onTopicChange,
  onThemeChange,
  onBack,
  onSave,
}: CaptureUploadSettingsStageProps) {
  const selectedAgit = agits.find((agit) => agit.id === selectedAgitUuid);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicUuid);
  const selectedTheme = themes.find((theme) => theme.id === selectedThemeId);
  const canSave =
    destinationKind === "diary"
      ? Boolean(selectedThemeId && selectedTheme?.themeUuid)
      : Boolean(selectedAgitUuid && selectedTopicUuid);

  return (
    <section
      className="flex h-full min-h-0 flex-col gap-[14px] overflow-y-auto bg-[var(--dl-color-bg-elevated)] px-[23px] pt-3 pb-8 text-[var(--dl-color-text-primary)]"
      aria-label="업로드 설정"
    >
      <ScreenHeader
        tone="plain"
        leading={<HeaderBackButton onClick={onBack} />}
        title="업로드 설정"
      />

      <p className="m-0 text-[15px] font-semibold">기록 목적지</p>
      <DestinationToggle value={destinationKind} onChange={onDestinationKindChange} />

      {destinationKind === "agit" && selectedAgit ? (
        <div className="flex min-h-[84px] flex-col justify-center gap-[6px] rounded-[16px] bg-[var(--dl-color-bg-brand-subtle)] px-4 py-3.5">
          <p className="m-0 text-[15px] font-semibold">
            {selectedTopic?.title || selectedAgit.name}
          </p>
          <p className="m-0 text-[11px] text-[var(--dl-color-text-secondary)]">
            아지트 · {selectedAgit.name}
          </p>
        </div>
      ) : null}

      {destinationKind === "diary" && selectedTheme ? (
        <div className="flex min-h-[84px] flex-col justify-center gap-[6px] rounded-[16px] bg-[var(--dl-color-bg-brand-subtle)] px-4 py-3.5">
          <p className="m-0 text-[15px] font-semibold">{selectedTheme.name}</p>
          <p className="m-0 text-[11px] text-[var(--dl-color-text-secondary)]">다이어리 · 오늘</p>
        </div>
      ) : null}

      <p className="m-0 text-[15px] font-semibold">
        {destinationKind === "agit" ? "토픽 선택" : "테마 선택"}
      </p>

      {destinationKind === "agit" ? (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-[13px] font-semibold">
            아지트
            <select
              value={selectedAgitUuid}
              className="min-h-10 rounded-[12px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] px-3 text-[13px] font-medium"
              onChange={(event) => onAgitChange(event.target.value)}
            >
              <option value="">아지트 선택</option>
              {agits.map((agit) => (
                <option key={agit.id} value={agit.id}>
                  {agit.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            {topics.length === 0 ? (
              <p className="m-0 text-[12px] text-[var(--dl-color-text-secondary)]">선택할 토픽이 없습니다.</p>
            ) : (
              topics.map((topic) => (
                <TopicChip
                  key={topic.id}
                  selected={selectedTopicUuid === topic.id}
                  onClick={() => onTopicChange(topic.id)}
                >
                  {topic.title || "제목 없음"}
                </TopicChip>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {themes.length === 0 ? (
            <p className="m-0 text-[12px] text-[var(--dl-color-text-secondary)]">
              테마가 없습니다. 다이어리에서 먼저 만들어 주세요.
            </p>
          ) : (
            themes.map((theme) => (
              <TopicChip
                key={theme.id}
                selected={selectedThemeId === theme.id}
                onClick={() => onThemeChange(theme.id)}
              >
                {theme.name}
              </TopicChip>
            ))
          )}
        </div>
      )}

      {destinationError ? (
        <p className="m-0 text-[12px] text-[#d84545]">{destinationError}</p>
      ) : null}
      {saveError ? (
        <p className="m-0 text-[12px] text-[#d84545]" role="alert">
          {saveError}
        </p>
      ) : null}

      <SubmitButton type="button" variant="brand" disabled={uploading || !canSave} onClick={onSave}>
        {uploading ? "업로드 중…" : "업로드 시작"}
      </SubmitButton>
      <p className="m-0 text-center text-[11px] text-[var(--dl-color-text-tertiary)]">
        내 영상은 업로드 후 언제든 다운로드할 수 있어요.
      </p>
    </section>
  );
}
