"use client";

import { listTopicsByStatusAction } from "@/actions/topicActions";
import { DailyIcon, TextLink } from "@/components/atoms";
import { ManageListRow } from "@/components/molecules/ManageListRow";
import { ROUTES } from "@/config/routes";
import type { UiAgitRole } from "@/types/agit/ui";
import type { ApiTopicListStatus } from "@/types/topic/api";
import type { UiTopicListItem, UiTopicListSectionKey, UiTopicListSections } from "@/types/topic/ui";
import { useState } from "react";

const INITIAL_LIMIT = 10;
const MORE_LIMIT = 20;

const SECTIONS: { id: UiTopicListSectionKey; label: string; status: ApiTopicListStatus }[] = [
  { id: "ongoing", label: "진행중", status: "ONGOING" },
  { id: "upcoming", label: "다가오는", status: "UPCOMING" },
  { id: "past", label: "지난", status: "PAST" },
];

type TopicsLayoutSectionProps = {
  agitId: string;
  sections: UiTopicListSections;
  myRole?: UiAgitRole;
  currentUserUuid?: string;
};

export function TopicsLayoutSection({
  agitId,
  sections,
  myRole,
  currentUserUuid,
}: TopicsLayoutSectionProps) {
  const [openSections, setOpenSections] = useState<Record<UiTopicListSectionKey, boolean>>({
    ongoing: true,
    upcoming: true,
    past: true,
  });
  const [itemsBySection, setItemsBySection] = useState<Record<UiTopicListSectionKey, UiTopicListItem[]>>({
    ongoing: sections.ongoing.items,
    upcoming: sections.upcoming.items,
    past: sections.past.items,
  });
  const [errors, setErrors] = useState<Record<UiTopicListSectionKey, string | undefined>>({
    ongoing: sections.ongoing.error,
    upcoming: sections.upcoming.error,
    past: sections.past.error,
  });
  const [expanded, setExpanded] = useState<Record<UiTopicListSectionKey, boolean>>({
    ongoing: false,
    upcoming: false,
    past: false,
  });
  const [loadingMore, setLoadingMore] = useState<Record<UiTopicListSectionKey, boolean>>({
    ongoing: false,
    upcoming: false,
    past: false,
  });

  function toggleSection(id: UiTopicListSectionKey) {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  }

  async function loadMore(id: UiTopicListSectionKey, status: ApiTopicListStatus) {
    if (loadingMore[id] || expanded[id]) return;
    setLoadingMore((current) => ({ ...current, [id]: true }));
    const result = await listTopicsByStatusAction(agitId, status, MORE_LIMIT);
    setLoadingMore((current) => ({ ...current, [id]: false }));
    if (!result.ok) {
      setErrors((current) => ({ ...current, [id]: result.error }));
      return;
    }
    setItemsBySection((current) => ({ ...current, [id]: result.data }));
    setExpanded((current) => ({ ...current, [id]: true }));
    setErrors((current) => ({ ...current, [id]: undefined }));
  }

  return (
    <section className="flex w-full flex-col gap-3.5">
      <p className="m-0 text-[13px] font-normal leading-5 text-[var(--dl-color-text-secondary)]">
        토픽을 진행 상태별로 보고 만들 수 있어요
      </p>

      <TextLink
        href={ROUTES.agit.topicCreate(agitId)}
        className="m-dlBtnSecondary inline-flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[var(--dl-radius-md)] border-0 bg-[var(--dl-color-bg-brand-subtle)] p-[12px_20px] text-sm font-medium leading-5 !text-[var(--dl-color-text-brand)] !no-underline shadow-[none] [backdrop-filter:none]"
      >
        <DailyIcon name="plus" size={16} />
        토픽 만들기
      </TextLink>

      {SECTIONS.map((section) => {
        const items = itemsBySection[section.id];
        const open = openSections[section.id];
        const error = errors[section.id];
        const canLoadMore =
          !error && !expanded[section.id] && items.length >= INITIAL_LIMIT;

        return (
          <div key={section.id} className="flex flex-col gap-2">
            <button
              type="button"
              className="flex min-h-[40px] items-center justify-between"
              onClick={() => toggleSection(section.id)}
              aria-expanded={open}
            >
              <h2 className="m-0 text-[17px] font-semibold leading-[23px] text-[var(--dl-color-text-primary)]">
                {section.label}
              </h2>
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-[28px] items-center justify-center rounded-[14px] bg-[var(--dl-color-bg-brand-subtle)] p-[0_12px] text-xs font-semibold leading-none text-[var(--dl-color-text-brand)]">
                  {items.length}개
                </span>
                <DailyIcon
                  name="chevronRight"
                  size={16}
                  className={open ? "rotate-90" : ""}
                />
              </span>
            </button>

            {open ? (
              <>
                {error ? (
                  <p className="m-0 text-[13px] text-[var(--dl-color-text-danger)]">{error}</p>
                ) : items.length === 0 ? (
                  <p className="m-0 text-[13px] text-[var(--dl-color-text-secondary)]">
                    아직 토픽이 없어요
                  </p>
                ) : (
                  items.map((topic) => {
                    const canEdit =
                      myRole === "HOST" ||
                      (Boolean(currentUserUuid) && topic.creatorUuid === currentUserUuid);

                    return (
                      <ManageListRow
                        key={topic.id}
                        title={
                          <TextLink
                            href={ROUTES.agit.topicFeed(agitId, topic.id)}
                            className="flex min-w-0 flex-col gap-[2px] !text-inherit !no-underline"
                          >
                            <p className="m-0 text-sm font-semibold leading-5 text-[var(--dl-color-text-primary)]">
                              {topic.title || "제목 없음"}
                            </p>
                            <p className="m-0 text-xs font-normal leading-[17px] text-[var(--dl-color-text-secondary)]">
                              {topic.startAtLabel}
                            </p>
                          </TextLink>
                        }
                        trailing={
                          <div className="flex flex-col items-end gap-1.5">
                            <span
                              className={`inline-flex h-[28px] items-center justify-center rounded-[14px] p-[0_12px] text-xs font-semibold leading-none ${topic.videoCount === 0
                                  ? "m-dlBadgeSuccess bg-[var(--dl-color-bg-success)] text-[var(--dl-color-text-success)]"
                                  : "bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)]"
                                }`}
                            >
                              {topic.videoCount}개 영상
                            </span>
                            {canEdit ? (
                              <TextLink
                                href={ROUTES.agit.topicEdit(agitId, topic.id)}
                                className="text-[12px] font-semibold !text-[var(--dl-color-text-brand)] !no-underline"
                              >
                                편집
                              </TextLink>
                            ) : null}
                          </div>
                        }
                      />
                    );
                  })
                )}
                {open && canLoadMore ? (
                  <button
                    type="button"
                    className="h-[40px] rounded-[var(--dl-radius-md)] text-sm font-medium text-[var(--dl-color-text-brand)] disabled:opacity-50"
                    disabled={loadingMore[section.id]}
                    onClick={() => loadMore(section.id, section.status)}
                  >
                    {loadingMore[section.id] ? "불러오는 중..." : "더보기"}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
