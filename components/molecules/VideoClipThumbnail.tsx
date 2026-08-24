"use client";

import {
  resolveVideoThumbnail,
  VIDEO_THUMBNAIL_NOT_LOADED,
} from "@/lib/video/thumbnail";
import { cn } from "@/lib/utils";
import { useState } from "react";

type VideoClipThumbnailProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
};

export function VideoClipThumbnail({
  src,
  alt = "",
  className,
  fallbackClassName,
}: VideoClipThumbnailProps) {
  const [currentSrc, setCurrentSrc] = useState(() => resolveVideoThumbnail(src));
  const [exhausted, setExhausted] = useState(false);

  if (exhausted) {
    return (
      <div
        className={cn(
          "bg-[linear-gradient(145deg,_#5a5a5a,_#1f1f1f)]",
          fallbackClassName,
          className,
        )}
        aria-hidden={!alt}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== VIDEO_THUMBNAIL_NOT_LOADED) {
          setCurrentSrc(VIDEO_THUMBNAIL_NOT_LOADED);
          return;
        }
        setExhausted(true);
      }}
      onLoad={(event) => {
        if (event.currentTarget.naturalWidth === 0) {
          if (currentSrc !== VIDEO_THUMBNAIL_NOT_LOADED) {
            setCurrentSrc(VIDEO_THUMBNAIL_NOT_LOADED);
            return;
          }
          setExhausted(true);
        }
      }}
    />
  );
}
