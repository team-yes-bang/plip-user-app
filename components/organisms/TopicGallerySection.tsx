"use client";

import { TopicClipPage } from "@/components/molecules/TopicClipPage";
import { paginateTopicVideos } from "@/lib/topic/paginateTopicVideos";
import type { UiTopicVideo } from "@/types/topic/ui";
import { useMemo, useRef, useState } from "react";

const CAPTURE_SLOT_ID = "__capture-slot__";

type CaptureSlotItem = { id: typeof CAPTURE_SLOT_ID };
type GalleryPageItem = UiTopicVideo | CaptureSlotItem;

const CAPTURE_SLOT: CaptureSlotItem = { id: CAPTURE_SLOT_ID };

function isCaptureSlot(item: GalleryPageItem): item is CaptureSlotItem {
  return item.id === CAPTURE_SLOT_ID;
}

type TopicGallerySectionProps = {
  videos: UiTopicVideo[];
  captureHref: string;
  showCaptureSlot?: boolean;
  onSelectVideo?: (videoId: string) => void;
};

export function TopicGallerySection({
  videos,
  captureHref,
  showCaptureSlot = false,
  onSelectVideo,
}: TopicGallerySectionProps) {
  const items = useMemo<GalleryPageItem[]>(
    () => (showCaptureSlot ? [...videos, CAPTURE_SLOT] : videos),
    [showCaptureSlot, videos],
  );
  const pages = useMemo(() => paginateTopicVideos(items), [items]);
  const pageCount = pages.length;
  const [pageIndex, setPageIndex] = useState(0);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const skipClick = useRef(false);
  const safeIndex = Math.min(pageIndex, Math.max(pageCount - 1, 0));

  const [prevKey, setPrevKey] = useState({ showCaptureSlot, len: videos.length });
  if (prevKey.showCaptureSlot !== showCaptureSlot || prevKey.len !== videos.length) {
    setPrevKey({ showCaptureSlot, len: videos.length });
    setPageIndex(0);
  }

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

  function renderPage(pageItems: GalleryPageItem[], key: string) {
    const pageVideos = pageItems.filter((item): item is UiTopicVideo => !isCaptureSlot(item));
    return (
      <TopicClipPage
        key={key}
        videos={pageVideos}
        captureHref={captureHref}
        showCaptureSlot={pageItems.some(isCaptureSlot)}
        onSelectVideo={onSelectVideo}
      />
    );
  }

  const paddedEmpty = videos.length === 0;

  return (
    <section
      className="relative h-full min-h-0 w-full overflow-hidden"
      aria-label="토픽 영상"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      onClickCapture={handleClickCapture}
    >
      {pageCount <= 1 ? (
        <div
          className={
            paddedEmpty ? "flex h-full min-h-0 flex-col px-[23px] pb-6" : "flex h-full min-h-0 flex-col"
          }
        >
          {renderPage(pages[0] ?? [], "topic-page-0")}
        </div>
      ) : (
        pages.map((pageItems, index) => (
          <div
            key={`topic-page-${index}`}
            className="absolute inset-0 flex flex-col"
            style={{ transform: `translate3d(${(index - safeIndex) * 100}%, 0, 0)` }}
          >
            {renderPage(pageItems, `topic-page-${index}`)}
          </div>
        ))
      )}

      {pageCount > 1 ? (
        <>
          <button
            type="button"
            className="absolute inset-y-0 left-0 z-10 w-[12.5%] border-0 bg-transparent p-0"
            aria-label="이전 페이지"
            onClick={() => goToPage(safeIndex - 1)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 z-10 w-[12.5%] border-0 bg-transparent p-0"
            aria-label="다음 페이지"
            onClick={() => goToPage(safeIndex + 1)}
          />
        </>
      ) : null}
    </section>
  );
}
