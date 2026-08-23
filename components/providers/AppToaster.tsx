"use client";

import { Toaster } from "@/components/ui/toast";
import type { ReactNode } from "react";

type AppToasterProps = {
  children: ReactNode;
};

/** 토스트는 포털 없이 쉘 안에서 띄운다. body로 나가면 데스크탑 프레임 밖에 붙는다. */
export function AppToaster({ children }: AppToasterProps) {
  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <Toaster>{children}</Toaster>
    </div>
  );
}
