"use client";

import { TextLink } from "@/components/atoms";
import { ROUTES } from "@/config/routes";
import type { UiDiaryTheme } from "@/types/diary/ui";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

type ThemePreviewStripProps = {
  themes: UiDiaryTheme[];
};

const THEME_GRADIENTS = [
  "linear-gradient(145deg, #4f46e5, #7c3aed)",
  "linear-gradient(145deg, #0ea5e9, #2563eb)",
  "linear-gradient(145deg, #f43f5e, #e11d48)",
  "linear-gradient(145deg, #10b981, #059669)",
  "linear-gradient(145deg, #8b5cf6, #d946ef)",
];

export function ThemePreviewStrip({ themes }: ThemePreviewStripProps) {
  if (themes.length === 0) {
    return (
      <section aria-label="테마 목록 미리보기" className="w-full shrink-0">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="m-0 text-sm font-bold text-[#1f1c29]">테마</h2>
          <TextLink
            href={ROUTES.diary.themes.root}
            className="flex items-center gap-0.5 text-xs font-semibold text-[var(--dl-color-text-brand)] !no-underline hover:underline"
          >
            전체보기
            <ChevronRight className="size-3.5" />
          </TextLink>
        </div>
        <div className="flex w-full items-center justify-center rounded-[16px] border border-dashed border-[#e3e0ed] bg-[#fbfaff] p-4 text-center">
          <p className="m-0 text-xs font-medium text-[var(--dl-color-text-secondary)]">
            등록된 테마가 없습니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="테마 목록 캐러셀" className="w-full shrink-0">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="m-0 text-sm font-bold text-[#1f1c29]">테마</h2>
        <TextLink
          href={ROUTES.diary.themes.root}
          className="flex items-center gap-0.5 text-xs font-semibold text-[var(--dl-color-text-brand)] !no-underline hover:underline"
        >
          전체보기
          <ChevronRight className="size-3.5" />
        </TextLink>
      </div>

      <div className="flex w-full gap-2.5 overflow-x-auto pb-1 pt-0.5 snap-x touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none]">
        {themes.map((theme, index) => {
          const gradient = THEME_GRADIENTS[index % THEME_GRADIENTS.length];

          return (
            <TextLink
              key={theme.id}
              href={ROUTES.diary.themes.detail(theme.id)}
              className="group relative flex w-[104px] shrink-0 snap-start flex-col overflow-hidden rounded-[16px] border border-[#e3e0ed] bg-[var(--dl-color-bg-elevated)] shadow-xs transition-all hover:border-[var(--dl-color-border-brand)] hover:shadow-md !no-underline"
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
                    sizes="104px"
                    className="scale-105 object-cover object-center blur-[1.5px] transition-transform group-hover:scale-110"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 truncate text-center text-[11px] font-bold text-white drop-shadow-xs">
                  {theme.name}
                </span>
              </div>
            </TextLink>
          );
        })}
      </div>
    </section>
  );
}
