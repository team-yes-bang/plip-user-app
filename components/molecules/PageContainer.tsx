import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  gap?: "default" | "tight" | "none";
  "aria-label"?: string;
};

/**
 * 아지트/다이어리 등 표준 앱 화면의 단일 진실 공급원(Single Source of Truth) 레이아웃 컨테이너
 * - 기본 표준 여백: p-[12px_24px_24px] (좌우 24px, 상단 12px, 하단 24px)
 * - 기본 요소 간격: gap-[14px]
 */
export function PageContainer({
  children,
  as: Component = "section",
  className,
  gap = "default",
  "aria-label": ariaLabel,
}: PageContainerProps) {
  return (
    <Component
      aria-label={ariaLabel}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto p-[12px_24px_24px]",
        gap === "default" && "gap-[14px]",
        gap === "tight" && "gap-[8px]",
        className
      )}
    >
      {children}
    </Component>
  );
}
