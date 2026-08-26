"use client";

import { IconButton, TextLink } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { CaptureCreateForm, CAPTURE_TOPIC_CREATE_NOTICE } from "@/components/molecules/CaptureCreateForm";
import { ROUTES } from "@/config/routes";
import { DIARY_THEME_NAME_MAX_LENGTH } from "@/types/diary/schema";
import { TOPIC_TITLE_MAX_LENGTH } from "@/types/topic/schema";
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

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

function EmptyDashNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#e3e0ed] bg-[#fbfaff] p-3.5 text-center">
      <p className="m-0 text-xs font-medium text-[#756e8a]">{children}</p>
    </div>
  );
}

export function CaptureDestinationEmptyPanel(props: CaptureDestinationEmptyPanelProps) {
  if (props.kind === "agit") {
    return (
      <div className="flex flex-col gap-3">
        <EmptyDashNote>참여 중인 아지트가 없어요.</EmptyDashNote>
        <p className="m-0 text-[11px] text-[var(--dl-color-text-tertiary)]">{NEW_TAB_HINT}</p>
        <div className="flex items-center gap-2">
          <TextLink
            href={ROUTES.agit.create}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ui.btn} ${ui.btnPrimary} w-auto no-underline`}
          >
            아지트 만들기
          </TextLink>
          {props.onReload ? (
            <IconButton variant="surface" label="목록 새로고침" onClick={props.onReload}>
              <RefreshCw className="size-5" />
            </IconButton>
          ) : null}
        </div>
      </div>
    );
  }

  if (props.kind === "topic") {
    return (
      <div className="flex flex-col gap-3.5">
        <EmptyDashNote>아직 토픽이 없어요</EmptyDashNote>
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
    <div className="flex flex-col gap-3.5">
      <EmptyDashNote>등록된 테마가 없습니다.</EmptyDashNote>
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
