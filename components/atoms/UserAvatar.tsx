import { DefaultProfileAvatar } from "@/components/atoms/DefaultProfileAvatar";
import { isDefaultProfileAvatarUrl } from "@/lib/user/profileImage";

type UserAvatarProps = {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
};

export function UserAvatar({
  src,
  alt = "",
  size = 28,
  className = "",
}: UserAvatarProps) {
  const wrapperClassName =
    `border border-white/45 bg-[var(--dl-color-bg-brand-subtle)] ${className}`.trim();

  if (isDefaultProfileAvatarUrl(src)) {
    return (
      <DefaultProfileAvatar
        alt={alt}
        size={size}
        wrapperClassName={wrapperClassName}
      />
    );
  }

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${wrapperClassName}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src.trim()}
        alt={alt}
        width={size}
        height={size}
        className="size-full object-cover"
      />
    </span>
  );
}
