"use client";
import leftoverStyles from "@/components/styles/leftover.module.css";

import { DailyIcon, IconLink, TextLink } from "@/components/atoms";
import { AgitListRow, ScreenHeader } from "@/components/molecules";
import { ROUTES } from "@/config/routes";
import type { UiAgit } from "@/types/agit/ui";
import { useMemo, useState } from "react";

type AgitListSectionProps = {
  items: UiAgit[];
  error?: string;
};

export function AgitListSection({ items, error }: AgitListSectionProps) {
  const [query, setQuery] = useState("");
  const keyword = query.trim().toLowerCase();

  const rooms = useMemo(
    () =>
      items.filter((room) => {
        if (!keyword) return true;
        const haystack = `${room.name} ${room.category ?? ""} ${room.topicSummary ?? ""}`.toLowerCase();
        return haystack.includes(keyword);
      }),
    [items, keyword],
  );

  const totalVideos = rooms.reduce((sum, room) => sum + (room.todayVideoCount ?? 0), 0);

  return (
    <section aria-label="내 아지트" className="flex flex-1 flex-col gap-[14px] p-[12px_24px_24px]">
      <ScreenHeader
        tone="plain"
        title="아지트"
        subtitle="참여 중인 방에서 오늘의 기록을 이어가요"
        trailing={
          <IconLink href={ROUTES.agit.search} label="검색">
            <DailyIcon name="search" size={20} />
          </IconLink>
        }
      />

      <label className="flex items-center gap-[10px] min-h-[48px] p-[0_14px] border border-[var(--dl-color-border-default)] rounded-[14px] bg-[var(--dl-color-bg-surface)]">
        <DailyIcon name="search" size={18} />
        <input
          className="flex-1 border-0 bg-[transparent] text-[15px] text-[var(--dl-color-text-primary)] [outline:none] placeholder:text-[var(--dl-color-text-tertiary)]"
          value={query}
          placeholder="제목 또는 참여 닉네임으로 검색"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {error ? (
        <p className="m-0 text-[14px] text-[var(--dl-color-text-secondary)]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-[12px] p-[2px_2px_0]">
        <div className="dl-azit-list__summary-copy">
          <p className="m-0 text-base font-semibold text-[var(--dl-color-text-primary)]">참여 중인 아지트</p>
          <p className="m-[4px_0_0] text-[11px] font-medium text-[var(--dl-color-text-brand)]">오늘 업로드 {totalVideos}개</p>
        </div>
        <span className="grid min-w-[34px] h-[34px] place-items-center p-[0_10px] rounded-[999px] bg-[var(--dl-color-bg-brand-subtle)] text-[13px] font-bold text-[var(--dl-color-text-brand)]">{rooms.length}</span>
      </div>

      <div className="grid grid-cols-2 gap-[12px]">
        {rooms.length > 0 ? (
          rooms.map((room) => <AgitListRow key={room.id} agit={room} />)
        ) : (
          <div className="col-span-2 flex flex-col items-center gap-[8px] p-[28px_16px] [border:1px_dashed_var(--dl-color-border-default)] rounded-[16px] text-center text-[var(--dl-color-text-secondary)]">
            <p>{keyword ? "검색 결과가 없어요." : "참여 중인 아지트가 없어요."}</p>
            <TextLink href={ROUTES.agit.create} className="!text-[var(--dl-color-text-brand)] text-sm font-medium leading-5 !no-underline hover:!underline">
              새 아지트 만들기
            </TextLink>
          </div>
        )}
      </div>

      <TextLink href={ROUTES.agit.create} className={`${leftoverStyles.dlAzitListCreate} mt-1 flex items-center gap-3 rounded-2xl border border-[var(--dl-color-border-brand)] bg-[linear-gradient(135deg,rgba(247,244,255,0.95),rgba(255,255,255,0.98))] p-3.5 text-[var(--dl-color-text-primary)] no-underline`}>
        <span className="grid w-[40px] h-[40px] place-items-center rounded-[12px] bg-[var(--dl-color-bg-brand)] text-[#fff] text-[22px] font-medium leading-none" aria-hidden>
          +
        </span>
        <span>
          <strong>아지트 만들기</strong>
          <small>새 루틴을 함께 시작해요</small>
        </span>
      </TextLink>
    </section>
  );
}
