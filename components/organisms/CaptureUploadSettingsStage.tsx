"use client";

import { SubmitButton } from "@/components/atoms";
import { CAPTURE_TOPIC_CREATE_NOTICE } from "@/components/molecules/CaptureCreateForm";
import { CaptureDestinationEmptyPanel } from "@/components/molecules/CaptureDestinationEmptyPanel";
import { CaptureInlineCreateField } from "@/components/molecules/CaptureInlineCreateField";
import { DestinationToggle, type DestinationId } from "@/components/molecules/DestinationToggle";
import { HeaderBackButton, PageContainer, ScreenHeader } from "@/components/molecules";
import { TopicChip } from "@/components/molecules/TopicChip";
import type { UiAgit } from "@/types/agit/ui";
import { DIARY_THEME_NAME_MAX_LENGTH } from "@/types/diary/schema";
import type { UiDiaryTheme } from "@/types/diary/ui";
import type { UiTopicListItem } from "@/types/topic/ui";
import { TOPIC_TITLE_MAX_LENGTH } from "@/types/topic/schema";

type CaptureUploadSettingsStageProps = {
  destinationKind: DestinationId;
  agits: UiAgit[];
  topics: UiTopicListItem[];
  themes: UiDiaryTheme[];
  selectedAgitUuid: string;
  selectedTopicUuid: string;
  selectedThemeId: string;
  destinationsLoading: boolean;
  destinationError: string | null;
  inlineCreateError: string | null;
  creatingInline: boolean;
  uploading: boolean;
  saveError: string | null;
  thumbnailPreviewUrl: string | null;
  pendingPublishVideoUuid: string | null;
  onDestinationKindChange: (value: DestinationId) => void;
  onAgitChange: (agitUuid: string) => void;
  onTopicChange: (topicUuid: string) => void;
  onThemeChange: (themeId: string) => void;
  onCreateTopic: (title: string) => void | Promise<void>;
  onCreateTheme: (name: string) => void | Promise<void>;
  onReloadDestinations: () => void;
  onBack: () => void;
  onSave: () => void;
  onRetryPublish: () => void;
};

export function CaptureUploadSettingsStage({
  destinationKind,
  agits,
  topics,
  themes,
  selectedAgitUuid,
  selectedTopicUuid,
  selectedThemeId,
  destinationsLoading,
  destinationError,
  inlineCreateError,
  creatingInline,
  uploading,
  saveError,
  thumbnailPreviewUrl,
  pendingPublishVideoUuid,
  onDestinationKindChange,
  onAgitChange,
  onTopicChange,
  onThemeChange,
  onCreateTopic,
  onCreateTheme,
  onReloadDestinations,
  onBack,
  onSave,
  onRetryPublish,
}: CaptureUploadSettingsStageProps) {
  const selectedAgit = agits.find((agit) => agit.id === selectedAgitUuid);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicUuid);
  const selectedTheme = themes.find((theme) => theme.id === selectedThemeId);
  const canSaveDestination =
    destinationKind === "diary"
      ? Boolean(selectedThemeId && selectedTheme?.themeUuid)
      : Boolean(selectedAgitUuid && selectedTopicUuid);
  const isPublishRetry = Boolean(pendingPublishVideoUuid);
  const canSave = canSaveDestination && (isPublishRetry || Boolean(thumbnailPreviewUrl));

  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[var(--dl-color-bg-elevated)] text-[var(--dl-color-text-primary)]"
      aria-label="업로드 설정"
      aria-busy={destinationsLoading || uploading || creatingInline}
    >
      <ScreenHeader
        leading={<HeaderBackButton onClick={onBack} />}
        title="업로드 설정"
      />

      <PageContainer aria-label="업로드 설정" className="flex-1">
      {isPublishRetry ? (
        <div className="rounded-[16px] bg-[var(--dl-color-bg-brand-subtle)] px-4 py-3.5">
          <p className="m-0 text-[13px] leading-5 text-[var(--dl-color-text-brand)]">
            영상 업로드는 완료됐어요. 아래에서 목록 연결만 다시 시도해 주세요.
          </p>
        </div>
      ) : null}

      {thumbnailPreviewUrl ? (
        <div className="flex items-center gap-3">
          <img
            src={thumbnailPreviewUrl}
            alt="등록한 썸네일"
            className="h-[72px] w-[40px] rounded-[8px] object-cover"
          />
          <p className="m-0 text-[13px] text-[var(--dl-color-text-secondary)]">썸네일이 함께 업로드됩니다.</p>
        </div>
      ) : isPublishRetry ? null : (
        <p className="m-0 text-[12px] font-semibold text-[var(--dl-color-text-danger)]" role="alert">
          썸네일을 등록해 주세요. 이전 화면에서 이미지를 고르거나 장면을 담을 수 있어요.
        </p>
      )}

      <p className="m-0 text-[15px] font-semibold">기록 목적지</p>
      <DestinationToggle value={destinationKind} onChange={onDestinationKindChange} />

      {destinationKind === "agit" && selectedAgit && selectedTopic ? (
        <div className="flex min-h-[84px] flex-col justify-center gap-[6px] rounded-[16px] bg-[var(--dl-color-bg-brand-subtle)] px-4 py-3.5">
          <p className="m-0 text-[15px] font-semibold">{selectedTopic.title || selectedAgit.name}</p>
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

      {destinationsLoading ? (
        <p className="m-0 text-[12px] text-[var(--dl-color-text-secondary)]">목록 불러오는 중…</p>
      ) : destinationKind === "agit" ? (
        agits.length === 0 ? (
          <CaptureDestinationEmptyPanel kind="agit" onReload={onReloadDestinations} />
        ) : (
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1 text-[13px] font-semibold">
              아지트
              <select
                value={selectedAgitUuid}
                className="min-h-10 rounded-[12px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] px-3 text-[13px] font-medium disabled:opacity-50"
                disabled={creatingInline || uploading}
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
            {!selectedAgitUuid ? (
              <p className="m-0 text-[12px] text-[var(--dl-color-text-secondary)]">
                아지트를 선택하면 토픽을 고를 수 있어요.
              </p>
            ) : topics.length === 0 ? (
              <CaptureDestinationEmptyPanel
                kind="topic"
                agitUuid={selectedAgitUuid}
                busy={creatingInline}
                error={inlineCreateError}
                onCreateTopic={onCreateTopic}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => {
                    const uploadedToday = topic.uploadedByMe === true;
                    return (
                    <TopicChip
                      key={topic.id}
                      selected={selectedTopicUuid === topic.id}
                      disabled={uploadedToday}
                      onClick={() => {
                        if (!uploadedToday) {
                          onTopicChange(topic.id);
                        }
                      }}
                    >
                      {uploadedToday ? `${topic.title || "제목 없음"} · 오늘 완료` : topic.title || "제목 없음"}
                    </TopicChip>
                    );
                  })}
                </div>
                <CaptureInlineCreateField
                  key={`topic-create-${topics.length}`}
                  label="새 토픽 만들기"
                  title="토픽 만들기"
                  idPrefix="capture-topic-create"
                  nameLabel="토픽 이름"
                  placeholder="점심 메뉴"
                  hint={`최대 ${TOPIC_TITLE_MAX_LENGTH}자`}
                  actionLabel="토픽 만들기"
                  maxLength={TOPIC_TITLE_MAX_LENGTH}
                  busy={creatingInline}
                  error={inlineCreateError}
                  noticeTitle={CAPTURE_TOPIC_CREATE_NOTICE.title}
                  noticeBody={CAPTURE_TOPIC_CREATE_NOTICE.body}
                  onSubmit={onCreateTopic}
                />
              </div>
            )}
          </div>
        )
      ) : themes.length === 0 ? (
        <CaptureDestinationEmptyPanel
          kind="theme"
          busy={creatingInline}
          error={inlineCreateError}
          onCreateTheme={onCreateTheme}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <TopicChip
                key={theme.id}
                selected={selectedThemeId === theme.id}
                onClick={() => onThemeChange(theme.id)}
              >
                {theme.name}
              </TopicChip>
            ))}
          </div>
          <CaptureInlineCreateField
            key={`theme-create-${themes.length}`}
            label="새 테마 만들기"
            title="테마 생성"
            idPrefix="capture-theme-create"
            nameLabel="테마 이름"
            placeholder="예: 맛집 탐방, 운동 기록"
            hint={`최대 ${DIARY_THEME_NAME_MAX_LENGTH}자`}
            actionLabel="테마 만들기"
            maxLength={DIARY_THEME_NAME_MAX_LENGTH}
            busy={creatingInline}
            error={inlineCreateError}
            onSubmit={onCreateTheme}
          />
        </div>
      )}

      {destinationError ? (
          <p className="m-0 text-[12px] font-semibold text-[var(--dl-color-text-danger)]" role="alert">
          {destinationError}
        </p>
      ) : null}
      {saveError ? (
        <p className="m-0 text-[12px] font-semibold text-[var(--dl-color-text-danger)]" role="alert">
          {saveError}
        </p>
      ) : null}

      {isPublishRetry ? (
        <SubmitButton
          type="button"
          variant="brand"
          disabled={uploading || !canSave}
          onClick={onRetryPublish}
        >
          {uploading ? "연결 중…" : "목록 연결 다시 시도"}
        </SubmitButton>
      ) : (
        <SubmitButton type="button" variant="brand" disabled={uploading || !canSave} onClick={onSave}>
          {uploading ? "업로드 중…" : "업로드 시작"}
        </SubmitButton>
      )}
      <p className="m-0 text-center text-[11px] text-[var(--dl-color-text-tertiary)]">
        내 영상은 업로드 후 언제든 다운로드할 수 있어요.
      </p>
      </PageContainer>
    </div>
  );
}
