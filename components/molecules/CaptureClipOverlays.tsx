import { formatOverlayClock } from "@/lib/video/formatOverlayClock";
import { OVERLAY_CAPTION_GAP_PX, OVERLAY_CAPTION_PX } from "@/lib/video/constants";

type CaptureClipOverlaysProps = {
  capturedAt: Date | null;
  caption: string;
  /** 1 = fullscreen/capture size. Preview passes frameHeight / viewportHeight. */
  scale?: number;
};

export function CaptureClipOverlays({ capturedAt, caption, scale = 1 }: CaptureClipOverlaysProps) {
  const overlayTime = capturedAt ? formatOverlayClock(capturedAt) : "";
  const trimmedCaption = caption.trim();
  const safeScale = scale > 0 ? scale : 1;
  const captionSize = OVERLAY_CAPTION_PX * safeScale;
  const gap = OVERLAY_CAPTION_GAP_PX * safeScale;
  const inset = 24 * safeScale;

  if (!overlayTime && !trimmedCaption) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] [container-type:size]">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        style={{ width: `min(100% - ${inset * 2}px, ${352 * safeScale}px)` }}
      >
        {trimmedCaption ? (
          <>
            {overlayTime ? (
              <p
                className="absolute inset-x-0 m-0 font-black leading-none text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.55)] whitespace-nowrap"
                style={{ bottom: `calc(100% + ${gap}px)`, fontSize: "clamp(32px, 15cqmin, 72px)" }}
              >
                {overlayTime}
              </p>
            ) : null}
            <p
              className="m-0 font-light text-white/80 opacity-80 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"
              style={{ fontSize: Math.min(captionSize, 13), lineHeight: 1.2 }}
            >
              {trimmedCaption}
            </p>
          </>
        ) : overlayTime ? (
          <p
            className="m-0 font-black leading-none text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.55)] whitespace-nowrap"
            style={{ fontSize: "clamp(32px, 15cqmin, 72px)" }}
          >
            {overlayTime}
          </p>
        ) : null}
      </div>
    </div>
  );
}
