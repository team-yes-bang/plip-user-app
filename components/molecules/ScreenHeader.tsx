import { DailyIcon, IconButton, IconLink, NavHomeIcon, ScreenSubtitle, ScreenTitle } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type ScreenHeaderTone = "default" | "glass" | "overlay" | "plain" | "sticky";

const TONE_CLASS: Record<ScreenHeaderTone, string> = {
  default: "shrink-0 px-6 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-3 bg-[var(--dl-color-bg-elevated)]",
  glass: "sticky top-0 z-20 border-b border-black/5 bg-white/70 px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 backdrop-blur-xl",
  overlay: "relative z-10 px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3",
  plain: "",
  sticky: "sticky top-0 z-20 shrink-0 px-6 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-1 bg-[var(--dl-color-bg-elevated)]",
};

const TITLE_TONE: Record<ScreenHeaderTone, string> = {
  default: "",
  glass: "text-[#161823] tracking-tight",
  overlay: "text-white",
  plain: "",
  sticky: "",
};

const SUBTITLE_TONE: Record<ScreenHeaderTone, string> = {
  default: "",
  glass: "",
  overlay: "text-white/78",
  plain: "",
  sticky: "",
};

type ScreenHeaderProps = {
  /** 뒤로가기 이동 경로 (제공 시 HeaderBackLink 자동 렌더링) */
  backHref?: string;
  /** 뒤로가기 클릭 콜백 (제공 시 HeaderBackButton 자동 렌더링) */
  onBack?: () => void;
  backLabel?: string;

  /** 메뉴 버튼 클릭 콜백 (제공 시 HeaderMenuButton 자동 렌더링) */
  onMenuOpen?: () => void;
  menuLabel?: string;

  /** 커스텀 leading 요소 (backHref/onBack보다 우선 적용) */
  leading?: ReactNode;
  /** 커스텀 trailing 요소 */
  trailing?: ReactNode;

  title?: ReactNode;
  subtitle?: ReactNode;
  titleAlign?: "start" | "center";
  tone?: ScreenHeaderTone;
  className?: string;
};

function asTitle(title: ReactNode, tone: ScreenHeaderTone): ReactNode {
  if (typeof title === "string") {
    return <ScreenTitle className={TITLE_TONE[tone]}>{title}</ScreenTitle>;
  }
  return title;
}

function asSubtitle(subtitle: ReactNode, tone: ScreenHeaderTone): ReactNode {
  if (typeof subtitle === "string") {
    return <ScreenSubtitle className={SUBTITLE_TONE[tone]}>{subtitle}</ScreenSubtitle>;
  }
  return subtitle;
}

export function HeaderBackLink({ href, label = "뒤로", onClick }: { href?: string; label?: string; onClick?: () => void }) {
  if (onClick) {
    return <HeaderBackButton onClick={onClick} label={label} />;
  }
  return (
    <IconLink href={href || "#"} label={label}>
      <DailyIcon name="chevronLeft" size={20} />
    </IconLink>
  );
}

export function HeaderBackButton({ onClick, label = "뒤로" }: { onClick: () => void; label?: string }) {
  return (
    <IconButton variant="surface" label={label} onClick={onClick}>
      <DailyIcon name="chevronLeft" size={20} />
    </IconButton>
  );
}

export function HeaderMenuButton({
  onClick,
  label = "메뉴",
  expanded,
}: {
  onClick: () => void;
  label?: string;
  expanded?: boolean;
}) {
  return (
    <IconButton variant="surface" label={label} aria-expanded={expanded} onClick={onClick}>
      <DailyIcon name="ellipsis" size={20} />
    </IconButton>
  );
}

export function HeaderSearchLink({ href, label = "검색", onClick }: { href?: string; label?: string; onClick?: () => void }) {
  if (onClick) {
    return <HeaderSearchButton onClick={onClick} label={label} />;
  }
  return (
    <IconLink href={href || "#"} label={label}>
      <DailyIcon name="search" size={20} />
    </IconLink>
  );
}

export function HeaderSearchButton({ onClick, label = "검색" }: { onClick: () => void; label?: string }) {
  return (
    <IconButton variant="surface" label={label} onClick={onClick}>
      <DailyIcon name="search" size={20} />
    </IconButton>
  );
}

export function HeaderHomeLink({
  href = ROUTES.home,
  label = "홈",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <IconLink href={href} label={label}>
      <NavHomeIcon className="size-5" />
    </IconLink>
  );
}

export function HeaderStep({ children }: { children: ReactNode }) {
  return <span className={ui.topbarStep}>{children}</span>;
}

type AuthTopBarProps = {
  title: string;
  backHref?: string;
  onBack?: () => void;
  step?: string;
  trailing?: ReactNode;
};

/** @deprecated ScreenHeader 슬롯을 쓰세요. 기존 인증·플로우 화면 호환용. */
export function AuthTopBar({ title, backHref, onBack, step, trailing }: AuthTopBarProps) {
  return (
    <ScreenHeader
      tone="plain"
      backHref={backHref}
      onBack={onBack}
      title={title || undefined}
      trailing={trailing ?? (step ? <HeaderStep>{step}</HeaderStep> : undefined)}
    />
  );
}

/**
 * 아지트/다이어리 표준 헤더 단일 진실 공급원 (Single Source of Truth) 컴포넌트
 */
export function ScreenHeader({
  backHref,
  onBack,
  backLabel,
  onMenuOpen,
  menuLabel,
  leading,
  trailing,
  title,
  subtitle,
  titleAlign = "start",
  tone = "sticky",
  className,
}: ScreenHeaderProps) {
  const resolvedLeading =
    leading ??
    (onBack ? (
      <HeaderBackButton onClick={onBack} label={backLabel} />
    ) : backHref ? (
      <HeaderBackLink href={backHref} label={backLabel} />
    ) : (
      <HeaderHomeLink />
    ));

  const menuButton = onMenuOpen ? (
    <HeaderMenuButton label={menuLabel} onClick={onMenuOpen} />
  ) : null;

  const resolvedTrailing =
    trailing || menuButton ? (
      <>
        {trailing}
        {menuButton}
      </>
    ) : resolvedLeading ? (
      <span className="size-11 shrink-0" aria-hidden />
    ) : null;

  const isSticky = tone === "sticky";

  return (
    <header className={cn("relative flex items-center gap-3", TONE_CLASS[tone], className)}>
      {resolvedLeading}
      <div className={cn("min-w-0 flex-1 ", titleAlign === "center" ? "text-center" : null)}>
        {asTitle(title, tone)}
        {asSubtitle(subtitle, tone)}
      </div>
      {resolvedTrailing ? (
        <div className="flex shrink-0 items-center gap-2">{resolvedTrailing}</div>
      ) : null}

      {/* 헤더 하단으로 부드럽게 빠지는 리얼 알파 그라데이션 페이드 오버레이 */}
      {/* {isSticky && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-full h-5 bg-gradient-to-b from-[var(--dl-color-bg-elevated)] to-transparent"
        />
      )} */}
    </header>
  );
}
