import type { ReactNode } from "react";

type CaptureVideoFrameProps = {
  children: ReactNode;
  /** step 2 확인 화면 · /video lab */
  variant?: "card" | "lab";
  className?: string;
};

/** Recorded playback — step2 / lab */
export function CaptureVideoFrame({
  children,
  variant = "card",
  className = "",
}: CaptureVideoFrameProps) {
  const base =
    variant === "lab"
      ? "relative mx-auto w-full max-w-2xl aspect-[9/16] max-h-[min(72dvh,420px)] overflow-hidden rounded-lg border bg-black sm:max-h-[420px]"
      : "relative w-full aspect-[9/16] max-h-[min(72dvh,680px)] overflow-hidden rounded-2xl bg-black";

  return <div className={`${base} ${className}`.trim()}>{children}</div>;
}
