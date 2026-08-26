import { TopicEmptySlot } from "@/components/molecules/TopicEmptySlot";
import { TopicVideoTile } from "@/components/molecules/TopicVideoTile";
import type { UiTopicVideo } from "@/types/topic/ui";

type TopicClipPageProps = {
  videos: UiTopicVideo[];
  captureHref: string;
  showCaptureSlot?: boolean;
  onSelectVideo?: (videoId: string) => void;
  playbackEnabled?: boolean;
};

export function TopicClipPage({
  videos,
  captureHref,
  showCaptureSlot = false,
  onSelectVideo,
  playbackEnabled = true,
}: TopicClipPageProps) {
  if (videos.length === 0 && !showCaptureSlot) {
    return <div className="flex h-full min-h-0 w-full flex-col" />;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {videos.map((video) => (
        <TopicVideoTile
          key={video.id}
          video={video}
          onSelect={onSelectVideo}
          playbackEnabled={playbackEnabled}
        />
      ))}
      {showCaptureSlot ? <TopicEmptySlot captureHref={captureHref} /> : null}
    </div>
  );
}
