import { TextLink } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import type { UiAgit } from "@/types/agit/ui";

const GUIDE_STEPS = [
  {
    step: "1",
    title: "아지트 찾기",
    body: "최신·추천 목록에서 목적에 맞는 아지트를 고르거나, 검색으로 이름을 찾습니다.",
  },
  {
    step: "2",
    title: "입장 요청",
    body: "닉네임을 넣고 입장 요청을 올리면 방장이 수락한 뒤 함께 기록할 수 있습니다. 초대 링크가 있으면 바로 입장할 수도 있습니다.",
  },
  {
    step: "3",
    title: "함께 기록",
    body: "아지트에서 토픽·클립을 올리고, 홈 피드와 다이어리로 일상을 남깁니다.",
  },
] as const;

function agitHref(agitId: string, isLoggedIn: boolean) {
  const preview = ROUTES.agit.preview(agitId);
  if (isLoggedIn) {
    return preview;
  }
  return `${ROUTES.login}?callbackUrl=${encodeURIComponent(preview)}`;
}

function AgitRail({
  title,
  items,
  empty,
  isLoggedIn,
}: {
  title: string;
  items?: UiAgit[];
  empty: string;
  isLoggedIn: boolean;
}) {
  const rooms = items ?? [];
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <div className="flex items-end justify-between gap-3">
        <h2 className={ui.sectionTitle}>{title}</h2>
        <TextLink href={isLoggedIn ? ROUTES.agit.search : ROUTES.login} className={cn(ui.link, "text-xs")}>
          더보기
        </TextLink>
      </div>
      {rooms.length === 0 ? (
        <p className={ui.hint}>{empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {rooms.map((agit) => (
            <TextLink
              key={agit.id}
              href={agitHref(agit.id, isLoggedIn)}
              className="overflow-hidden rounded-[18px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] p-3 text-[inherit] no-underline"
            >
              <div
                className="mb-2 aspect-square w-full overflow-hidden rounded-[14px]"
                style={{ background: agit.coverGradient }}
                aria-hidden
              />
              <p className="m-0 line-clamp-1 text-[13px] font-semibold text-[var(--dl-color-text-primary)]">
                {agit.name}
              </p>
              <p className="m-[4px_0_0] line-clamp-2 text-[11px] text-[var(--dl-color-text-secondary)]">
                {agit.description || "함께 기록하는 아지트"}
              </p>
            </TextLink>
          ))}
        </div>
      )}
    </section>
  );
}

export function MainLandingSection({
  latest,
  recommended,
  isLoggedIn,
}: {
  latest: UiAgit[];
  recommended: UiAgit[];
  isLoggedIn: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col gap-8 px-5 pb-12 pt-6">
      <header className="flex items-center justify-between gap-3">
        {isLoggedIn ? (
          <TextLink
            href={ROUTES.intro}
            aria-label="홈"
            className="m-0 text-lg font-bold text-[var(--dl-color-text-primary)] !no-underline"
          >
            PLIP
          </TextLink>
        ) : (
          <p className="m-0 text-lg font-bold text-[var(--dl-color-text-primary)]">PLIP</p>
        )}
        {isLoggedIn ? (
          <TextLink href={ROUTES.home} className={cn(ui.link, "text-sm")}>
            피드로
          </TextLink>
        ) : (
          <div className="flex items-center gap-3">
            <TextLink href={ROUTES.login} className={cn(ui.link, "text-sm")}>
              로그인
            </TextLink>
            <TextLink href={ROUTES.signup} className={cn(ui.btn, ui.btnPrimary, "h-9 w-auto px-3 text-xs")}>
              시작하기
            </TextLink>
          </div>
        )}
      </header>

      <section aria-label="소개">
        <p className={ui.eyebrow}>함께 기록하는 루틴</p>
        <h1 className={`${ui.title} mt-2`}>
          목적에 맞는 아지트에서
          <br />
          일상을 남기세요
        </h1>
        <p className={`${ui.subtitle} mt-2`}>
          최신·추천 아지트를 둘러보고, 입장 요청으로 합류할 수 있습니다.
        </p>
      </section>

      <section className="flex flex-col gap-3" aria-label="이용 가이드">
        <h2 className={ui.sectionTitle}>이렇게 시작해요</h2>
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {GUIDE_STEPS.map((item) => (
            <li
              key={item.step}
              className="flex gap-3 rounded-[16px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] p-3.5"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--dl-color-bg-brand-subtle)] text-sm font-bold text-[var(--dl-color-text-brand)]">
                {item.step}
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--dl-color-text-primary)]">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--dl-color-text-secondary)]">
                  {item.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <AgitRail
        title="최신 아지트"
        items={latest}
        empty="아직 새로 열린 아지트가 없어요."
        isLoggedIn={isLoggedIn}
      />
      <AgitRail
        title="추천 아지트"
        items={recommended}
        empty="추천할 아지트가 아직 없어요. 검색·조회가 쌓이면 여기에 올라갑니다."
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
