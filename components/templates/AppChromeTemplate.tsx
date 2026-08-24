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
};

export function AppChromeTemplate({
  children,
  activeTab = "diary",
  header,
  showNav = true,
  variant = "feed",
  className = "",
  mainOverflow = "auto",
}: AppChromeTemplateProps) {
  const shellClass =
    variant === "light" || variant === "diary"
      ? "relative mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--dl-color-bg-elevated)] font-[family-name:var(--font-inter),var(--font-sans),system-ui,sans-serif] text-[var(--dl-color-text-primary)]"
      : "relative mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--plip-tt-bg)] text-[var(--plip-tt-text)]";

  return (
    <div className={`${shellClass} ${className}`.trim()}>
      <div className={`flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden ${showNav ? "pb-[80px]" : ""}`}>
        {header}
        <main
          className={`flex min-h-0 w-full flex-1 flex-col ${mainOverflow === "hidden" ? "overflow-hidden" : "overflow-y-auto"}`}
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
    <AppChromeTemplate activeTab="agit" variant="light">
      <div className={`${ui.authContent} min-h-0 flex-1 overflow-y-auto`}>{children}</div>
    </AppChromeTemplate>
  );
}
