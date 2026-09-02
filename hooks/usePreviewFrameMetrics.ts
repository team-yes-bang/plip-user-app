"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";

export type PreviewFrameMetrics = {
  width: number;
  height: number;
  scale: number;
};

const EMPTY: PreviewFrameMetrics = { width: 0, height: 0, scale: 1 };

type UsePreviewFrameMetricsOptions = {
  /** First valid metrics snapshot is kept; ResizeObserver disconnects. */
  freeze?: boolean;
};

export function usePreviewFrameMetrics(
  enabled: boolean,
  sectionRef: RefObject<HTMLElement | null>,
  slotRef: RefObject<HTMLElement | null>,
  options: UsePreviewFrameMetricsOptions = {},
): PreviewFrameMetrics {
  const freeze = options.freeze ?? false;
  const [metrics, setMetrics] = useState<PreviewFrameMetrics>(EMPTY);
  const frozenRef = useRef(false);

  useLayoutEffect(() => {
    if (!enabled) {
      frozenRef.current = false;
      return;
    }

    const section = sectionRef.current;
    const slot = slotRef.current;
    if (!section || !slot) {
      return;
    }

    let observer: ResizeObserver | null = null;

    const update = () => {
      if (frozenRef.current) {
        return;
      }

      const originW = section.clientWidth;
      const originH = section.clientHeight;
      const slotW = slot.clientWidth;
      const slotH = slot.clientHeight;
      if (originW < 1 || originH < 1 || slotW < 1 || slotH < 1) {
        return;
      }

      const scale = Math.min(slotW / originW, slotH / originH);
      const width = originW * scale;
      const height = originH * scale;
      setMetrics((prev) => {
        if (prev.width === width && prev.height === height && prev.scale === scale) {
          return prev;
        }
        return { width, height, scale };
      });

      if (freeze) {
        frozenRef.current = true;
        observer?.disconnect();
        observer = null;
      }
    };

    observer = new ResizeObserver(update);
    observer.observe(section);
    observer.observe(slot);
    update();

    return () => {
      observer?.disconnect();
    };
  }, [enabled, freeze, sectionRef, slotRef]);

  return metrics;
}
