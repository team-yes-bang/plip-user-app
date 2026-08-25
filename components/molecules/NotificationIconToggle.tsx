"use client";

import { Bell, BellOff } from "lucide-react";

type NotificationIconToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  size?: number;
};

export function NotificationIconToggle({
  checked,
  onChange,
  label,
  size = 20,
}: NotificationIconToggleProps) {
  const Icon = checked ? Bell : BellOff;

  return (
    <button
      type="button"
      className="grid size-11 shrink-0 place-items-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-surface)]"
      aria-label={label}
      aria-pressed={checked}
      title={checked ? `${label} 끄기` : `${label} 켜기`}
      onClick={() => onChange(!checked)}
    >
      <Icon
        className="text-[var(--dl-color-text-primary)]"
        size={size}
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}
