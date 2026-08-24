"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

export type PreviewFrameMetrics = {
  width: number;
  height: number;
  scale: number;
};

const EMPTY: PreviewFrameMetrics = { width: 0, height: 0, scale: 1 };

export function usePreviewFrameMetrics(
  enabled: boolean,
  sectionRef: RefObject<HTMLElement | null>,
  slotRef: RefObject<HTMLElement | null>,
): PreviewFrameMetrics {
  const [metrics, setMetrics] = useState<PreviewFrameMetrics>(EMPTY);

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    const section = sectionRef.current;
    const slot = slotRef.current;
    if (!section || !slot) {
      return;
    }

    const update = () => {
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
    };

    const observer = new ResizeObserver(update);
    observer.observe(section);
    observer.observe(slot);
    update();

    return () => observer.disconnect();
  }, [enabled, sectionRef, slotRef]);

  return metrics;
}
