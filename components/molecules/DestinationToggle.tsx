import { TopicChip } from "@/components/molecules/TopicChip";

export type DestinationId = "diary" | "agit";

type DestinationToggleProps = {
  value: DestinationId;
  onChange: (value: DestinationId) => void;
};

const OPTIONS: { id: DestinationId; label: string }[] = [
  { id: "diary", label: "다이어리" },
  { id: "agit", label: "아지트" },
];

export function DestinationToggle({ value, onChange }: DestinationToggleProps) {
  return (
    <div className="flex flex-wrap gap-[8px]" role="tablist" aria-label="기록 목적지">
      {OPTIONS.map((option) => (
        <TopicChip
          key={option.id}
          tone="brand"
          selected={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </TopicChip>
      ))}
    </div>
  );
}
