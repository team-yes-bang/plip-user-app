import { DEFAULT_PROFILE_AVATAR } from "@/types/user/ui";

type DefaultProfileAvatarProps = {
  alt?: string;
  size?: number;
  sizeClass?: string;
  className?: string;
  wrapperClassName?: string;
};

export function DefaultProfileAvatar({
  alt = "",
  size,
  sizeClass = "",
  className = "",
  wrapperClassName = "",
}: DefaultProfileAvatarProps) {
  const image = (
    <img
      src={DEFAULT_PROFILE_AVATAR}
      alt={alt}
      width={size}
      height={size}
      className={`size-full object-cover ${sizeClass} ${className}`.trim()}
    />
  );

  if (size == null) {
    return image;
  }

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${wrapperClassName}`.trim()}
      style={{ width: size, height: size }}
    >
      {image}
    </span>
  );
}
