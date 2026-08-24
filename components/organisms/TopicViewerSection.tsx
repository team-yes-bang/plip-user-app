"use client";

import { HeaderBackLink, HeaderMenuButton, ScreenHeader } from "@/components/molecules";
import { TopicGallerySection } from "@/components/organisms/TopicGallerySection";
import { ROUTES } from "@/config/routes";
import type { UiTopicVideo } from "@/types/topic/ui";
import { useRouter } from "next/navigation";

type TopicViewerSectionProps = {
  agitId: string;
  topicId?: string;
  title?: string;
  meta?: string;
  videos?: UiTopicVideo[];
  showCaptureSlot?: boolean;
  backHref?: string;
  onMenuClick?: () => void;
};

export function TopicViewerSection({
  agitId,
  topicId,
  title = "오늘의 토픽",
  meta = "",
  videos = [],
  showCaptureSlot = false,
  backHref = ROUTES.agit.root,
  onMenuClick,
}: TopicViewerSectionProps) {
  const router = useRouter();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden" aria-label={title}>
      <ScreenHeader
        leading={<HeaderBackLink href={backHref} />}
        title={title}
        subtitle={meta || undefined}
        trailing={onMenuClick ? <HeaderMenuButton label="아지트 메뉴" onClick={onMenuClick} /> : undefined}
      />
      <TopicGallerySection
        videos={videos}
        captureHref={ROUTES.capture.videoWith({ agitUuid: agitId, topicUuid: topicId })}
        showCaptureSlot={showCaptureSlot}
        onSelectVideo={(videoId) => router.push(ROUTES.viewer.clip(videoId))}
      />
    </div>
  );
}
