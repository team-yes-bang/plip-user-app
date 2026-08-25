"use client";

import { DailyIcon } from "@/components/atoms/DailyIcon";

type UserProfileAvatarProps = {
  src?: string | null;
  nickname?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

const ICON_SIZES = {
  sm: 14,
  md: 18,
  lg: 22,
};

export function UserProfileAvatar({
  src,
  nickname,
  size = "md",
  className = "",
}: UserProfileAvatarProps) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const iconSize = ICON_SIZES[size] ?? ICON_SIZES.md;

  const fallbackChar = nickname ? nickname.trim().charAt(0).toUpperCase() : "";

  if (src && src.trim()) {
    return (
      <img
        src={src}
        alt={nickname ? `${nickname} 프로필` : "사용자 프로필"}
        className={`rounded-full object-cover shrink-0 ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[var(--dl-color-bg-surface-subtle,#e5e7eb)] text-[var(--dl-color-text-secondary,#4b5563)] font-semibold shrink-0 select-none ${sizeClass} ${className}`}
    >
      {fallbackChar ? (
        <span>{fallbackChar}</span>
      ) : (
        <DailyIcon name="messageBrand" size={iconSize} className="opacity-60" />
      )}
    </div>
  );
}
