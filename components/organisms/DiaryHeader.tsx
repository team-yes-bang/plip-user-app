"use client";

import { HeaderMenuButton, ScreenHeader } from "@/components/molecules";
import type { ReactNode } from "react";

type DiaryHeaderProps = {
  onMenuOpen: () => void;
  trailing?: ReactNode;
  title?: string;
};

export function DiaryHeader({
  onMenuOpen,
  trailing,
  title = "다이어리",
}: DiaryHeaderProps) {
  return (
    <ScreenHeader
      tone="default"
      title={title}
      trailing={
        <>
          {trailing}
          <HeaderMenuButton label="다이어리 메뉴" onClick={onMenuOpen} />
        </>
      }
    />
  );
}
