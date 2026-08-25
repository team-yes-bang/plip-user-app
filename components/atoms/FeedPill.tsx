import { cn } from "@/lib/utils";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";

import { IconButton, type IconButtonProps } from "./IconButton";

export const feedOverlayGlassClass =
  "border-0 bg-black/40 text-white shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-md";

export const feedPillIconButtonClass =
  "pointer-events-auto flex size-7 items-center justify-center rounded-full text-white cursor-pointer transition-colors no-underline border-0 bg-black/40 shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-md hover:bg-black/60 active:bg-black/70";

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

export type FeedPillIconButtonProps = IconButtonProps;

export function FeedPillIconButton({ label, children, className = "", ...props }: FeedPillIconButtonProps) {
  return (
    <IconButton
      variant="overlay"
      size="lg"
      label={label}
      className={cn("pointer-events-auto", className)}
      {...props}
    >
      {children}
    </IconButton>
  );
}
