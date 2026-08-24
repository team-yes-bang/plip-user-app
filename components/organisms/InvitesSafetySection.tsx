"use client";

import { NotificationIconToggle } from "@/components/molecules/NotificationIconToggle";
import { useState } from "react";

const INVITE_LINK = "dailyloop.app/join/7K2M9";

export function InvitesSafetySection() {
  const [copied, setCopied] = useState(false);
  const [notify, setNotify] = useState(true);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`https://${INVITE_LINK}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="flex w-full flex-col gap-3.5">
      <p className="m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)] text-[13px]">초대 링크의 수명과 신고 처리 상태를 명확히 확인</p>

      <h2 className="m-0 text-base font-semibold leading-[23px] text-[var(--dl-color-text-primary)] text-[17px]">초대 링크</h2>
      <div className="flex w-full items-center gap-[10px] border border-[var(--dl-color-border-default)] rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-surface)] p-[12px_14px] items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <p className="m-0 text-[11px] font-semibold text-[var(--dl-color-text-secondary)]">현재 링크</p>
          <p className="m-0 text-[13px] font-semibold text-[var(--dl-color-text-primary)]">{INVITE_LINK}</p>
        </div>
        <button type="button" className="inline-flex items-center justify-center h-[28px] rounded-[14px] p-[0_12px] text-xs font-semibold leading-none bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)]" onClick={copyLink}>
          {copied ? "복사됨" : "복사"}
        </button>
      </div>

      <div className="grid w-full grid-cols-[1fr_1fr] gap-[10px]">
        <button type="button" className="inline-flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[var(--dl-radius-md)] p-[12px_20px] text-sm font-medium leading-5 !no-underline border-0 bg-[var(--dl-color-bg-brand-subtle)] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] !text-[var(--dl-color-text-primary)] m-dlBtnNeutral">
          새 링크 발급
        </button>
        <button type="button" className="inline-flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[var(--dl-radius-md)] p-[12px_20px] text-sm font-medium leading-5 !no-underline border-0 bg-[var(--dl-color-bg-brand-subtle)] border-0 bg-[var(--dl-color-bg-brand)] !text-[var(--dl-color-text-inverse)] shadow-[none] [backdrop-filter:none] m-dlBtnPrimary">
          링크 공유
        </button>
      </div>

      <div className="w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] p-[16px_14px]" style={{ background: "var(--dl-color-bg-danger)" }}>
        <p className="m-0 text-[11px] font-medium text-[var(--dl-color-text-danger)]">
          재발급하면 기존 링크는 즉시 사용할 수 없어요.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="m-0 text-base font-semibold leading-[23px] text-[var(--dl-color-text-primary)] text-[17px]">신고 및 안전</h2>
        <span className="inline-flex items-center justify-center h-[28px] rounded-[14px] p-[0_12px] text-xs font-semibold leading-none bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)] bg-[var(--dl-color-bg-danger)] text-[var(--dl-color-text-danger)] m-dlBadgeDanger">처리 대기 1건</span>
      </div>

      <div className="flex w-full items-center gap-[10px] border border-[var(--dl-color-border-default)] rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-surface)] p-[12px_14px] flex-col items-stretch gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="m-0 text-[14px] font-semibold text-[var(--dl-color-text-primary)]">부적절한 콘텐츠</p>
            <p className="mt-1 text-[11px] text-[var(--dl-color-text-secondary)]">
              영상 · 오늘의 한 컷 · 신고 사유 작성됨
            </p>
          </div>
          <span className="inline-flex items-center justify-center h-[28px] rounded-[14px] p-[0_12px] text-xs font-semibold leading-none bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)] bg-[var(--dl-color-bg-danger)] text-[var(--dl-color-text-danger)] m-dlBadgeDanger">검토 필요</span>
        </div>
        <button type="button" className="inline-flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[var(--dl-radius-md)] p-[12px_20px] text-sm font-medium leading-5 !no-underline border-0 bg-[var(--dl-color-bg-brand-subtle)] border-0 bg-[var(--dl-color-bg-brand-subtle)] !text-[var(--dl-color-text-brand)] shadow-[none] [backdrop-filter:none] m-dlBtnSecondary">
          신고 내용 보기
        </button>
      </div>

      <div className="flex w-full items-center gap-[10px] border border-[var(--dl-color-border-default)] rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-surface)] p-[12px_14px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <p className="m-0 text-sm font-medium leading-5 text-[var(--dl-color-text-primary)] font-semibold">관리 알림</p>
          <p className="m-0 text-xs font-normal leading-[17px] text-[var(--dl-color-text-secondary)]">신고·추방·초대 링크 변경</p>
        </div>
        <NotificationIconToggle checked={notify} label="관리 알림" onChange={setNotify} />
      </div>
    </section>
  );
}
