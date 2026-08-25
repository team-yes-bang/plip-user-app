import { DailyIcon, IconButton, IconLink, ScreenSubtitle, ScreenTitle } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type ScreenHeaderTone = "default" | "glass" | "overlay" | "plain";

const TONE_CLASS: Record<ScreenHeaderTone, string> = {
  default: "shrink-0 px-6 pt-3",
  glass: "sticky top-0 z-20 border-b border-black/5 bg-white/70 px-6 py-3 backdrop-blur-xl",
  overlay: "relative z-10 px-6 py-3",
  plain: "",
};

const TITLE_TONE: Record<ScreenHeaderTone, string> = {
  default: "",
  glass: "text-[#161823] tracking-tight",
  overlay: "text-white",
  plain: "",
};

const SUBTITLE_TONE: Record<ScreenHeaderTone, string> = {
  default: "",
  glass: "",
  overlay: "text-white/78",
  plain: "",
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
    return (
      <IconButton variant="surface" label={label} onClick={onClick}>
        <DailyIcon name="chevronLeft" size={20} />
      </IconButton>
    );
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
  tone = "plain",
  className,
}: ScreenHeaderProps) {
  const resolvedLeading =
    leading ??
    (onBack ? (
      <HeaderBackButton onClick={onBack} label={backLabel} />
    ) : backHref ? (
      <HeaderBackLink href={backHref} label={backLabel} />
    ) : null);

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

  return (
    <header className={cn("flex items-center gap-3", TONE_CLASS[tone], className)}>
      {resolvedLeading}
      <div className={cn("min-w-0 flex-1", titleAlign === "center" ? "text-center" : null)}>
        {asTitle(title, tone)}
        {asSubtitle(subtitle, tone)}
      </div>
      {resolvedTrailing ? (
        <div className="flex shrink-0 items-center gap-2">{resolvedTrailing}</div>
      ) : null}
    </header>
  );
}
