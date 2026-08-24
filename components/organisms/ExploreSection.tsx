"use client";

import { DailyIcon, Pill, TextLink } from "@/components/atoms";
import { ExploreNav, ScreenHeader } from "@/components/molecules";
import { AGIT_LIST } from "@/config/agit-mock";
import { ROUTES } from "@/config/routes";
import { useState } from "react";

const CATEGORIES = ["추천", "운동", "공부", "일상"] as const;
const FEATURED_ID = "agit-run";
const ACTIVE_IDS = ["agit-study", "agit-dish"];

function roomHref(id: string, joined?: boolean) {
  return joined ? ROUTES.agit.detail(id) : ROUTES.agit.enter(id);
}

function memberLabel(count: number, max?: number) {
  return max ? `${count}/${max}명` : `${count}명`;
}

export function ExploreSection() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("추천");

  const featured = AGIT_LIST.find((room) => room.id === FEATURED_ID);
  const keyword = query.trim();
  const rooms = AGIT_LIST.filter((room) => {
    if (category !== "추천" && room.category !== category) return false;
    if (category === "추천" && !ACTIVE_IDS.includes(room.id) && room.id !== FEATURED_ID) {
      return Boolean(keyword);
    }
    if (!keyword) return true;
    const haystack = `${room.name} ${room.category ?? ""} ${room.description}`;
    return haystack.includes(keyword);
  });

  const listRooms = rooms.filter((room) => room.id !== FEATURED_ID || category !== "추천");
  const showFeatured =
    featured &&
    category === "추천" &&
    (!query.trim() || `${featured.name} ${featured.category ?? ""}`.includes(query.trim()));

  return (
    <section className="flex w-full flex-col gap-4" aria-label="새로운 루프 찾기">
      <ScreenHeader
        tone="plain"
        title="새로운 루프 찾기"
        subtitle="목적이 맞는 방에 참여해요"
        trailing={
          <TextLink href={ROUTES.mypage.root} className="block h-[40px] w-[40px] overflow-hidden rounded-[20px] no-underline" aria-label="프로필">
            <img src="/plip/daily-loop/explore-avatar.svg" alt="" width={40} height={40} />
          </TextLink>
        }
      />

      <label className="flex w-full items-center gap-[10px] h-[48px] border border-[var(--dl-color-border-default)] rounded-[14px] bg-[var(--dl-color-bg-elevated)] p-[0_16px]">
        <DailyIcon name="search" size={20} />
        <input
          className="min-w-0 flex-1 border-0 bg-[transparent] text-sm leading-5 text-[var(--dl-color-text-primary)] [outline:none] placeholder:text-[var(--dl-color-text-tertiary)]"
          value={query}
          placeholder="방 이름, 목표, 카테고리 검색"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-[8px] items-center">
        {CATEGORIES.map((item) => (
          <Pill
            key={item}
            selected={category === item}
            className="h-[32px] p-[0_12px] rounded-[99px] bg-[var(--dl-color-bg-elevated)] text-[11px] leading-[16px] m-dlPillCompact"
            onClick={() => setCategory(item)}
          >
            {item}
          </Pill>
        ))}
      </div>

      {showFeatured && featured ? (
        <TextLink href={roomHref(featured.id, featured.joined)} className="relative flex w-full flex-col items-start gap-[10px] overflow-hidden rounded-[20px] bg-[var(--dl-color-bg-brand-subtle)] p-[18px] !no-underline no-underline">
          <p className="m-0 text-[24px] font-semibold leading-[34px] text-[var(--dl-color-text-primary)]">
            러닝 메이트의
            <br />
            30일 기록
          </p>
          <p className="m-0 text-[13px] font-medium leading-[18px] text-[var(--dl-color-text-secondary)]">
            #{featured.category} · {memberLabel(featured.memberCount, featured.maxMembers)} · 오늘 3개
          </p>
          <span className="absolute right-[18px] bottom-[-20px] w-[124px] h-[124px] pointer-events-none">
            <img src="/plip/daily-loop/explore-glow.svg" alt="" width={124} height={124} />
          </span>
        </TextLink>
      ) : null}

      <h2 className="m-0 text-[18px] font-semibold leading-[26px] text-[var(--dl-color-text-primary)]">
        지금 활발한 방
      </h2>
      <div className="flex w-full flex-col gap-2.5">
        {(category === "추천" && !query.trim()
          ? AGIT_LIST.filter((room) => ACTIVE_IDS.includes(room.id))
          : listRooms
        ).map((room) => (
          <TextLink
            key={room.id}
            href={roomHref(room.id, room.joined)}
            className="flex w-full items-center gap-[12px] min-h-[82px] border border-[var(--dl-color-border-default)] rounded-[14px] bg-[var(--dl-color-bg-elevated)] p-[12px] !no-underline no-underline"
          >
            <span className="w-[58px] h-[58px] shrink-0 overflow-hidden rounded-[12px] [&_img]:w-full [&_img]:h-full [&_img]:object-cover" style={{ background: room.coverGradient }}>
              {room.thumbnailSrc ? (
                <img src={room.thumbnailSrc} alt="" width={58} height={58} />
              ) : null}
            </span>
            <span>
              <p className="m-0 text-[15px] font-semibold leading-[21px] text-[var(--dl-color-text-primary)]">{room.name}</p>
              <p className="m-[4px_0_0] text-xs leading-[17px] text-[var(--dl-color-text-secondary)]">
                {room.category ? `#${room.category} · ` : ""}
                {memberLabel(room.memberCount, room.maxMembers)}
              </p>
            </span>
          </TextLink>
        ))}
      </div>

      <ExploreNav active="explore" />
    </section>
  );
}
