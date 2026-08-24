import { TopicEmptySlot } from "@/components/molecules/TopicEmptySlot";
import { TopicVideoTile } from "@/components/molecules/TopicVideoTile";
import type { UiTopicVideo } from "@/types/topic/ui";

type TopicClipPageProps = {
  videos: UiTopicVideo[];
  captureHref: string;
  onSelectVideo?: (videoId: string) => void;
};

export function TopicClipPage({
  videos,
  captureHref,
  onSelectVideo,
}: TopicClipPageProps) {
  if (videos.length === 0) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col">
        <TopicEmptySlot captureHref={captureHref} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {videos.map((video) => (
        <TopicVideoTile key={video.id} video={video} onSelect={onSelectVideo} />
      ))}
    </div>
  );
}
