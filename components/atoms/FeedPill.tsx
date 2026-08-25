import { cn } from "@/lib/utils";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";

export const feedOverlayGlassClass =
  "border-0 bg-black/40 text-white shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-md";

export const feedPillIconButtonClass = cn(
  "pointer-events-auto flex size-7 items-center justify-center rounded-full text-white cursor-pointer transition-colors no-underline",
  feedOverlayGlassClass,
  "hover:bg-black/60 focus-visible:bg-black/60 active:bg-black/70"
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
