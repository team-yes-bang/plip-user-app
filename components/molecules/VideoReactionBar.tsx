"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type ReactionItem = {
  id: string;
  emoji: string;
  count: number;
};

const INITIAL_REACTIONS: ReactionItem[] = [
  { id: "fire", emoji: "🔥", count: 12 },
  { id: "heart", emoji: "💜", count: 8 },
  { id: "clap", emoji: "👏", count: 5 },
];

type VideoReactionBarProps = {
  className?: string;
};

export function VideoReactionBar({ className = "" }: VideoReactionBarProps) {
  const [reactions, setReactions] = useState(INITIAL_REACTIONS);
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());

  const handleToggleReaction = (id: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      const isReacted = next.has(id);
      if (isReacted) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    setReactions((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const isReacted = activeIds.has(id);
        return { ...item, count: isReacted ? item.count - 1 : item.count + 1 };
      })
    );
  };

  const handleAddMore = () => {
    // ＋ 클릭 피드백
  };

  return (
    <div
      className={cn(
        "pointer-events-auto absolute right-5 bottom-32 z-20 flex flex-col gap-3 rounded-2xl bg-black/30 p-3 text-white text-xs font-medium backdrop-blur-md select-none",
        className
      )}
      aria-label="이모지 리액션"
    >
      {reactions.map((item) => {
        const isActive = activeIds.has(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleToggleReaction(item.id)}
            className={cn(
              "flex items-center gap-1 transition-transform active:scale-110",
              isActive ? "font-bold text-yellow-300" : "text-white"
            )}
          >
            <span>{item.emoji}</span>
            <span>{item.count}</span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={handleAddMore}
        className="flex items-center justify-center text-white/80 hover:text-white transition-colors"
        aria-label="이모지 추가"
      >
        ＋
      </button>
    </div>
  );
}
