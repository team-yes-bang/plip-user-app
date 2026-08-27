"use client";

import { CaptureClipOverlays } from "@/components/molecules/CaptureClipOverlays";
import { UserProfileBadge } from "@/components/molecules/UserProfileBadge";
import { VideoClipThumbnail } from "@/components/molecules/VideoClipThumbnail";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";
import { parseUploadedAtToDate } from "@/lib/video/formatOverlayClock";
import type { UiTopicVideo } from "@/types/topic/ui";

type TopicVideoTileProps = {
  video: UiTopicVideo;
  onSelect?: (videoId: string) => void;
  playbackEnabled?: boolean;
};

export function TopicVideoTile({
  video,
  onSelect,
  playbackEnabled = true,
}: TopicVideoTileProps) {
  const { containerRef, videoRef, shouldRenderVideo, posterUrl, videoProps } = useVideoPlayback({
    videoUuid: video.id,
    rawPlaybackUrl: video.rawPlaybackUrl,
    thumbnailUrl: video.thumbnailSrc,
    mode: "feed",
    enabled: playbackEnabled,
    fetchIfMissing: true,
  });

  const body = (
    <>
      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          {...videoProps}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <VideoClipThumbnail
          src={posterUrl}
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <span
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,transparent_22%,transparent_55%,rgba(0,0,0,0.48)_100%)]"
        aria-hidden
      />
      <CaptureClipOverlays
        capturedAt={parseUploadedAtToDate(video.uploadedAt)}
        caption={video.caption}
      />
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-6">
        <UserProfileBadge
          profileUrl={video.profileImageSrc}
          nickname={video.profileNickname}
          size="sm"
          textClassName="!text-white font-semibold text-sm drop-shadow"
        />
      </div>
    </>
  );

  const className =
    "relative flex min-h-0 flex-1 overflow-hidden rounded-none bg-[var(--dl-color-bg-surface)]";

  return (
    <div ref={containerRef} className={className}>
      {onSelect ? (
        <button
          type="button"
          className="relative flex h-full min-h-0 w-full flex-1 overflow-hidden rounded-none border-0 bg-[var(--dl-color-bg-surface)] p-0 shadow-none"
          onClick={() => onSelect(video.id)}
        >
          {body}
        </button>
      ) : (
        body
      )}
    </div>
  );
}
