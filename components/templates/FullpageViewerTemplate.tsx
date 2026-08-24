"use client";

import { useOverlayPortalHost } from "@/components/molecules/AnimatedOverlays";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type FullpageViewerTemplateProps = {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  isStandalone?: boolean;
};

/**
 * 브라우저 전체 fixed가 아니라, 앱/데스크톱 프레임 안에서
 * 다른 UI(하단 탭 포함)를 덮는 오버레이.
 */
export function FullpageViewerTemplate({
  children,
  isOpen = true,
  onClose,
  isStandalone = false,
}: FullpageViewerTemplateProps) {
  const host = useOverlayPortalHost();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (isStandalone) {
    return (
      <div className="relative flex h-full w-full flex-col bg-[#09080f] text-white font-[family-name:var(--font-inter),sans-serif]">
        {children}
      </div>
    );
  }

  const content = (
    <div
      className="pointer-events-auto absolute inset-0 z-[50] flex flex-col bg-[#09080f] text-white font-[family-name:var(--font-inter),sans-serif]"
      role="dialog"
      aria-modal
      aria-label="영상 뷰어"
    >
      {children}
    </div>
  );

  if (host) {
    return createPortal(content, host);
  }

  return content;
}
