import { cn } from "@/lib/utils";

type VideoBottomInfoProps = {
  authorName?: string;
  date?: string;
  caption?: string;
  className?: string;
};

export function VideoBottomInfo({
  authorName,
  date,
  caption,
  className = "",
}: VideoBottomInfoProps) {
  return (
    <div
      className={cn(
        "relative z-10 mt-auto flex items-center justify-between px-6 pb-12 text-white",
        className
      )}
    >
      {/* 하단 좌측: 작성자 & 캡션 */}
      <div className="flex flex-col gap-0.5 max-w-[70%] min-w-0">
        <span className="text-base font-bold truncate">
          {authorName || "작성자"}
        </span>
        {caption && (
          <span className="text-xs text-white/80 line-clamp-2 leading-snug">
            {caption}
          </span>
        )}
      </div>

      {/* 하단 우측: 날짜 */}
      {date && (
        <span className="text-xs font-medium text-white/80 shrink-0 ml-2">
          {date}
        </span>
      )}
    </div>
  );
}
