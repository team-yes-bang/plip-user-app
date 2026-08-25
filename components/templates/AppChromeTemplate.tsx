import { ui } from "@/components/atoms/styles";
import { BottomNavigation, type BottomNavTab } from "@/components/molecules/BottomNavigation";
import type { ReactNode } from "react";

type AppChromeTemplateProps = {
  children: ReactNode;
  activeTab?: BottomNavTab;
  header?: ReactNode;
  showNav?: boolean;
  variant?: "feed" | "light" | "diary";
  className?: string;
  mainOverflow?: "auto" | "hidden";
  /** 아지트 기준 표준 여백 래퍼 적용 ('default': px-5 pb-6 pt-3, 'auth': px-5 pb-10 pt-6, 'none': 패딩 없음) */
  padded?: boolean | "default" | "auth" | "none";
  contentClassName?: string;
};

const PADDING_STYLES = {
  default: "p-[12px_24px_24px]",
  auth: "mx-auto flex w-full max-w-[390px] flex-col gap-4 px-6 pb-10 pt-6",
  none: "",
};

export function AppChromeTemplate({
  children,
  activeTab = "diary",
  header,
  showNav = true,
  variant = "feed",
  className = "",
  mainOverflow = "auto",
  padded = "none",
  contentClassName = "",
}: AppChromeTemplateProps) {
  const shellClass =
    variant === "light" || variant === "diary"
      ? "relative mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--dl-color-bg-elevated)] font-[family-name:var(--font-inter),var(--font-sans),system-ui,sans-serif] text-[var(--dl-color-text-primary)]"
      : "relative mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--plip-tt-bg)] text-[var(--plip-tt-text)]";

  const paddingClass =
    padded === true || padded === "default"
      ? PADDING_STYLES.default
      : padded === "auth"
        ? PADDING_STYLES.auth
        : PADDING_STYLES.none;

  return (
    <div className={`${shellClass} ${className}`.trim()}>
      <div className={`flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden ${showNav ? "pb-[80px]" : ""}`}>
        {header}
        <main
          className={`flex min-h-0 w-full flex-1 flex-col ${mainOverflow === "hidden" ? "overflow-hidden" : "overflow-y-auto"} ${paddingClass} ${contentClassName}`.trim()}
        >
          {children}
        </main>
      </div>
      {showNav ? <BottomNavigation active={activeTab} variant={variant} /> : null}
    </div>
  );
}

export function AgitFlowChrome({ children }: { children: ReactNode }) {
  return (
    <AppChromeTemplate activeTab="agit" variant="light" padded="auth">
      {children}
    </AppChromeTemplate>
  );
}
