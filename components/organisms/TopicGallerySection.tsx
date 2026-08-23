"use client";

import { TopicClipPage } from "@/components/molecules/TopicClipPage";
import { paginateTopicVideos } from "@/lib/topic/paginateTopicVideos";
import type { UiTopicVideo } from "@/types/topic/ui";
import { useMemo, useRef, useState } from "react";

type TopicGallerySectionProps = {
  videos: UiTopicVideo[];
  captureHref: string;
  onSelectVideo?: (videoId: string) => void;
};

export function TopicGallerySection({
  videos,
  captureHref,
  onSelectVideo,
}: TopicGallerySectionProps) {
  const pages = useMemo(() => paginateTopicVideos(videos), [videos]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const pageCount = pages.length;

  function scrollToPage(nextIndex: number) {
    const root = scrollerRef.current;
    if (!root) {
      return;
    }
    const clamped = Math.min(Math.max(nextIndex, 0), pageCount - 1);
    root.scrollTo({ left: clamped * root.clientWidth, behavior: "smooth" });
  }

  function handleScroll() {
    const root = scrollerRef.current;
    if (!root || root.clientWidth === 0) {
      return;
    }
    setPageIndex(Math.round(root.scrollLeft / root.clientWidth));
  }

  return (
    <section className="relative flex min-h-0 flex-1 flex-col" aria-label="토픽 영상">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex h-full min-h-0 flex-1 snap-x snap-mandatory items-stretch overflow-x-auto overflow-y-hidden touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((pageVideos, index) => (
          <div
            key={`topic-page-${index}`}
            className="flex min-h-0 w-full min-w-full shrink-0 snap-start snap-always flex-col self-stretch p-2"
          >
            <TopicClipPage
              videos={pageVideos}
              captureHref={captureHref}
              onSelectVideo={onSelectVideo}
            />
          </div>
        ))}
      </div>

      {pageCount > 1 ? (
        <>
          <button
            type="button"
            className="absolute inset-y-0 left-0 z-10 w-[12.5%] border-0 bg-transparent p-0"
            aria-label="이전 페이지"
            onClick={() => scrollToPage(pageIndex - 1)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 z-10 w-[12.5%] border-0 bg-transparent p-0"
            aria-label="다음 페이지"
            onClick={() => scrollToPage(pageIndex + 1)}
          />
        </>
      ) : null}
    </section>
  );
}
