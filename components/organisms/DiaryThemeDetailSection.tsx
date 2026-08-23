"use client";

import { loadDiaryThemeTimelinePageAction } from "@/actions/diaryActions";
import { ScreenTitle } from "@/components/atoms";
import { DiaryThemeClipGroup, HeaderBackLink, HeaderMenuButton, ScreenHeader } from "@/components/molecules";
import { ROUTES } from "@/config/routes";
import { mergeThemeDateGroups } from "@/lib/diary/mergeThemeDateGroups";
import type { UiDiaryThemeDateGroup } from "@/types/diary/ui";
import { useState } from "react";

type DiaryThemeDetailSectionProps = {
  themeId: string;
  themeName: string;
  dateGroups: UiDiaryThemeDateGroup[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  error?: string;
};

export function DiaryThemeDetailSection({
  themeId,
  themeName,
  dateGroups: initialDateGroups,
  initialNextCursor,
  initialHasMore,
  error: initialError,
}: DiaryThemeDetailSectionProps) {
  const [dateGroups, setDateGroups] = useState(initialDateGroups);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(initialError);

  async function loadMore() {
    if (!hasMore || !nextCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);
    const result = await loadDiaryThemeTimelinePageAction(themeId, nextCursor);
    setLoadingMore(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDateGroups((current) => mergeThemeDateGroups(current, result.data.dateGroups));
    setNextCursor(result.data.nextCursor);
    setHasMore(result.data.hasMore);
    setError(undefined);
  }

  return (
    <div className="flex flex-col gap-[1.15rem] p-[0.9rem_1rem_1.75rem]">
      <ScreenHeader
        tone="plain"
        titleAlign="center"
        leading={<HeaderBackLink href={ROUTES.diary.themes.root} />}
        title={<ScreenTitle className="text-[1rem] font-extrabold text-[#111]">{themeName}</ScreenTitle>}
        trailing={<HeaderMenuButton label="테마 옵션" onClick={() => undefined} />}
      />

      {error ? <p className="m-0 text-center text-sm text-red-600">{error}</p> : null}

      {dateGroups.length > 0 ? (
        dateGroups.map((group) => (
          <DiaryThemeClipGroup
            key={group.date}
            themeName={themeName}
            date={group.date}
            clipCount={group.clipCount}
            clips={group.clips}
            showDateLink
          />
        ))
      ) : (
        <p className="m-[2rem_0_0] text-center text-[0.85rem] font-semibold text-[rgba(0,_0,_0,_0.4)]">
          해당 테마의 클립이 없습니다.
        </p>
      )}

      {hasMore ? (
        <button
          type="button"
          className="h-[40px] w-full rounded-[var(--dc-btn-radius)] text-sm font-medium text-[var(--dc-accent)] disabled:opacity-50"
          disabled={loadingMore}
          aria-label="이전 기록 더보기"
          onClick={() => {
            void loadMore();
          }}
        >
          {loadingMore ? "불러오는 중..." : "더보기"}
        </button>
      ) : null}
    </div>
  );
}
