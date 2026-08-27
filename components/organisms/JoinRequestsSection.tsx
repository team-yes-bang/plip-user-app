"use client";

import { approveJoinRequestAction, rejectJoinRequestAction } from "@/actions/agitActions";
import type { ApiJoinRequestItem } from "@/types/agit/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinRequestsSection({
  agitId,
  agitName,
  requests,
}: {
  agitId: string;
  agitName?: string;
  requests: ApiJoinRequestItem[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(ampId: number, action: "approve" | "reject") {
    if (pendingId) return;
    setPendingId(ampId);
    setError(null);
    const request = requests.find((item) => item.ampId === ampId);
    const notify = {
      requesterUserUuid: request?.userUuid,
      agitName,
    };
    const result =
      action === "approve"
        ? await approveJoinRequestAction(agitId, ampId, notify)
        : await rejectJoinRequestAction(agitId, ampId, notify);
    setPendingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-3" aria-label="입장 요청">
      <h2 className="m-0 text-base font-semibold text-[var(--dl-color-text-primary)]">입장 요청</h2>
      {error ? (
        <p className="m-0 text-sm text-[var(--dl-color-text-secondary)]" role="alert">
          {error}
        </p>
      ) : null}
      {requests.length === 0 ? (
        <p className="m-0 text-sm text-[var(--dl-color-text-secondary)]">대기 중인 요청이 없어요.</p>
      ) : (
        requests.map((request) => (
          <div
            key={request.ampId}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-elevated)] p-3"
          >
            <span className="text-sm font-semibold text-[var(--dl-color-text-primary)]">
              {request.nickname}
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                disabled={pendingId === request.ampId}
                className="rounded-full px-3 py-1 text-xs font-semibold text-[var(--dl-color-text-brand)]"
                onClick={() => void handle(request.ampId, "approve")}
              >
                수락
              </button>
              <button
                type="button"
                disabled={pendingId === request.ampId}
                className="rounded-full px-3 py-1 text-xs font-semibold text-[var(--dl-color-text-secondary)]"
                onClick={() => void handle(request.ampId, "reject")}
              >
                거절
              </button>
            </span>
          </div>
        ))
      )}
    </section>
  );
}
