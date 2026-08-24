import { DailyIcon, UserAvatar } from "@/components/atoms";
import type { UiTopicVideo } from "@/types/topic/ui";

type TopicVideoTileProps = {
  video: UiTopicVideo;
  onSelect?: (videoId: string) => void;
};

function formatUploadTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(new Date(iso));
}

export function TopicVideoTile({ video, onSelect }: TopicVideoTileProps) {
  const time = formatUploadTime(video.uploadedAt);
  const caption = video.caption.trim();

  const body = (
    <>
      <img
        src={video.thumbnailSrc}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <span
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,transparent_28%,transparent_58%,rgba(0,0,0,0.38)_100%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-3 top-3 flex min-w-0 items-center gap-2">
          <UserAvatar src={video.profileImageSrc} size={28} />
          <p className="m-0 overflow-hidden text-[13px] font-semibold leading-4 text-white [text-overflow:ellipsis] whitespace-nowrap [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
            {video.profileNickname}
          </p>
        </div>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <DailyIcon name="play" size={36} />
          <div className="relative mt-1">
            <p className="m-0 text-[28px] font-bold leading-none text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
              {time}
            </p>
            {caption ? (
              <p className="absolute top-full left-1/2 mt-1.5 m-0 w-max max-w-[70vw] -translate-x-1/2 text-center text-[13px] font-medium leading-4 text-white/92 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                {caption}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );

  const className =
    "relative flex min-h-0 flex-1 overflow-hidden rounded-none border-0 bg-[var(--dl-color-bg-surface)] p-0 shadow-none";

  if (onSelect) {
    return (
      <button
        type="button"
        className={`${className} cursor-pointer p-0 text-left`}
        onClick={() => onSelect(video.id)}
      >
        {body}
      </button>
    );
  }

  return <article className={className}>{body}</article>;
}
