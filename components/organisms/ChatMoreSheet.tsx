"use client";

import { AnimatedSideSheet } from "@/components/molecules/AnimatedOverlays";
import { ChatMemberRow } from "@/components/molecules/ChatMemberRow";
import { SideSheetHeader } from "@/components/molecules/SideSheetMenu";
import { sortAgitMembers } from "@/lib/agit/sortMembers";
import type { ApiAgitDetailMember } from "@/types/agit/api";
import type { UiAgit } from "@/types/agit/ui";

type ChatMoreSheetProps = {
  agit: UiAgit;
  members: ApiAgitDetailMember[];
  currentUserUuid?: string;
  open: boolean;
  onClose: () => void;
};

export function ChatMoreSheet({
  agit,
  members,
  currentUserUuid,
  open,
  onClose,
}: ChatMoreSheetProps) {
  const sortedMembers = sortAgitMembers(members, currentUserUuid);
  const thumbnailSrc = agit.thumbnailSrc?.trim();

  return (
    <AnimatedSideSheet open={open} onClose={onClose} aria-label="채팅방 정보">
      <SideSheetHeader title="" onClose={onClose} />

      <div className="flex flex-col items-center gap-3 px-2 pt-2">
        <div
          className="size-16 shrink-0 overflow-hidden rounded-[16px] bg-[var(--dl-color-bg-surface)]"
          style={thumbnailSrc ? undefined : { background: agit.coverGradient }}
        >
          {thumbnailSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailSrc} alt="" className="size-full object-cover" />
          ) : null}
        </div>
        <div className="text-center">
          <p className="m-0 text-base font-semibold text-[var(--dl-color-text-primary)]">{agit.name}</p>
          <p className="m-[4px_0_0] text-xs text-[var(--dl-color-text-tertiary)]">
            대화 상대 {sortedMembers.length}명
          </p>
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <p className="m-0 px-1 pb-2 text-xs font-semibold text-[var(--dl-color-text-secondary)]">멤버</p>
        <div className="flex flex-col">
          {sortedMembers.map((member) => (
            <ChatMemberRow key={member.userUuid} member={member} />
          ))}
        </div>
      </div>
    </AnimatedSideSheet>
  );
}
