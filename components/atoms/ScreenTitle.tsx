import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ScreenTitleProps = {
  children: ReactNode;
  className?: string;
};

export function ScreenTitle({ children, className }: ScreenTitleProps) {
  return (
    <h1 className={cn("m-0 text-[22px] font-bold leading-[27px] font-[family-name:var(--font-title)] text-[var(--dl-color-text-primary)]", className)}>
      {children}
    </h1>
  );
}

export function ScreenSubtitle({ children, className }: ScreenTitleProps) {
  return (
    <p className={cn("m-[4px_0_0] text-xs leading-4 text-[var(--dl-color-text-secondary)]", className)}>{children}</p>
  );
}
