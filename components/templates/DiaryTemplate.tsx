"use client";

import { AppChromeTemplate } from "@/components/templates/AppChromeTemplate";
import { FullpageVideoViewer } from "@/components/organisms/FullpageVideoViewer";
import { FullpageViewerTemplate } from "@/components/templates/FullpageViewerTemplate";
import { useVideoViewer } from "@/components/providers/VideoViewerProvider";
import type { ReactNode } from "react";

type DiaryTemplateProps = {
  children: ReactNode;
  /** true면 main 스크롤 없이 자식이 높이·내부 스크롤을 관리 (날짜 상세 등) */
  fixedMain?: boolean;
  header?: ReactNode;
  showNav?: boolean;
  /** 아지트 기준 표준 여백 래퍼 적용 */
  padded?: boolean | "default" | "auth" | "none";
  contentClassName?: string;
};

export function DiaryTemplate({
  children,
  fixedMain = false,
  header,
  showNav = true,
  padded = "none",
  contentClassName = "",
}: DiaryTemplateProps) {
  const { isOpen, activeClipId, videoList, closeViewer } = useVideoViewer();

  return (
    <>
      <AppChromeTemplate
        activeTab="diary"
        variant="light"
        header={header}
        showNav={showNav}
        mainOverflow={fixedMain ? "hidden" : "auto"}
        padded={padded}
        contentClassName={contentClassName}
      >
        {children}
      </AppChromeTemplate>

      {isOpen && activeClipId && (
        <FullpageViewerTemplate isOpen={isOpen} onClose={closeViewer}>
          <FullpageVideoViewer
            initialClipId={activeClipId}
            videoList={videoList}
            onClose={closeViewer}
          />
        </FullpageViewerTemplate>
      )}
    </>
  );
}
