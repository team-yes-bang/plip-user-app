"use client";

import { useOverlayPortalHost } from "@/components/molecules/AnimatedOverlays";
import { useOverlayTransition } from "@/hooks/useOverlayTransition";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "brand";
  loading?: boolean;
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "danger",
  loading = false,
}: ConfirmModalProps) {
  const { mounted, visible } = useOverlayTransition(open);
  const host = useOverlayPortalHost();

  if (!mounted) return null;

  const confirmBtnClass =
    tone === "danger"
      ? "bg-[var(--dl-color-bg-danger)] text-[var(--dl-color-text-danger)] hover:opacity-90"
      : "bg-[var(--dl-color-bg-brand)] text-[#fff] hover:opacity-90";

  const modal = (
    <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center p-6">
      <button
        type="button"
        className={cn(
          "absolute inset-0 border-0 bg-[rgba(0,0,0,0.38)] [transition:opacity_280ms_ease] motion-reduce:transition-none",
          visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-label="취소"
        onClick={() => {
          if (!loading) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal
        aria-hidden={!visible}
        className={cn(
          "relative z-[1] w-full max-w-[290px] rounded-[22px] border border-[#e3e0ed] bg-[#fbfaff] p-5 shadow-[0_12px_32px_rgba(31,28,41,0.16)] [transition:opacity_280ms_ease,transform_280ms_cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          visible
            ? "pointer-events-auto opacity-100 [transform:scale(1)_translateY(0)]"
            : "pointer-events-none opacity-0 [transform:scale(0.95)_translateY(8px)]",
        )}
      >
        <p className="m-0 text-base font-bold text-[#1f1c29]">{title}</p>
        {description ? (
          <p className="m-[8px_0_0] text-xs font-normal leading-relaxed text-[#756e8a]">{description}</p>
        ) : null}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-surface)] text-sm font-semibold text-[#262433] transition-opacity hover:opacity-80 disabled:opacity-50"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn(
              "flex h-11 flex-1 cursor-pointer items-center justify-center rounded-[var(--dl-radius-md)] text-sm font-semibold transition-opacity disabled:opacity-50",
              confirmBtnClass,
            )}
            disabled={loading}
            onClick={() => void onConfirm()}
          >
            {loading ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (host) {
    return createPortal(modal, host);
  }

  return <div className="fixed inset-0 z-[60] md:absolute">{modal}</div>;
}
