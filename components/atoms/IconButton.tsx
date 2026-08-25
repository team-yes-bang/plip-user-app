import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { ui } from "./styles";
import { TextLink } from "./TextLink";

const SURFACE_CLASS = cn(ui.topbarBack, "border-0 cursor-pointer text-[var(--dl-color-text-primary)]");


type IconButtonProps = ComponentProps<"button"> & {
  label: string;
  children?: ReactNode;
  variant?: "default" | "surface";
};

export function IconButton({
  label,
  children,
  className = "",
  type = "button",
  variant = "default",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        variant === "surface"
          ? SURFACE_CLASS
          : "inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-zinc-200 text-zinc-600 sm:size-9 dark:border-zinc-700 dark:text-zinc-300",

        className,
      )}
      {...props}
    >
      {children ?? (
        <span aria-hidden className="text-xs">
          ···
        </span>
      )}
    </button>
  );
}

type IconLinkProps = ComponentProps<typeof TextLink> & {
  label: string;
};

export function IconLink({ label, className, children, ...props }: IconLinkProps) {
  return (
    <TextLink aria-label={label} className={cn(SURFACE_CLASS, className)} {...props}>
      {children}
    </TextLink>
  );
}
