"use client";

import { Input, SubmitButton } from "@/components/atoms";
import { TextLink } from "@/components/atoms/TextLink";
import { ROUTES } from "@/config/routes";
import { TOPIC_TITLE_MAX_LENGTH } from "@/types/topic/schema";
import { useState } from "react";

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
      <div className="flex flex-col gap-3 rounded-[16px] border border-dashed border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] p-4">
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
            className="self-start border-0 bg-transparent p-0 text-[13px] font-medium text-[var(--dl-color-text-brand)]"
            onClick={props.onReload}
          >
            참여 아지트 목록 새로고침
          </button>
        ) : null}
      </div>
    );
  }

  if (props.kind === "topic") {
    return <TopicEmptyForm {...props} />;
  }

  return <ThemeEmptyForm {...props} />;
}

function TopicEmptyForm({
  busy = false,
  error = null,
  onCreateTopic,
}: Omit<Extract<CaptureDestinationEmptyPanelProps, { kind: "topic" }>, "kind" | "agitUuid">) {
  const [title, setTitle] = useState("");

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-dashed border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] p-4">
      <p className="m-0 text-[13px] leading-5 text-[var(--dl-color-text-secondary)]">
        이 아지트에 등록할 토픽이 없어요. 아래에서 바로 만들 수 있어요.
      </p>
      <Input
        value={title}
        maxLength={TOPIC_TITLE_MAX_LENGTH}
        placeholder="토픽 이름"
        variant="daily"
        disabled={busy}
        onChange={(event) => setTitle(event.target.value)}
      />
      <SubmitButton
        type="button"
        variant="brand"
        className="!w-auto shrink-0 self-start px-4"
        disabled={busy || !title.trim()}
        onClick={() => void onCreateTopic(title.trim())}
      >
        {busy ? "만드는 중…" : "토픽 만들기"}
      </SubmitButton>
      {error ? (
        <p className="m-0 text-[12px] text-[#d84545]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ThemeEmptyForm({
  busy = false,
  error = null,
  onCreateTheme,
}: Extract<CaptureDestinationEmptyPanelProps, { kind: "theme" }>) {
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-dashed border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] p-4">
      <p className="m-0 text-[13px] leading-5 text-[var(--dl-color-text-secondary)]">
        다이어리 테마가 없어요. 아래에서 바로 만들 수 있어요.
      </p>
      <Input
        value={name}
        placeholder="테마 이름"
        variant="daily"
        disabled={busy}
        onChange={(event) => setName(event.target.value)}
      />
      <SubmitButton
        type="button"
        variant="brand"
        className="!w-auto shrink-0 self-start px-4"
        disabled={busy || !name.trim()}
        onClick={() => void onCreateTheme(name.trim())}
      >
        {busy ? "만드는 중…" : "테마 만들기"}
      </SubmitButton>
      {error ? (
        <p className="m-0 text-[12px] text-[#d84545]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
