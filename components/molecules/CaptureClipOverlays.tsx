import { formatOverlayClock } from "@/lib/video/formatOverlayClock";
import { OVERLAY_CAPTION_GAP_PX, OVERLAY_CAPTION_PX, OVERLAY_TIME_PX } from "@/lib/video/constants";

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
  const timeSize = OVERLAY_TIME_PX * safeScale;
  const captionSize = OVERLAY_CAPTION_PX * safeScale;
  const gap = OVERLAY_CAPTION_GAP_PX * safeScale;
  const inset = 24 * safeScale;

  if (!overlayTime && !trimmedCaption) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        style={{ width: `min(100% - ${inset * 2}px, ${352 * safeScale}px)` }}
      >
        {trimmedCaption ? (
          <>
            {overlayTime ? (
              <p
                className="absolute inset-x-0 m-0 font-bold leading-none text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]"
                style={{ bottom: `calc(100% + ${gap}px)`, fontSize: timeSize }}
              >
                {overlayTime}
              </p>
            ) : null}
            <p
              className="m-0 font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"
              style={{ fontSize: captionSize, lineHeight: 1.2 }}
            >
              {trimmedCaption}
            </p>
          </>
        ) : overlayTime ? (
          <p
            className="m-0 font-bold leading-none text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]"
            style={{ fontSize: timeSize }}
          >
            {overlayTime}
          </p>
        ) : null}
      </div>
    </div>
  );
}
