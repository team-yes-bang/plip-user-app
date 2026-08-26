const ICON_SRC = {
  users: "/plip/daily-loop/icon-users.svg",
  crownBrand: "/plip/daily-loop/icon-crown-brand.svg",
  video: "/plip/daily-loop/icon-video.svg",
  plus: "/plip/daily-loop/icon-plus.svg",
  minus: "/plip/daily-loop/icon-minus.svg",
  image: "/plip/daily-loop/icon-image.svg",
  link: "/plip/daily-loop/icon-link2.svg",
  check: "/plip/daily-loop/icon-check.svg",
  circle: "/plip/daily-loop/icon-circle.svg",
  circleDot: "/plip/daily-loop/icon-circle-dot.svg",
  chevronRight: "/plip/daily-loop/icon-chevron-right.svg",
  bell: "/plip/daily-loop/icon-bell.svg",
  camera: "/plip/daily-loop/icon-camera.svg",
  play: "/plip/daily-loop/icon-play.svg",
  download: "/plip/daily-loop/icon-download.svg",
  alert: "/plip/daily-loop/icon-alert.svg",
  grip: "/plip/daily-loop/icon-grip.svg",
  ellipsis: "/plip/daily-loop/icon-ellipsis.svg",
  list: "/plip/daily-loop/icon-list.svg",
  grid: "/plip/daily-loop/icon-grid.svg",
  x: "/plip/daily-loop/icon-x.svg",
  trash: "/plip/daily-loop/icon-trash.svg",
  calendar: "/plip/daily-loop/icon-calendar.svg",
  calendarBrand: "/plip/daily-loop/icon-calendar-brand.svg",
  message: "/plip/daily-loop/icon-message.svg",
  messageBrand: "/plip/daily-loop/icon-message-brand.svg",
  arrowUp: "/plip/daily-loop/icon-arrow-up.svg",
  upload: "/plip/daily-loop/icon-upload.svg",
  search: "/plip/daily-loop/icon-search.svg",
  circleDotBrand: "/plip/daily-loop/icon-circle-dot-brand.svg",
  usersBrand: "/plip/daily-loop/icon-users-brand.svg",
  chevronLeft: "/plip/daily-loop/icon-chevron-left.svg",
  chevronRightBrand: "/plip/daily-loop/icon-chevron-right-brand.svg",
} as const;

export type DailyIconName = keyof typeof ICON_SRC;

type DailyIconProps = {
  name: DailyIconName;
  size?: number;
  className?: string;
};

export function DailyIcon({ name, size = 20, className = "" }: DailyIconProps) {
  return (
    <span
      className={`relative block shrink-0 overflow-clip ${className}`}
      style={{ width: size, height: size }}
    >
      <img src={ICON_SRC[name]} alt="" width={size} height={size} className="size-full" />
    </span>
  );
}
