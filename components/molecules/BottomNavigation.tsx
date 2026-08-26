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
  const captureHref =
    active === "diary"
      ? ROUTES.capture.videoWith({ destination: "diary" })
      : ROUTES.capture.video;

  return (
    <LayoutGroup id="app-bottom-nav">
      <div className="absolute inset-x-0 bottom-0 z-30 h-[calc(80px+env(safe-area-inset-bottom,0px))] w-full pointer-events-none overflow-visible">
        <nav
          aria-label="주 메뉴"
          className="pointer-events-auto relative flex h-full w-full items-center justify-between border-t border-black/5 dark:border-white/10 bg-[var(--dl-color-bg-elevated)] px-4 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] overflow-visible"
          onMouseLeave={() => setHoveredId(null)}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            const isHovered = hoveredId === item.id;

            if (item.create) {
              return (
                <div
                  key={item.id}
                  className="relative z-20 flex h-16 w-16 items-center justify-center overflow-visible"
                  onMouseEnter={() => setHoveredId(item.id)}
                  onFocus={() => setHoveredId(item.id)}
                >
                  {/* 1. Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-active-pill"
                      className="absolute -inset-x-1 inset-y-0 z-0 rounded-2xl bg-gradient-to-b from-[var(--dl-color-bg-brand-subtle)]/90 via-[var(--dl-color-bg-brand-subtle)] to-[var(--dl-color-bg-brand-subtle)]/60 border border-[var(--dl-color-border-brand)]/10 shadow-[0_2px_12px_rgba(79,70,229,0.12)] transition-colors duration-300 pointer-events-none"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 28,
                      }}
                    />
                  )}

                  {/* 2. Hover Indicator */}
                  {isHovered && !isActive && (
                    <motion.div
                      layoutId="bottom-nav-hover-pill"
                      className="absolute -inset-x-1 inset-y-0 z-0 rounded-2xl bg-gradient-to-b from-gray-100/90 to-gray-50/50 dark:from-white/10 dark:to-white/5 transition-colors duration-300 pointer-events-none"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 28,
                      }}
                    />
                  )}

                  <TextLink
                    href={captureHref}
                    aria-label={item.label}
                    className="relative z-10 flex items-center justify-center !no-underline overflow-visible group"
                  >
                    {/* 상단은 솟아오르고(-40px), 좌우 섀도우도 뚫려있으며(-30px), 하단만 독 바운더리(0px)에 맞춘 3D 카메라 버튼 */}
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid size-[84px] place-items-center rounded-full bg-[linear-gradient(145deg,var(--dl-color-bg-brand),#3b82f6)] ring-4 ring-white/20 shadow-[0_-6px_20px_rgba(79,70,229,0.4)] [clip-path:inset(-40px_-30px_0px_-30px)] transition-all duration-200 group-hover:scale-105 group-hover:ring-white/40 group-hover:shadow-[0_-8px_25px_rgba(79,70,229,0.6)] group-active:scale-95">
                      <Camera className="size-9 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-200 group-hover:scale-110" strokeWidth={2.2} />
                    </span>
                  </TextLink>
                </div>
              );
            }

          return (
            <TextLink
              key={item.id}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`relative z-10 flex h-16 w-16 flex-col items-center justify-center gap-1 !no-underline transition-colors ${isActive
                ? "font-bold text-[var(--dl-color-text-brand)]"
                : "text-[var(--dl-color-text-tertiary)] hover:text-[var(--dl-color-text-primary)]"
                }`}
              onMouseEnter={() => setHoveredId(item.id)}
              onFocus={() => setHoveredId(item.id)}
            >
              {/* 1. Active Indicator */}
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

              {/* 2. Hover Indicator */}
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

              {/* 아이콘 및 라벨 */}
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
    </div>
    </LayoutGroup>
  );
}
