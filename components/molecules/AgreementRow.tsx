"use client";

import { Checkbox } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { useState } from "react";

const CHECKBOX_OFF_SRC = "/plip/daily-loop/checkbox-off.svg";
const CHECKBOX_ON_SRC = "/plip/daily-loop/checkbox-on.svg";

type AgreementRowProps = {
  id: string;
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  requiredMark?: boolean;
  muted?: boolean;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

export function AgreementRow({
  id,
  name,
  label,
  description,
  required,
  requiredMark,
  muted,
  defaultChecked,
  checked,
  onChange,
}: AgreementRowProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const isChecked = checked ?? internalChecked;

  return (
    <label htmlFor={id} className="flex w-full items-center gap-[9px]">
      <Checkbox
        id={id}
        name={name}
        required={required}
        checked={isChecked}
        onChange={(event) => {
          const next = event.target.checked;
          if (checked === undefined) {
            setInternalChecked(next);
          }
          onChange?.(next);
        }}
        className="sr-only size-px overflow-hidden"
      />
      <span className="relative block size-[18px] shrink-0 overflow-clip" aria-hidden>
        <img
          src={isChecked ? CHECKBOX_ON_SRC : CHECKBOX_OFF_SRC}
          alt=""
          width={18}
          height={18}
          className="size-full"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "text-sm leading-5",
            muted
              ? "font-normal text-[var(--dl-color-text-secondary)]"
              : "font-medium text-[var(--dl-color-text-primary)]"
          )}
        >
          {label}
          {requiredMark ? (
            <span className="ml-0.5 text-red-600" aria-hidden>
              *
            </span>
          ) : null}
        </span>
        {description ? (
          <span className="text-xs leading-[17px] text-[var(--dl-color-text-secondary)]">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
