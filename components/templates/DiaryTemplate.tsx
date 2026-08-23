import { BottomNavigation } from "@/components/molecules";
import type { ReactNode } from "react";

type DiaryTemplateProps = {
  children: ReactNode;
  /** true면 main 스크롤 없이 자식이 높이·내부 스크롤을 관리 (날짜 상세 등) */
  fixedMain?: boolean;
};

export function DiaryTemplate({ children, fixedMain = false }: DiaryTemplateProps) {
  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden bg-[var(--dc-page-bg)] font-[family-name:var(--font-inter),var(--font-sans),system-ui,sans-serif] text-[var(--dc-fg-primary)]">
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden pb-[80px]">
        <main
          className={
            fixedMain
              ? "flex min-h-0 w-full flex-1 flex-col overflow-hidden"
              : "flex min-h-0 w-full flex-1 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none]"
          }
        >
          {children}
        </main>
      </div>
      <BottomNavigation active="diary" variant="light" />
    </div>
  );
}
