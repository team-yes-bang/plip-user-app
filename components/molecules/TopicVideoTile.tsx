import { UserAvatar } from "@/components/atoms";
import { CaptureClipOverlays } from "@/components/molecules/CaptureClipOverlays";
import { VideoClipThumbnail } from "@/components/molecules/VideoClipThumbnail";
import { parseUploadedAtToDate } from "@/lib/video/formatOverlayClock";
import type { UiTopicVideo } from "@/types/topic/ui";

type TopicVideoTileProps = {
  video: UiTopicVideo;
  onSelect?: (videoId: string) => void;
};

export function TopicVideoTile({ video, onSelect }: TopicVideoTileProps) {
  const body = (
    <>
      <VideoClipThumbnail
        src={video.thumbnailSrc}
        className="absolute inset-0 size-full object-cover"
      />
      <span
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,transparent_22%,transparent_55%,rgba(0,0,0,0.48)_100%)]"
        aria-hidden
      />
      <CaptureClipOverlays
        capturedAt={parseUploadedAtToDate(video.uploadedAt)}
        caption={video.caption}
        scale={1}
      />
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute bottom-3 left-3 flex min-w-0 max-w-[calc(100%-1.5rem)] items-center gap-2">
          <UserAvatar src={video.profileImageSrc} size={28} />
          <p className="m-0 overflow-hidden text-[13px] font-semibold leading-4 text-white [text-overflow:ellipsis] whitespace-nowrap [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
            {video.profileNickname}
          </p>
        </div>
      </div>
    </>
  );

  const className =
    "relative flex min-h-0 min-h-[40%] flex-1 overflow-hidden rounded-none border-0 bg-[var(--dl-color-bg-surface)] p-0 shadow-none";

  if (onSelect) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => onSelect(video.id)}
      >
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}
