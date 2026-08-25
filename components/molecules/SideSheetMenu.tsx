"use client";

import { DailyIcon, IconButton, TextLink } from "@/components/atoms";
import type { ReactNode } from "react";

type SideSheetHeaderProps = {
  title: ReactNode;
  onClose: () => void;
};

export function SideSheetHeader({ title, onClose }: SideSheetHeaderProps) {
  return (
    <div className="flex min-h-[48px] shrink-0 items-center justify-between">
      <h2 className="m-0 text-[22px] font-bold text-[#1f1c29]">{title}</h2>
      <IconButton variant="surface" label="닫기" onClick={onClose}>
        <DailyIcon name="x" size={20} />
      </IconButton>
    </div>
  );
}

type MenuNavRowProps = {
  href: string;
  onClick?: () => void;
  children: ReactNode;
};

export function MenuNavRow({ href, onClick, children }: MenuNavRowProps) {
  return (
    <TextLink
      href={href}
      className="flex min-h-[52px] items-center gap-[14px] rounded-[14px] border border-[#e3e0ed] bg-[#fff] p-[12px_14px] text-sm font-semibold !text-[#262433] !no-underline transition-all hover:border-[var(--dl-color-text-brand)] hover:bg-[var(--dl-color-bg-brand-subtle)] hover:text-[var(--dl-color-text-brand)] hover:shadow-xs cursor-pointer"
      onClick={onClick}
    >
      {children}
    </TextLink>
  );
}
