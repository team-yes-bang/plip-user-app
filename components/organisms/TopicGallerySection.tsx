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
  const pageCount = pages.length;
  const [pageIndex, setPageIndex] = useState(0);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const skipClick = useRef(false);
  const safeIndex = Math.min(pageIndex, Math.max(pageCount - 1, 0));

  function goToPage(nextIndex: number) {
    setPageIndex(Math.min(Math.max(nextIndex, 0), pageCount - 1));
  }

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || pageCount < 2) {
      return;
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.25) {
      return;
    }
    skipClick.current = true;
    goToPage(dx < 0 ? safeIndex + 1 : safeIndex - 1);
  }

  function handleClickCapture(event: React.MouseEvent<HTMLElement>) {
    if (!skipClick.current) {
      return;
    }
    skipClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <section
      className="relative h-full min-h-0 w-full touch-pan-y overflow-hidden"
      aria-label="토픽 영상"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      onClickCapture={handleClickCapture}
    >
      {pages.map((pageVideos, index) => (
        <div
          key={`topic-page-${index}`}
          className={
            videos.length === 0
              ? "absolute inset-0 flex flex-col px-[23px] pb-6"
              : "absolute inset-0 flex flex-col"
          }
          style={{ transform: `translate3d(${(index - safeIndex) * 100}%, 0, 0)` }}
        >
          <TopicClipPage
            videos={pageVideos}
            captureHref={captureHref}
            onSelectVideo={onSelectVideo}
          />
        </div>
      ))}

      {pageCount > 1 ? (
        <>
          <button
            type="button"
            className="absolute inset-y-0 left-0 z-10 w-[12.5%] touch-pan-y border-0 bg-transparent p-0"
            aria-label="이전 페이지"
            onClick={() => goToPage(safeIndex - 1)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 z-10 w-[12.5%] touch-pan-y border-0 bg-transparent p-0"
            aria-label="다음 페이지"
            onClick={() => goToPage(safeIndex + 1)}
          />
        </>
      ) : null}
    </section>
  );
}
