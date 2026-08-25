"use client";

import { TextLink } from "@/components/atoms";
import { ROUTES } from "@/config/routes";
import { LayoutGroup, motion } from "framer-motion";
import { BookOpen, Camera, Clapperboard, Settings, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

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
    icon: <BookOpen className="size-6" strokeWidth={2} />,
  },
  {
    id: "agit",
    href: ROUTES.agit.root,
    label: "아지트",
    icon: <UsersRound className="size-6" strokeWidth={2} />,
  },
  {
    id: "create",
    href: ROUTES.capture.video,
    label: "카메라",
    icon: <Camera className="size-5 text-[#fff]" strokeWidth={2} />,
    create: true,
  },
  {
    id: "feed",
    href: ROUTES.home,
    label: "피드",
    icon: <Clapperboard className="size-6" strokeWidth={2} />,
  },
  {
    id: "mypage",
    href: ROUTES.mypage.root,
    label: "설정",
    icon: <Settings className="size-6" strokeWidth={2} />,
  },
];

export function BottomNavigation({
  active = "diary",
}: BottomNavigationProps) {
  const [hoveredId, setHoveredId] = useState<BottomNavTab | null>(null);

  return (
    <LayoutGroup id="app-bottom-nav">
      <nav
        aria-label="주 메뉴"
        className="absolute inset-x-0 bottom-0 z-30 flex h-[80px] shrink-0 items-center justify-between border-t border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] p-[6px_16px]"
        onMouseLeave={() => setHoveredId(null)}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const isHovered = hoveredId === item.id;

          if (item.create) {
            return (
              <TextLink
                key={item.id}
                href={item.href}
                aria-label={item.label}
                className="relative z-10 flex h-16 w-16 flex-col items-center justify-center gap-1 text-[var(--dl-color-text-tertiary)] !no-underline"
                onMouseEnter={() => setHoveredId(item.id)}
                onFocus={() => setHoveredId(item.id)}
              >
                <span className="grid size-10 place-items-center rounded-full bg-[var(--dl-color-bg-brand)]">
                  {item.icon}
                </span>
                <span className="text-[11px] font-medium leading-[14px] whitespace-nowrap">
                  {item.label}
                </span>
              </TextLink>
            );
          }

          return (
            <TextLink
              key={item.id}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex h-16 w-16 flex-col items-center justify-center gap-1 !no-underline transition-colors ${isActive
                ? "font-bold text-[var(--dl-color-text-brand)]"
                : "text-[var(--dl-color-text-tertiary)] hover:text-[var(--dl-color-text-primary)]"
                }`}
              onMouseEnter={() => setHoveredId(item.id)}
              onFocus={() => setHoveredId(item.id)}
            >
              {/* 1. Active Indicator (외곽에 은은한 그라데이션이 들어간 둥근 사각형 슬라이딩) */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  className="absolute -inset-x-1 inset-y-0 z-0 rounded-2xl bg-gradient-to-b from-[var(--dl-color-bg-brand-subtle)]/90 via-[var(--dl-color-bg-brand-subtle)] to-[var(--dl-color-bg-brand-subtle)]/60 border border-[var(--dl-color-border-brand)]/10 shadow-[0_2px_12px_rgba(79,70,229,0.12)] transition-colors duration-300"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                  }}
                />
              )}

              {/* 2. Hover Indicator (호버 시 은은한 소프트 그라데이션 및 칼라 트랜지션) */}
              {isHovered && !isActive && (
                <motion.div
                  layoutId="bottom-nav-hover-pill"
                  className="absolute -inset-x-1 inset-y-0 z-0 rounded-2xl bg-gradient-to-b from-gray-100/90 to-gray-50/50 dark:from-white/10 dark:to-white/5 transition-colors duration-300"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                  }}
                />
              )}

              {/* 아이콘 및 라벨 (z-10) */}
              <span className="relative z-10 flex flex-col items-center justify-center gap-1 transition-colors duration-300">
                {item.icon}
                <span className="text-[11px] font-medium leading-[14px] whitespace-nowrap transition-colors duration-300">
                  {item.label}
                </span>
              </span>
            </TextLink>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
