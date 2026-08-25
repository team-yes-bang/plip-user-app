type SystemMessageRowProps = {
  content: string;
};

export function SystemMessageRow({ content }: SystemMessageRowProps) {
  return (
    <p className="m-[8px_0] text-center text-xs font-medium text-[var(--dl-color-text-tertiary)]">
      {content}
    </p>
  );
}
