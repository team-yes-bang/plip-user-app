import { OverlayPortalProvider } from "@/components/molecules/AnimatedOverlays";
import leftoverStyles from "@/components/styles/leftover.module.css";
import type { ReactNode } from "react";

type MobileDeviceFrameProps = {
  children: ReactNode;
};

/**
 * 모바일: 크롬 없이 풀스크린.
 * PC: 얇은 프레임 + 상태바. 헤더/하단 탭을 가리지 않습니다.
 */
export function MobileDeviceFrame({ children }: MobileDeviceFrameProps) {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden md:items-center md:justify-center md:p-[2rem_1.5rem] md:bg-[#ececf1]">
      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden md:h-[min(874px,_calc(100dvh_-_2.5rem))] md:w-[min(402px,_calc(100vw_-_2rem))] md:flex-none md:p-[2px] md:rounded-[16px] md:bg-[var(--dl-color-border-default)] md:shadow-[0_12px_40px_rgba(23,_23,_28,_0.16)]">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:rounded-[14px] md:bg-[var(--dl-color-bg-elevated)] md:[transform:translateZ(0)]">
          <OverlayPortalProvider>
            <div className="hidden md:flex md:h-[32px] md:shrink-0 md:items-center md:justify-between md:p-[0_22px] md:text-[11px] md:font-semibold md:text-[var(--dl-color-text-primary)] md:[&_span:last-child]:text-[10px] md:[&_span:last-child]:font-medium md:[&_span:last-child]:text-[var(--dl-color-text-secondary)] md:[&_span:last-child]:tracking-[0.02em]" aria-hidden>
              <span>9:41</span>
              <span>●●●  100%</span>
            </div>
            <div className={`${leftoverStyles.plipDeviceApp} flex min-h-0 flex-1 flex-col overflow-hidden`}>
              {children}
            </div>
          </OverlayPortalProvider>
        </div>
      </div>
    </div>
  );
}
