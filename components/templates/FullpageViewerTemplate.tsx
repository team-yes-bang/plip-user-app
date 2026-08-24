"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type FullpageViewerTemplateProps = {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  isStandalone?: boolean;
};

export function FullpageViewerTemplate({
  children,
  isOpen = true,
  onClose,
  isStandalone = false,
}: FullpageViewerTemplateProps) {
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

  const content = (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col bg-[#09080f] text-white font-[family-name:var(--font-inter),sans-serif] ${
        isStandalone ? "relative h-full w-full" : ""
      }`}
    >
      {children}
    </div>
  );

  if (isStandalone || typeof window === "undefined") {
    return content;
  }

  return createPortal(content, document.body);
}
