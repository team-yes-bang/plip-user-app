import { cn } from "@/lib/utils";

type VideoCenterClockProps = {
  time?: string;
  className?: string;
};

export function VideoCenterClock({ time, className = "" }: VideoCenterClockProps) {
  if (!time) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex items-center justify-center select-none",
        className
      )}
    >
      <span className="text-[52px] font-black tracking-wider text-white/90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
        {time}
      </span>
    </div>
  );
}
