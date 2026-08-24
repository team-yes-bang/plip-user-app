import { DailyIcon, TextLink } from "@/components/atoms";
import { MemberManageRow } from "@/components/molecules/MemberManageRow";
import { NoticeCard } from "@/components/molecules/NoticeCard";
import { ROUTES } from "@/config/routes";
import type { UiAgit } from "@/types/agit/ui";

type RoomManageHubProps = {
  agit: UiAgit;
};

const TILES = [
  {
    href: "info",
    title: "방 정보",
    description: "제목·소개·정원 설정",
    icon: "image" as const,
    tone: "brand" as const,
  },
  {
    href: "topics",
    title: "토픽",
    description: "진행 날짜·등록 규칙",
    icon: "list" as const,
    tone: "brand" as const,
  },
  {
    href: "members",
    title: "멤버 관리",
    description: "추방·방장 위임",
    icon: "users" as const,
    tone: "danger" as const,
  },
  {
    href: "invite",
    title: "초대 링크",
    description: "복사·재발급",
    icon: "link" as const,
    tone: "brand" as const,
  },
];

export function RoomManageHub({ agit }: RoomManageHubProps) {
  const hrefs = {
    info: ROUTES.agit.profile(agit.id),
    topics: ROUTES.agit.topics(agit.id),
    members: ROUTES.agit.members(agit.id),
    invite: ROUTES.agit.invite(agit.id),
  };

  const memberLabel = agit.maxMembers ? `${agit.memberCount}/${agit.maxMembers}명` : `${agit.memberCount}명`;

  return (
    <section className="flex flex-col gap-[16px]" aria-label="방 관리">
      <NoticeCard
        tone="brand"
        className="gap-[5px] min-h-[76px] p-[12px_14px] rounded-[14px] m-dlNoticeCardSummary"
        title={agit.name}
        body={`${memberLabel} · 아지트`}
      />

      <div className="grid grid-cols-[1fr_1fr] gap-[14px]">
        {TILES.map((tile) => (
          <TextLink
            key={tile.title}
            href={hrefs[tile.href as keyof typeof hrefs]}
            className={`flex min-h-[112px] flex-col gap-1.5 rounded-2xl p-3.5 no-underline ${tile.tone === "danger" ? "bg-[var(--dl-color-bg-danger)]" : "bg-[var(--dl-color-bg-brand-subtle)]"}`}
          >
            <span
              className={`grid size-7 place-items-center rounded-lg ${tile.tone === "danger" ? "bg-[rgba(216,69,69,0.12)] text-[var(--dl-color-text-danger)]" : "bg-[rgba(108,75,244,0.12)] text-[var(--dl-color-text-brand)]"}`}
              aria-hidden
            >
              <DailyIcon name={tile.icon} size={16} />
            </span>
            <p className={`m-0 text-sm font-semibold ${tile.tone === "danger" ? "text-[var(--dl-color-text-danger)]" : "text-[var(--dl-color-text-primary)]"}`}>{tile.title}</p>
            <p className={`m-0 text-[10px] leading-[14px] ${tile.tone === "danger" ? "text-[var(--dl-color-text-danger)]" : "text-[var(--dl-color-text-secondary)]"}`}>{tile.description}</p>
          </TextLink>
        ))}
      </div>

      <h2 className="m-0 text-base font-semibold text-[var(--dl-color-text-primary)]">멤버</h2>
      <MemberManageRow
        name={agit.ownerName ?? "안지민"}
        meta="새벽 루틴 · 오늘 참여"
        host
        showMenu
        variant="hub"
      />
      <NoticeCard
        tone="danger"
        className="gap-[4px] min-h-[70px] p-[12px_14px] rounded-[14px] m-dlNoticeCardCompactDanger"
        title="토픽 삭제 제한"
        body="등록 영상이 없는 토픽만 삭제할 수 있어요."
      />
    </section>
  );
}
