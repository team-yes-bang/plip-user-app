import { formatOverlayClock } from "@/lib/video/formatOverlayClock";

type CaptureClipOverlaysProps = {
  capturedAt: Date | null;
  caption: string;
};

export function CaptureClipOverlays({ capturedAt, caption }: CaptureClipOverlaysProps) {
  const overlayTime = capturedAt ? formatOverlayClock(capturedAt) : "";
  const trimmedCaption = caption.trim();

  if (!overlayTime && !trimmedCaption) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] [container-type:size]">
      <div className="absolute left-1/2 top-1/2 w-[min(88cqw,100%)] -translate-x-1/2 -translate-y-1/2 text-center">
        {overlayTime ? (
          <p className="relative z-[1] m-0 font-black leading-none text-white [font-size:clamp(1.15rem,15cqw,4.5rem)] [text-shadow:0_1px_4px_rgba(0,0,0,0.55)] whitespace-nowrap">
            {overlayTime}
          </p>
        ) : null}
        {trimmedCaption ? (
          <p
            className={
              overlayTime
                ? "absolute left-1/2 top-full m-0 mt-[0.35em] w-full -translate-x-1/2 font-light text-white/80 [font-size:clamp(0.65rem,4.2cqw,0.95rem)] leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"
                : "m-0 font-light text-white/80 [font-size:clamp(0.65rem,4.2cqw,0.95rem)] leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"
            }
          >
            {trimmedCaption}
          </p>
        ) : null}
      </div>
    </div>
  );
}
