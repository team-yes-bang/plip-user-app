import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentProps } from "react";

type TextLinkProps = ComponentProps<typeof Link>;

export function TextLink({ className = "", children, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(
        "text-sm text-zinc-600",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
