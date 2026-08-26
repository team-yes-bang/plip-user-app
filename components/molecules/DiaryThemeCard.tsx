"use client";

import { TextLink } from "@/components/atoms";
import { ROUTES } from "@/config/routes";
import type { UiDiaryTheme } from "@/types/diary/ui";
import { Pencil, Plus } from "lucide-react";
import Image from "next/image";

type DiaryThemeCardProps = {
  theme: UiDiaryTheme;
  index: number;
  onEdit: (theme: UiDiaryTheme) => void;
};

const THEME_GRADIENTS = [
  "linear-gradient(145deg, #4f46e5, #7c3aed)",
  "linear-gradient(145deg, #0ea5e9, #2563eb)",
  "linear-gradient(145deg, #f43f5e, #e11d48)",
  "linear-gradient(145deg, #10b981, #059669)",
  "linear-gradient(145deg, #8b5cf6, #d946ef)",
];

export function DiaryThemeCard({ theme, index, onEdit }: DiaryThemeCardProps) {
  const gradient = THEME_GRADIENTS[index % THEME_GRADIENTS.length];

  return (
    <article className="overflow-hidden rounded-[18px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] shadow-[0_8px_24px_rgba(23,_23,_28,_0.04)]">
      <div className="relative">
        <TextLink
          href={ROUTES.diary.themes.detail(theme.id)}
          className="flex min-w-0 flex-col text-[inherit] !no-underline"
        >
          <div
            className="relative aspect-square w-full overflow-hidden"
            style={{ background: gradient }}
          >
            {theme.thumbnailSrc ? (
              <Image
                src={theme.thumbnailSrc}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                className="scale-105 object-cover object-center blur-[1.5px]"
              />
            ) : null}
          </div>
          <p className="m-0 overflow-hidden px-[12px] py-[10px] text-[13px] font-semibold leading-[1.25] text-[var(--dl-color-text-primary)] text-ellipsis whitespace-nowrap">
            {theme.name}
          </p>
        </TextLink>

        <button
          type="button"
          className="absolute top-[8px] right-[8px] z-[2] grid size-[34px] cursor-pointer place-items-center rounded-[10px] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)]/90 text-[var(--dl-color-text-secondary)] shadow-xs backdrop-blur-md transition-colors hover:bg-[var(--dl-color-bg-brand-subtle)] hover:text-[var(--dl-color-text-brand)]"
          aria-label={`${theme.name} 테마 편집`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(theme);
          }}
        >
          <Pencil className="size-4" />
        </button>
      </div>
    </article>
  );
}

type DiaryThemeAddCardProps = {
  onClick: () => void;
};

export function DiaryThemeAddCard({ onClick }: DiaryThemeAddCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-[1/1.22] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-[var(--dl-color-border-brand)] bg-[linear-gradient(135deg,rgba(247,244,255,0.85),rgba(255,255,255,0.95))] p-4 shadow-[0_8px_24px_rgba(23,_23,_28,_0.03)] transition-all hover:bg-[var(--dl-color-bg-brand-subtle)] hover:shadow-xs"
      aria-label="새 테마 추가"
    >
      <div className="grid size-10 place-items-center rounded-xl bg-[var(--dl-color-bg-brand)] text-white shadow-sm">
        <Plus className="size-5 stroke-[2.5]" />
      </div>
      <span className="text-xs font-bold text-[var(--dl-color-text-brand)]">테마 추가</span>
    </button>
  );
}
