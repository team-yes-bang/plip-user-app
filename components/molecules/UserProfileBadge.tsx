"use client";

import { UserProfileAvatar } from "@/components/atoms/UserProfileAvatar";

type UserProfileBadgeProps = {
  profileUrl?: string | null;
  nickname?: string | null;
  subText?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  textClassName?: string;
};

const TEXT_SIZES = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function UserProfileBadge({
  profileUrl,
  nickname,
  subText,
  size = "md",
  className = "",
  textClassName = "",
}: UserProfileBadgeProps) {
  const displayName = nickname?.trim() || "알 수 없음";
  const textSizeClass = TEXT_SIZES[size] ?? TEXT_SIZES.md;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <UserProfileAvatar src={profileUrl} nickname={displayName} size={size} />
      <div className="flex flex-col min-w-0 leading-tight">
        <span
          className={`font-semibold truncate text-[var(--dl-color-text-primary,#111827)] ${textSizeClass} ${textClassName}`}
        >
          {displayName}
        </span>
        {subText && (
          <span className="text-[10px] text-[var(--dl-color-text-secondary,#6b7280)] truncate">
            {subText}
          </span>
        )}
      </div>
    </div>
  );
}
