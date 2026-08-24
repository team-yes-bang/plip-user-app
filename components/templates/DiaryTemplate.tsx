"use client";

import { FullpageVideoViewer } from "@/components/organisms/FullpageVideoViewer";
import { FullpageViewerTemplate } from "@/components/templates/FullpageViewerTemplate";
import { useVideoViewer } from "@/components/providers/VideoViewerProvider";
import { BottomNavigation } from "@/components/molecules";
import type { ReactNode } from "react";

type DiaryTemplateProps = {
  children: ReactNode;
  /** true면 main 스크롤 없이 자식이 높이·내부 스크롤을 관리 (날짜 상세 등) */
  fixedMain?: boolean;
};

export function DiaryTemplate({ children, fixedMain = false }: DiaryTemplateProps) {
  const { isOpen, activeClipId, videoList, closeViewer } = useVideoViewer();

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

      {isOpen && activeClipId && (
        <FullpageViewerTemplate isOpen={isOpen} onClose={closeViewer}>
          <FullpageVideoViewer
            initialClipId={activeClipId}
            videoList={videoList}
            onClose={closeViewer}
          />
        </FullpageViewerTemplate>
      )}
    </div>
  );
}
