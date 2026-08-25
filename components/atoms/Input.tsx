import { ui } from "@/components/atoms/styles";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input"> & {
  variant?: "daily" | "glass";
};

export function Input({ className = "", variant = "daily", ...props }: InputProps) {
  const base =
    variant === "glass"
      ? cn(ui.glass, "h-10 w-full px-3 text-sm outline-none sm:h-11 sm:text-base")
      : ui.input;

  return <input className={cn(base, className)} {...props} />;
}
