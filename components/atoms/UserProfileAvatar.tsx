import { DefaultProfileAvatar } from "@/components/atoms/DefaultProfileAvatar";
import { isDefaultProfileAvatarUrl, resolveProfileImageUrl } from "@/lib/user/profileImage";

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

const SIZE_PX = {
  sm: 24,
  md: 32,
  lg: 40,
};

export function UserProfileAvatar({
  src,
  nickname,
  size = "md",
  className = "",
}: UserProfileAvatarProps) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const sizePx = SIZE_PX[size] ?? SIZE_PX.md;
  const alt = nickname ? `${nickname} 프로필` : "사용자 프로필";
  const resolvedSrc = resolveProfileImageUrl(src);

  if (isDefaultProfileAvatarUrl(resolvedSrc)) {
    return (
      <DefaultProfileAvatar
        alt={alt}
        size={sizePx}
        sizeClass={sizeClass}
        className={`shrink-0 ${className}`.trim()}
        wrapperClassName=""
      />
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={sizePx}
      height={sizePx}
      className={`rounded-full object-cover shrink-0 ${sizeClass} ${className}`}
    />
  );
}
