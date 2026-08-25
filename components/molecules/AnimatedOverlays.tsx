"use client";

import { useOverlayTransition } from "@/hooks/useOverlayTransition";
import { cn } from "@/lib/utils";
import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const OverlayPortalContext = createContext<HTMLElement | null>(null);

/** 기기 프레임 오버레이 호스트. 없으면 null (포탈 대신 로컬 absolute 폴백). */
export function useOverlayPortalHost() {
  return useContext(OverlayPortalContext);
}

/** 기기 프레임 안에서 사이드 시트가 하단 탭을 덮도록 포탈 호스트를 제공한다. */
export function OverlayPortalProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  return (
    <OverlayPortalContext.Provider value={host}>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
        <div
          id="plip-overlay-root"
          ref={setHost}
          className="pointer-events-none absolute inset-0 z-[40]"
        />
      </div>
    </OverlayPortalContext.Provider>
  );
}

type AnimatedDropdownProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
  role?: string;
  "aria-label"?: string;
};

export function AnimatedDropdown({
  open,
  children,
  className = "",
  id,
  role = "menu",
  "aria-label": ariaLabel,
}: AnimatedDropdownProps) {
  const { mounted, visible } = useOverlayTransition(open, 200);

  if (!mounted) return null;

  return (
    <div
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-hidden={!visible}
      className={cn(
        "origin-top-right [transition:opacity_200ms_ease,transform_200ms_cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
        visible
          ? "pointer-events-auto opacity-100 [transform:translateY(0)_scale(1)]"
          : "pointer-events-none opacity-0 [transform:translateY(-6px)_scale(0.96)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type AnimatedDialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
};

export function AnimatedDialog({
  open,
  onClose,
  children,
  className = "",
  labelledBy,
}: AnimatedDialogProps) {
  const { mounted, visible } = useOverlayTransition(open);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-[1rem]" role="presentation">
      <button
        type="button"
        className={cn(
          "absolute inset-0 border-0 bg-[rgba(0,0,0,0.45)] [transition:opacity_280ms_ease] motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby={labelledBy}
        aria-hidden={!visible}
        className={cn(
          "relative z-[1] w-full max-w-full [transition:opacity_280ms_ease,transform_280ms_cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          visible
            ? "opacity-100 [transform:scale(1)_translateY(0)]"
            : "opacity-0 [transform:scale(0.96)_translateY(8px)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

type AnimatedSideSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  side?: "left" | "right";
  "aria-label"?: string;
};

export function AnimatedSideSheet({
  open,
  onClose,
  children,
  className = "",
  side = "right",
  "aria-label": ariaLabel,
}: AnimatedSideSheetProps) {
  const { mounted, visible } = useOverlayTransition(open);
  const host = useContext(OverlayPortalContext);

  if (!mounted) return null;

  const sheet = (
    <div className="pointer-events-none absolute inset-0">
      <button
        type="button"
        className={cn(
          "absolute inset-0 border-0 bg-[rgba(0,0,0,0.32)] [transition:opacity_280ms_ease] motion-reduce:transition-none",
          visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-label="닫기"
        onClick={onClose}
      />
      <aside
        aria-label={ariaLabel}
        aria-hidden={!visible}
        className={cn(
          "absolute top-0 bottom-0 z-[1] flex w-[min(310px,86%)] flex-col gap-2.5 overflow-y-auto bg-[#fbfaff] px-6 pt-12 pb-12 shadow-md [transition:transform_280ms_cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none md:pb-5",
          side === "left" ? "left-0 rounded-r-[24px]" : "right-0 rounded-l-[24px]",
          visible
            ? "pointer-events-auto [transform:translateX(0)]"
            : side === "left"
              ? "pointer-events-none [transform:translateX(-100%)]"
              : "pointer-events-none [transform:translateX(100%)]",
          className,
        )}
      >
        {children}
      </aside>
    </div>
  );

  if (host) {
    return createPortal(sheet, host);
  }

  return <div className="fixed inset-0 z-[40] md:absolute">{sheet}</div>;
}

type AnimatedBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  labelledBy?: string;
};

export function AnimatedBottomSheet({
  open,
  onClose,
  children,
  className = "",
  "aria-label": ariaLabel,
  labelledBy,
}: AnimatedBottomSheetProps) {
  const { mounted, visible } = useOverlayTransition(open);
  const host = useContext(OverlayPortalContext);

  if (!mounted) return null;

  const sheet = (
    <div className="pointer-events-none absolute inset-0 z-[50]">
      <button
        type="button"
        className={cn(
          "absolute inset-0 border-0 bg-[rgba(0,0,0,0.45)] [transition:opacity_280ms_ease] motion-reduce:transition-none",
          visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-hidden={!visible}
        className={cn(
          "absolute bottom-0 left-0 right-0 z-[1] flex max-h-[90vh] flex-col rounded-t-[24px] border-t border-[#e3e0ed] bg-[#fbfaff] px-6 pt-3 pb-8 shadow-[0_-8px_32px_rgba(23,23,28,0.14)] [transition:transform_280ms_cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none md:pb-6",
          visible
            ? "pointer-events-auto [transform:translateY(0)]"
            : "pointer-events-none [transform:translateY(100%)]",
          className,
        )}

      >
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-[#d0cde0]" aria-hidden />
        {children}
      </div>
    </div>
  );

  if (host) {
    return createPortal(sheet, host);
  }

  return <div className="fixed inset-0 z-[50] md:absolute">{sheet}</div>;
}

