import { ui } from "@/components/atoms/styles";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type SubmitButtonProps = ComponentProps<"button"> & {
  variant?: "glass" | "brand" | "outline" | "brandOutline" | "danger";
};

const variantClass: Record<NonNullable<SubmitButtonProps["variant"]>, string> = {
  glass: cn(ui.glassBtn, ui.glassBtnBlock),
  brand: cn(ui.btn, ui.btnPrimary),
  outline: cn(ui.btn, ui.btnSecondary),
  brandOutline: cn(
    ui.btn,
    "border border-[var(--dl-color-border-brand)] bg-[var(--dl-color-bg-surface)] text-[var(--dl-color-text-brand)]",
  ),
  danger: cn(ui.btn, ui.btnDanger),
};

export function SubmitButton({
  className = "",
  type = "submit",
  variant = "glass",
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      className={cn(variantClass[variant], "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    >
      {children}
    </button>
  );
}
