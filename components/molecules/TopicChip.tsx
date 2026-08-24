type TopicChipProps = {
  children: string;
  selected?: boolean;
  /** destination toggle — selected chip uses solid brand purple */
  tone?: "default" | "brand";
  onClick?: () => void;
};

export function TopicChip({
  children,
  selected = false,
  tone = "default",
  onClick,
}: TopicChipProps) {
  const base =
    "inline-flex min-h-[29px] items-center rounded-[16px] border-0 p-[7px_12px] text-xs font-medium leading-[15px]";

  const className = selected
    ? tone === "brand"
      ? `${base} bg-[var(--dl-color-bg-brand)] text-[var(--dl-color-text-inverse)]`
      : `${base} bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)] m-dlTopicChipActive`
    : `${base} bg-[var(--dl-color-bg-surface)] text-[var(--dl-color-text-secondary)]`;

  return (
    <button type="button" className={className} aria-pressed={selected} onClick={onClick}>
      {children}
    </button>
  );
}
