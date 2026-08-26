"use client";

import { TextLink } from "@/components/atoms/TextLink";
import { ui } from "@/components/atoms/styles";
import { CaptureCreateForm, CAPTURE_TOPIC_CREATE_NOTICE } from "@/components/molecules/CaptureCreateForm";
import { ROUTES } from "@/config/routes";
import { DIARY_THEME_NAME_MAX_LENGTH } from "@/types/diary/schema";
import { TOPIC_TITLE_MAX_LENGTH } from "@/types/topic/schema";

const NEW_TAB_HINT = "새 탭에서 열립니다. 촬영 화면 탭으로 돌아와 업로드를 이어주세요.";

type CaptureDestinationEmptyPanelProps =
  | {
      kind: "agit";
      onReload?: () => void;
    }
  | {
      kind: "topic";
      agitUuid: string;
      busy?: boolean;
      error?: string | null;
      onCreateTopic: (title: string) => void | Promise<void>;
    }
  | {
      kind: "theme";
      busy?: boolean;
      error?: string | null;
      onCreateTheme: (name: string) => void | Promise<void>;
    };

export function CaptureDestinationEmptyPanel(props: CaptureDestinationEmptyPanelProps) {
  if (props.kind === "agit") {
    return (
      <div className="flex flex-col gap-3 rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-surface)] px-3.5 py-4">
        <p className="m-0 text-[13px] leading-5 text-[var(--dl-color-text-secondary)]">
          참여 중인 아지트가 없어요. 아지트를 만들거나 가입한 뒤 이 탭으로 돌아와 주세요.
        </p>
        <p className="m-0 text-[11px] text-[var(--dl-color-text-tertiary)]">{NEW_TAB_HINT}</p>
        <div className="flex flex-wrap gap-2">
          <TextLink
            href={ROUTES.agit.create}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-brand)] px-4 text-sm font-medium text-[var(--dl-color-text-inverse)] no-underline"
          >
            아지트 만들기
          </TextLink>
          <TextLink
            href={ROUTES.agit.root}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center rounded-[var(--dl-radius-md)] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] px-4 text-sm font-medium text-[var(--dl-color-text-primary)] no-underline"
          >
            아지트 둘러보기
          </TextLink>
        </div>
        {props.onReload ? (
          <button
            type="button"
            className={`${ui.link} cursor-pointer self-start border-0 bg-transparent p-0`}
            onClick={props.onReload}
          >
            참여 아지트 목록 새로고침
          </button>
        ) : null}
      </div>
    );
  }

  if (props.kind === "topic") {
    return (
      <div className="flex flex-col gap-3.5 rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-surface)] px-3.5 py-4">
        <p className="m-0 text-[13px] leading-5 text-[var(--dl-color-text-secondary)]">
          이 아지트에 등록할 토픽이 없어요. 아래에서 바로 만들 수 있어요.
        </p>
        <CaptureCreateForm
          idPrefix="empty-topic"
          nameLabel="토픽 이름"
          placeholder="점심 메뉴"
          hint={`최대 ${TOPIC_TITLE_MAX_LENGTH}자`}
          maxLength={TOPIC_TITLE_MAX_LENGTH}
          submitLabel="토픽 만들기"
          busy={props.busy}
          error={props.error}
          noticeTitle={CAPTURE_TOPIC_CREATE_NOTICE.title}
          noticeBody={CAPTURE_TOPIC_CREATE_NOTICE.body}
          onSubmit={props.onCreateTopic}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-surface)] px-3.5 py-4">
      <p className="m-0 text-[13px] leading-5 text-[var(--dl-color-text-secondary)]">
        다이어리 테마가 없어요. 아래에서 바로 만들 수 있어요.
      </p>
      <CaptureCreateForm
        idPrefix="empty-theme"
        nameLabel="테마 이름"
        placeholder="예: 맛집 탐방, 운동 기록"
        hint={`최대 ${DIARY_THEME_NAME_MAX_LENGTH}자`}
        maxLength={DIARY_THEME_NAME_MAX_LENGTH}
        submitLabel="테마 만들기"
        busy={props.busy}
        error={props.error}
        onSubmit={props.onCreateTheme}
      />
    </div>
  );
}
