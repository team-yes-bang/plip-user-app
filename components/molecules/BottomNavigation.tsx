import leftoverStyles from "@/components/styles/leftover.module.css";
import { TextLink } from "@/components/atoms";
import { ROUTES } from "@/config/routes";
import { BookOpen, Camera, Clapperboard, Settings, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Figma Global Navigation · 402×80
 * 다이어리 / 아지트 / 카메라 / 피드 / 설정
 */
export type BottomNavTab = "diary" | "agit" | "create" | "feed" | "mypage";

type BottomNavigationProps = {
  active?: BottomNavTab;
  variant?: "feed" | "light" | "diary";
};

type NavItem = {
  id: BottomNavTab;
  href: string;
  label: string;
  icon: ReactNode;
  create?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "diary",
    href: ROUTES.diary.root,
    label: "다이어리",
    icon: <BookOpen className="w-[24px] h-[24px]" strokeWidth={2} />,
  },
  {
    id: "agit",
    href: ROUTES.agit.root,
    label: "아지트",
    icon: <UsersRound className="w-[24px] h-[24px]" strokeWidth={2} />,
  },
  {
    id: "create",
    href: ROUTES.capture.video,
    label: "카메라",
    icon: <Camera className="w-[20px] h-[20px] text-[#fff]" strokeWidth={2} />,
    create: true,
  },
  {
    id: "feed",
    href: ROUTES.home,
    label: "피드",
    icon: <Clapperboard className="w-[24px] h-[24px]" strokeWidth={2} />,
  },
  {
    id: "mypage",
    href: ROUTES.mypage.root,
    label: "설정",
    icon: <Settings className="w-[24px] h-[24px]" strokeWidth={2} />,
  },
];

export function BottomNavigation({
  active = "diary",
}: BottomNavigationProps) {
  return (
    <nav aria-label="주 메뉴" className="absolute inset-x-0 bottom-0 z-30 flex h-[80px] shrink-0 items-center justify-between border-t border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] p-[6px_16px]">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;

        if (item.create) {
          return (
            <TextLink
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className="flex h-16 w-16 flex-col items-center justify-center gap-1 text-[var(--dl-color-text-tertiary)] no-underline"
            >
              <span className="grid w-[40px] h-[40px] place-items-center rounded-[999px] bg-[var(--dl-color-bg-brand)]">{item.icon}</span>
              <span className="text-[11px] font-medium leading-[14px] whitespace-nowrap">{item.label}</span>
            </TextLink>
          );
        }

        return (
          <TextLink
            key={item.id}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex h-16 w-16 flex-col items-center justify-center gap-1 text-[var(--dl-color-text-tertiary)] no-underline ${isActive ? leftoverStyles.isActive : ""}`}
          >
            {item.icon}
            <span className="text-[11px] font-medium leading-[14px] whitespace-nowrap">{item.label}</span>
          </TextLink>
        );
      })}
    </nav>
  );
}
