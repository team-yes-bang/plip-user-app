import { TextLink } from "@/components/atoms";
import { ROUTES } from "@/config/routes";

export type ExploreNavTab = "home" | "explore" | "rooms" | "profile";

type ExploreNavProps = {
  active?: ExploreNavTab;
};

const TABS: { id: ExploreNavTab; label: string; href: string }[] = [
  { id: "home", label: "홈", href: ROUTES.intro },
  { id: "explore", label: "탐색", href: ROUTES.agit.root },
  { id: "rooms", label: "내 방", href: ROUTES.agit.detail("agit-walk") },
  { id: "profile", label: "프로필", href: ROUTES.mypage.root },
];

export function ExploreNav({ active = "explore" }: ExploreNavProps) {
  return (
    <nav className="flex w-full items-center justify-between border border-[var(--dl-color-border-default)] rounded-[20px] bg-[var(--dl-color-bg-elevated)] p-[10px_22px]" aria-label="앱 메뉴">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <TextLink
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center gap-[3px] !no-underline no-underline ${isActive ? "dl-explore-nav__item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="w-[18px] h-[18px] overflow-hidden">
              <img
                src={isActive ? "/plip/daily-loop/nav-dot-active.svg" : "/plip/daily-loop/nav-dot.svg"}
                alt=""
                width={18}
                height={18}
              />
            </span>
            <p className="m-0 text-[11px] font-medium leading-[16px] text-[var(--dl-color-text-secondary)] text-[var(--dl-color-text-brand)]">{tab.label}</p>
          </TextLink>
        );
      })}
    </nav>
  );
}
