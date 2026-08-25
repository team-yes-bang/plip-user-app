"use client";

import { UserAvatar } from "@/components/atoms/UserAvatar";
import type { ApiAgitDetailMember } from "@/types/agit/api";

type ChatMemberRowProps = {
  member: ApiAgitDetailMember;
};

const FALLBACK_AVATAR = "/plip/v13/profile-avatar.svg";

export function ChatMemberRow({ member }: ChatMemberRowProps) {
  const nickname = member.nickname.trim() || "멤버";
  const profileImageSrc = member.profileImagePath?.trim() || FALLBACK_AVATAR;

  return (
    <div className="flex min-h-[52px] items-center gap-3 px-1 py-2">
      <UserAvatar src={profileImageSrc} size={40} className="border-0 bg-[var(--dl-color-bg-surface)]" />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-medium text-[var(--dl-color-text-primary)]">{nickname}</p>
        {member.role === "HOST" ? (
          <p className="m-[2px_0_0] text-[11px] text-[var(--dl-color-text-brand)]">방장</p>
        ) : null}
      </div>
    </div>
  );
}
