import { DailyIcon, IconButton, IconLink, ScreenSubtitle, ScreenTitle } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type ScreenHeaderTone = "default" | "glass" | "overlay" | "plain";

const TONE_CLASS: Record<ScreenHeaderTone, string> = {
  default: "shrink-0 px-[23px] pt-3",
  glass: "sticky top-0 z-20 border-b border-white/70 bg-white/50 px-4 py-3.5 backdrop-blur-xl",
  overlay: "relative z-10 px-4 py-3",
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
  leading?: ReactNode;
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
  label,
  expanded,
}: {
  onClick: () => void;
  label: string;
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
  const leading = onBack ? (
    <HeaderBackButton onClick={onBack} />
  ) : backHref ? (
    <HeaderBackLink href={backHref} />
  ) : undefined;

  return (
    <ScreenHeader
      tone="plain"
      leading={leading}
      title={title || undefined}
      trailing={trailing ?? (step ? <HeaderStep>{step}</HeaderStep> : undefined)}
    />
  );
}

export function ScreenHeader({
  leading,
  trailing,
  title,
  subtitle,
  titleAlign = "start",
  tone = "default",
  className,
}: ScreenHeaderProps) {
  const end = trailing ?? (leading ? <span className="size-11 shrink-0" aria-hidden /> : null);

  return (
    <header className={cn("flex items-center gap-3", TONE_CLASS[tone], className)}>
      {leading}
      <div className={cn("min-w-0 flex-1", titleAlign === "center" ? "text-center" : null)}>
        {asTitle(title, tone)}
        {asSubtitle(subtitle, tone)}
      </div>
      {end ? <div className="flex shrink-0 items-center gap-2">{end}</div> : null}
    </header>
  );
}
