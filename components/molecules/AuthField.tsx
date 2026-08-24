import { Input, Label } from "@/components/atoms";
import { ui } from "@/components/atoms/styles";
import type { ComponentProps } from "react";

type AuthFieldProps = {
  id: string;
  name: string;
  label: string;
  hint?: string;
  type?: ComponentProps<typeof Input>["type"];
  placeholder?: string;
  autoComplete?: string;
  inputMode?: ComponentProps<typeof Input>["inputMode"];
  required?: boolean;
  defaultValue?: string;
  maxLength?: number;
  pattern?: string;
  title?: string;
};

export function AuthField({
  id,
  name,
  label,
  hint,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  required,
  defaultValue,
  maxLength,
  pattern,
  title,
}: AuthFieldProps) {
  return (
    <div className={ui.field}>
      <Label htmlFor={id} className={ui.fieldLabel}>
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        defaultValue={defaultValue}
        maxLength={maxLength}
        pattern={pattern}
        title={title}
        variant="daily"
      />
      {hint ? <p className={ui.hint}>{hint}</p> : null}
    </div>
  );
}
