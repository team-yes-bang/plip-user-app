"use client";

import { TextLink } from "@/components/atoms";
import {
  HeaderBackLink,
  PageContainer,
  ScreenHeader,
} from "@/components/molecules";
import { AGIT_MEMBERS, AGIT_TOPICS, getAgitById } from "@/config/agit-mock";
import { ROUTES } from "@/config/routes";
import type { UiAgit } from "@/types/agit/ui";
import { useEffect, useMemo, useState } from "react";

type AgitIdProps = { agitId: string };

export function AgitEnterSection({ agitId }: AgitIdProps) {
  const agit = getAgitById(agitId);
  return (
    <section className="flex flex-1 flex-col bg-[transparent] text-[var(--dc-fg-primary)] px-4 py-10 text-center">
      <div
        className="mx-auto mb-4 size-24 rounded-full"
        style={{ background: agit?.coverGradient ?? "#111" }}
        aria-hidden
      />
      <h1 className="text-xl font-semibold text-black">{agit?.name ?? "아지트"}</h1>
      <p className="mt-2 text-sm text-black/50">입장하면 토픽·채팅·클립을 볼 수 있어요.</p>
      <TextLink
        href={ROUTES.agit.detail(agitId)}
        className="inline-flex items-center justify-center gap-[0.5rem] border border-[var(--dc-glass-border)] rounded-[var(--dc-btn-radius)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px] p-[0.4rem_1rem] text-[0.8125rem] font-medium leading-[1.25rem] !text-[var(--dc-fg-primary)] !no-underline mt-6"
      >
        입장하기
      </TextLink>
    </section>
  );
}

export function AgitMembersSection({ agitId }: AgitIdProps) {
  return (
    <section className="flex flex-1 flex-col bg-[transparent] text-[var(--dc-fg-primary)]" aria-label="멤버 리스트">
      <ScreenHeader
        tone="glass"
        leading={<HeaderBackLink href={ROUTES.agit.detail(agitId)} />}
        title="멤버"
        titleAlign="center"
      />
      {AGIT_MEMBERS.map((member) => (
        <div key={member.id} className="flex items-center gap-[0.75rem] m-[0_1rem_0.5rem] p-[0.75rem_0.85rem] border border-[var(--dc-glass-border)] rounded-[var(--dc-radius)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px] !no-underline text-[inherit] transition-[background_0.15s_ease] hover:bg-[rgba(0,_0,_0,_0.03)]">
          <span className="w-[3.35rem] h-[3.35rem] rounded-[999px] shrink-0 shadow-[0_0_0_1.5px_#fff,_0_0_0_2.5px_rgba(0,_0,_0,_0.06)] bg-zinc-200" aria-hidden />
          <span className="flex-1">
            <span className="block font-semibold text-black">{member.name}</span>
            <span className="block text-xs text-black/45">
              {member.role === "owner" ? "방장" : "멤버"}
            </span>
          </span>
        </div>
      ))}
    </section>
  );
}

export function AgitTopicsSection({ agitId }: AgitIdProps) {
  return (
    <section className="flex flex-1 flex-col bg-[transparent] text-[var(--dc-fg-primary)]" aria-label="토픽 리스트">
      <ScreenHeader
        tone="glass"
        leading={<HeaderBackLink href={ROUTES.agit.detail(agitId)} />}
        title="토픽"
        titleAlign="center"
      />
      {AGIT_TOPICS.map((topic) => (
        <div key={topic.id} className="flex items-center gap-[0.75rem] m-[0_1rem_0.5rem] p-[0.75rem_0.85rem] border border-[var(--dc-glass-border)] rounded-[var(--dc-radius)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px] !no-underline text-[inherit] transition-[background_0.15s_ease] hover:bg-[rgba(0,_0,_0,_0.03)]">
          <span className="flex-1">
            <span className="block font-semibold text-black">{topic.title}</span>
            <span className="block text-xs text-black/45">
              클립 {topic.clipCount} · 1인 1영상
            </span>
          </span>
        </div>
      ))}
    </section>
  );
}

const DISCOVER_SORTS = [
  { id: "new", label: "신규" },
  { id: "popular", label: "인기" },
  { id: "rising", label: "급상승" },
] as const;

export function AgitSearchSection({ myAgitIds }: { myAgitIds: string[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<(typeof DISCOVER_SORTS)[number]["id"]>("new");
  const [rooms, setRooms] = useState<UiAgit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const myIds = useMemo(() => new Set(myAgitIds), [myAgitIds]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const { publishSearchMetricAction, searchDiscoverAgitsAction } = await import(
          "@/actions/agitActions"
        );
        const result = await searchDiscoverAgitsAction(query, sort);
        if (cancelled) return;
        if (!result.ok) {
          setRooms([]);
          setError(result.error);
          return;
        }
        setRooms(result.data);
        setError(null);
        for (const item of result.data) {
          void publishSearchMetricAction("SEARCH_IMPRESSION", item.id);
        }
      } catch (caught) {
        if (cancelled) return;
        setRooms([]);
        setError(caught instanceof Error ? caught.message : "검색을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, sort]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader
        leading={<HeaderBackLink href={ROUTES.agit.root} />}
        title="검색"
        titleAlign="center"
      />

      <PageContainer aria-label="아지트 검색" className="flex-1">
        <label className="flex w-full items-center gap-[10px] min-h-12 rounded-[14px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] px-4">
          <input
            type="search"
            value={query}
            autoFocus
            placeholder="아지트 이름 검색"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm leading-5 text-[var(--dl-color-text-primary)] outline-none placeholder:text-[var(--dl-color-text-tertiary)]"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="flex gap-2" role="tablist" aria-label="검색 정렬">
          {DISCOVER_SORTS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={sort === item.id}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                sort === item.id
                  ? "bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)]"
                  : "text-[var(--dl-color-text-secondary)]"
              }`}
              onClick={() => setSort(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="m-0 text-[14px] text-[var(--dl-color-text-secondary)]" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="m-0 py-6 text-center text-sm text-[var(--dl-color-text-secondary)]">불러오는 중…</p>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-2 gap-[12px]">
            {rooms.map((room) => {
              const joined = myIds.has(room.id);
              const href = joined ? ROUTES.agit.detail(room.id) : ROUTES.agit.preview(room.id);
              return (
                <TextLink
                  key={room.id}
                  href={href}
                  className="overflow-hidden rounded-[18px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] p-3 text-[inherit] no-underline"
                  onClick={() => {
                    void import("@/actions/agitActions").then(({ publishSearchMetricAction }) => {
                      void publishSearchMetricAction("SEARCH_CLICK", room.id);
                    });
                  }}
                >
                  <p className="m-0 text-[13px] font-semibold text-[var(--dl-color-text-primary)]">
                    {room.name}
                  </p>
                  <p className="m-[4px_0_0] line-clamp-2 text-[11px] text-[var(--dl-color-text-secondary)]">
                    {room.description || (joined ? "참여 중" : "입장 요청")}
                  </p>
                </TextLink>
              );
            })}
          </div>
        ) : (
          <p className="m-0 py-6 text-center text-sm text-[var(--dl-color-text-secondary)]">
            {query.trim() ? "일치하는 아지트가 없어요" : "아직 검색할 아지트가 없어요."}
          </p>
        )}
      </PageContainer>
    </div>
  );
}
