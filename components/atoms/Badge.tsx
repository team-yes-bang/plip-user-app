import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "brand" | "neutral" | "success" | "danger" | "outline";
type BadgeSize = "sm" | "md";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
};

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  brand: "bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)] border-transparent",
  neutral: "bg-[var(--dl-color-bg-surface)] text-[var(--dl-color-text-secondary)] border-transparent",
  success: "bg-[var(--dl-color-bg-success)] text-[var(--dl-color-text-success)] border-transparent",
  danger: "bg-[var(--dl-color-bg-danger)] text-[var(--dl-color-text-danger)] border-transparent",
  outline: "bg-transparent text-[var(--dl-color-text-secondary)] border-[var(--dl-color-border-default)]",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "h-6 min-h-[24px] px-2.5 text-xs rounded-full",
  md: "h-7 min-h-[28px] px-3 text-xs rounded-full",
};

export function Badge({
  children,
  variant = "brand",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-semibold leading-none border select-none transition-colors",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
