import { cn } from "@/lib/utils";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";

export const feedOverlayGlassClass =
  "border-0 bg-black/40 text-white shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-md";

export const feedPillIconButtonClass = cn(
  "pointer-events-auto flex size-7 items-center justify-center rounded-full bg-transparent text-white shadow-none backdrop-blur-none transition-colors no-underline",
  "hover:bg-black/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.16)] hover:backdrop-blur-md",
  "focus-visible:bg-black/40 focus-visible:shadow-[0_4px_16px_rgba(0,0,0,0.16)] focus-visible:backdrop-blur-md",
  "active:bg-black/40 active:shadow-[0_4px_16px_rgba(0,0,0,0.16)] active:backdrop-blur-md"
);

type FeedPillProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
};

export function FeedPill({ children, className = "", ...props }: FeedPillProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold leading-4",
        feedOverlayGlassClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

type FeedPillIconButtonProps = ComponentProps<"button"> & {
  label: string;
  children: ReactNode;
};

export function FeedPillIconButton({ label, children, className = "", ...props }: FeedPillIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(feedPillIconButtonClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}
