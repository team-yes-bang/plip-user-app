import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

type CapacityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  compact?: boolean;
  disabled?: boolean;
};

export function CapacityStepper({
  value,
  min = 2,
  max = 30,
  onChange,
  compact = false,
  disabled = false,
}: CapacityStepperProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  function decrease() {
    if (!canDecrease) return;
    onChange(value - 1);
  }

  function increase() {
    if (!canIncrease) return;
    onChange(value + 1);
  }

  if (compact) {
    return (
      <div className="inline-flex h-8 shrink-0 items-center rounded-full bg-[var(--dl-color-bg-brand)] p-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-7 text-white hover:bg-white/15 hover:text-white disabled:text-white/50"
          aria-label="인원 줄이기"
          disabled={!canDecrease}
          onClick={decrease}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-7 text-white hover:bg-white/15 hover:text-white disabled:text-white/50"
          aria-label="인원 늘리기"
          disabled={!canIncrease}
          onClick={increase}
        >
          <Plus />
        </Button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="인원 줄이기"
        disabled={!canDecrease}
        onClick={decrease}
      >
        <Minus />
      </Button>
      <p className={cn("m-0 min-w-10 text-center text-xl font-semibold leading-none text-[var(--dl-color-text-primary)]")}>
        {value}명
      </p>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="인원 늘리기"
        disabled={!canIncrease}
        onClick={increase}
      >
        <Plus />
      </Button>
    </div>
  );
}
