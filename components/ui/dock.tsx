"use client";

import { cn } from "@/lib/utils";
import { LayoutGroup, motion } from "framer-motion";
import React, { createContext, useContext, useId, useState } from "react";

type DockContextType = {
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  activeLayoutId: string;
  hoverLayoutId: string;
};

const DockContext = createContext<DockContextType | null>(null);

function useDockContext() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error("DockItem and DockSeparator must be used within a Dock");
  }
  return context;
}

export type DockProps = {
  children: React.ReactNode;
  className?: string;
};

export function Dock({ children, className }: DockProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const rawId = useId();
  const activeLayoutId = `dock-active-${rawId}`;
  const hoverLayoutId = `dock-hover-${rawId}`;

  return (
    <DockContext.Provider
      value={{
        hoveredId,
        setHoveredId,
        activeLayoutId,
        hoverLayoutId,
      }}
    >
      <LayoutGroup>
        <nav
          className={cn(
            "relative flex items-center justify-center gap-1 rounded-full border border-border/40 bg-background/80 p-1.5 shadow-lg backdrop-blur-md transition-all",
            className
          )}
          onMouseLeave={() => setHoveredId(null)}
          role="toolbar"
        >
          {children}
        </nav>
      </LayoutGroup>
    </DockContext.Provider>
  );
}

export type DockItemProps = {
  id?: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

export function DockItem({
  id: explicitId,
  active = false,
  onClick,
  children,
  className,
  "aria-label": ariaLabel,
}: DockItemProps) {
  const internalId = useId();
  const itemId = explicitId || internalId;
  const { hoveredId, setHoveredId, activeLayoutId, hoverLayoutId } = useDockContext();

  const isHovered = hoveredId === itemId;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHoveredId(itemId)}
      onFocus={() => setHoveredId(itemId)}
      aria-label={ariaLabel}
      className={cn(
        "relative flex size-10 cursor-pointer items-center justify-center rounded-full text-foreground/70 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        active && "text-primary font-semibold",
        className
      )}
    >
      {/* 1. Active Indicator (Primary Active Sliding Background) */}
      {active && (
        <motion.div
          layoutId={activeLayoutId}
          className="absolute inset-0 z-0 rounded-full bg-primary/15 shadow-xs border border-primary/20"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
      )}

      {/* 2. Hover Indicator (Secondary Hover Track Sliding Background) */}
      {isHovered && !active && (
        <motion.div
          layoutId={hoverLayoutId}
          className="absolute inset-0 z-0 rounded-full bg-muted/70"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
      )}

      {/* Item Icon / Content */}
      <span className="relative z-10 flex items-center justify-center pointer-events-none">
        {children}
      </span>
    </button>
  );
}

export function DockSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn("mx-1 h-5 w-px shrink-0 bg-border/60", className)}
      role="separator"
    />
  );
}
