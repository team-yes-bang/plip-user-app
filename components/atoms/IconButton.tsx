import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { TextLink } from "./TextLink";

export type IconButtonVariant = "surface" | "outline" | "ghost" | "overlay" | "brand";
export type IconButtonSize = "pill" | "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  surface: "border-0 bg-[var(--dl-color-bg-surface)] text-[var(--dl-color-text-primary)] hover:bg-[var(--dl-color-bg-brand-subtle)] hover:text-[var(--dl-color-text-brand)]",
  outline: "border border-[var(--dl-color-border-default)] bg-transparent text-[var(--dl-color-text-primary)] hover:bg-[var(--dl-color-bg-surface)] hover:border-[var(--dl-color-border-brand)]",
  ghost: "border-0 bg-transparent text-[var(--dl-color-text-primary)] hover:bg-[var(--dl-color-bg-surface)]",
  overlay: "border-0 bg-black/20 text-white shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-md hover:bg-black/35 active:bg-black/50",
  brand: "border-0 bg-[var(--dl-color-bg-brand)] text-white shadow-xs",
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  pill: "size-7 rounded-full text-xs",                       // 컴팩트 알약 규격 (28px)
  sm: "size-8 rounded-[var(--dl-radius-md)] text-xs",        // 32px
  md: "size-9 rounded-[var(--dl-radius-md)] text-sm",        // 36px
  lg: "size-11 rounded-[var(--dl-radius-md)] text-base",     // 44px (표준 터치 가이드라인 규격)
};

const BASE_ICON_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center justify-center no-underline transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 select-none";

export type IconButtonProps = ComponentProps<"button"> & {
  label: string;
  children?: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

export function IconButton({
  label,
  children,
  className = "",
  type = "button",
  variant = "surface",
  size = "lg",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(BASE_ICON_CLASS, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...props}
    >
      {children ?? (
        <span aria-hidden className="text-xs">
          ···
        </span>
      )}
    </button>
  );
}

export type IconLinkProps = ComponentProps<typeof TextLink> & {
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

export function IconLink({
  label,
  className,
  children,
  variant = "surface",
  size = "lg",
  ...props
}: IconLinkProps) {
  return (
    <TextLink
      aria-label={label}
      className={cn(BASE_ICON_CLASS, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...props}
    >
      {children}
    </TextLink>
  );
}
