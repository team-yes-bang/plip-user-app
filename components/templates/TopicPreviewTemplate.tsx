import { TextLink } from "@/components/atoms";
import { TopicGallerySection } from "@/components/organisms/TopicGallerySection";
import { AppChromeTemplate } from "@/components/templates/AppChromeTemplate";
import { ROUTES } from "@/config/routes";
import {
  getTopicPreviewVideos,
  TOPIC_PREVIEW_COUNTS,
  type TopicPreviewCount,
} from "@/config/topic-mock";

type TopicPreviewTemplateProps = {
  videoCount: TopicPreviewCount;
};

export function TopicPreviewTemplate({ videoCount }: TopicPreviewTemplateProps) {
  const videos = getTopicPreviewVideos(videoCount);

  return (
    <AppChromeTemplate variant="light" showNav={false} activeTab="agit">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2 px-6 pt-3">
          {TOPIC_PREVIEW_COUNTS.map((count) => {
            const selected = count === videoCount;
            return (
              <TextLink
                key={count}
                href={`${ROUTES.topicPreview}?n=${count}`}
                className={`inline-flex h-7 items-center rounded-[14px] px-3 text-xs font-semibold no-underline ${
                  selected
                    ? "bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)]"
                    : "bg-[var(--dl-color-bg-surface)] text-[var(--dl-color-text-secondary)]"
                }`}
              >
                {count}개
              </TextLink>
            );
          })}
        </div>
        <TopicGallerySection
          key={videoCount}
          videos={videos}
          captureHref={ROUTES.capture.video}
        />
      </div>
    </AppChromeTemplate>
  );
}
