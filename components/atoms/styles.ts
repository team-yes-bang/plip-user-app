export const ui = {
  title:
    "m-0 text-[28px] font-bold leading-[34px] text-[var(--dl-color-text-primary)]",
  titleSection: "text-[24px] leading-[35px]",
  titleComplete: "text-[28px] leading-[41px]",
  subtitle: "m-0 text-sm font-normal leading-5 text-[var(--dl-color-text-secondary)]",
  hint: "m-0 text-xs font-normal leading-5 text-[var(--dl-color-text-tertiary)]",
  eyebrow: "m-0 text-xs font-semibold leading-[17px] text-[var(--dl-color-text-brand)]",
  sectionTitle:
    "m-0 text-base font-semibold leading-[23px] text-[var(--dl-color-text-primary)]",
  link: "text-sm font-medium leading-5 text-[var(--dl-color-text-brand)] no-underline hover:underline",
  btn: "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--dl-radius-md)] px-5 py-3 text-sm font-medium leading-5 no-underline shadow-none backdrop-blur-none",
  btnPrimary:
    "border-0 bg-[var(--dl-color-bg-brand)] text-[var(--dl-color-text-inverse)]",
  btnSecondary:
    "border-0 bg-[var(--dl-color-bg-brand-subtle)] text-[var(--dl-color-text-brand)]",
  btnDanger:
    "border-0 bg-[var(--dl-color-bg-danger)] text-[var(--dl-color-text-danger)]",
  btnNeutral:
    "border-0 bg-[var(--dl-color-bg-surface)] text-[var(--dl-color-text-primary)]",
  field: "flex w-full flex-col gap-1.5",
  fieldLabel:
    "m-0 text-[13px] font-medium leading-5 text-[var(--dl-color-text-primary)]",
  input:
    "h-12 w-full rounded-[var(--dl-radius-md)] border border-[var(--dl-color-border-default)] bg-[var(--dl-color-bg-surface)] px-4 text-base leading-6 text-[var(--dl-color-text-primary)] shadow-none outline-none placeholder:text-[var(--dl-color-text-secondary)] focus:border-2 focus:border-[var(--dl-color-border-brand)]",
  glassBtn:
    "inline-flex items-center justify-center gap-2 rounded-[var(--dc-btn-radius)] border border-[var(--dc-glass-border)] bg-[linear-gradient(180deg,var(--dc-glass-from),var(--dc-glass-to))] px-4 py-1.5 text-[13px] font-medium leading-5 text-[var(--dc-fg-primary)] no-underline shadow-[var(--dc-shadow)] backdrop-blur-[20px]",
  glassBtnBlock: "w-full min-h-11",
  glass:
    "rounded-[var(--dc-radius)] border border-[var(--dc-glass-border)] bg-[linear-gradient(180deg,var(--dc-glass-from),var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px]",
  authPage:
    "min-h-0 h-full w-full bg-[var(--dl-color-bg-elevated)] font-[family-name:var(--font-inter),var(--font-sans),system-ui,sans-serif] text-[var(--dl-color-text-primary)]",
  authContent: "mx-auto flex w-full max-w-[390px] flex-col gap-4 px-5 pb-10 pt-6",
  topbar: "flex w-full items-center gap-3",
  topbarBack:
    "grid size-11 shrink-0 place-items-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-surface)] no-underline",
  topbarTitle: "m-0 text-lg font-semibold leading-[26px] text-[var(--dl-color-text-primary)]",
  topbarStep: "ml-auto text-xs font-semibold leading-[17px] text-[var(--dl-color-text-brand)]",
  topbarTrailing: "ml-auto",
  divider: "flex w-full items-center gap-2.5",
  dividerLine: "h-px flex-1 bg-[var(--dl-color-border-default)]",
  dividerLabel: "text-xs leading-[17px] text-[var(--dl-color-text-tertiary)]",
  panel:
    "w-full rounded-[var(--dl-radius-lg)] bg-[var(--dl-color-bg-elevated)] px-3.5 py-4",
  panelSubtle: "bg-[var(--dl-color-bg-brand-subtle)]",
  iconSq:
    "inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--dl-radius-md)] bg-[var(--dl-color-bg-surface)] text-[var(--dl-color-text-primary)] no-underline",
} as const;
