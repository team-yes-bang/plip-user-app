"use client";

import { Input } from "@/components/atoms";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
};

export function PasswordInput({
  id,
  name,
  placeholder,
  autoComplete,
  required,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        variant="daily"
        className="pr-11"
      />
      <button
        type="button"
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
        className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center border-0 bg-[transparent] text-[var(--dl-color-text-secondary)]"
        onClick={() => setVisible((prev) => !prev)}
      >
        {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
}
