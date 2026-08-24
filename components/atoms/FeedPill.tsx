import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export const feedOverlayGlassClass =
  "border-0 bg-black/40 text-white shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-md";

type FeedPillProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
};

export function FeedPill({ children, className = "", ...props }: FeedPillProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold leading-4",
        feedOverlayGlassClass,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
