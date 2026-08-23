import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

const PILL_CLASS =
  "inline-flex items-center border border-[var(--dl-color-border-default)] rounded-[18px] bg-[var(--dl-color-bg-surface)] p-[8px_14px] text-[13px] font-medium leading-[19px] text-[var(--dl-color-text-secondary)]";

const PILL_SELECTED_CLASS =
  "border-[var(--dl-color-border-brand)] bg-[var(--dl-color-bg-brand)] text-[#fff] m-dlPillBrand";

type PillShared = {
  children: ReactNode;
  selected?: boolean;
  className?: string;
};

type PillButtonProps = PillShared &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    as?: "button";
  };

type PillSpanProps = PillShared &
  Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> & {
    as: "span";
  };

export type PillProps = PillButtonProps | PillSpanProps;

export function Pill(props: PillProps) {
  const { children, selected = false, className = "", as = "button", ...rest } = props;
  const classes = `${PILL_CLASS} ${selected ? PILL_SELECTED_CLASS : ""} ${className}`.trim();

  if (as === "span") {
    return (
      <span className={classes} {...(rest as HTMLAttributes<HTMLSpanElement>)}>
        {children}
      </span>
    );
  }

  const { type = "button", ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
