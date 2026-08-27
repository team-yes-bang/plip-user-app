import leftoverStyles from "@/components/styles/leftover.module.css";
import { TextLink } from "@/components/atoms";
import { ScreenHeader } from "@/components/molecules";
import { ROUTES } from "@/config/routes";

export function MyPageProfileSection() {
  return (
    <section aria-label="설정 홈" className="flex flex-1 flex-col bg-[transparent] text-[var(--dc-fg-primary)]">
      <ScreenHeader
        tone="plain"
        title="설정"
        trailing={
          <TextLink href={ROUTES.mypage.settings} className="grid min-w-[1.75rem] place-items-center text-[1.15rem] font-bold !text-[#111] !no-underline" aria-label="전체 설정">
            ≡
          </TextLink>
        }
      />

      <div className="flex flex-col items-center gap-[0.65rem] p-[0.5rem_1rem_1rem]">
        <div className="relative">
          <div className="box-border w-[5.75rem] h-[5.75rem] rounded-[999px] border border-[#fff] bg-[linear-gradient(180deg,_#f3f0ff,_#e8f4ff)] shadow-[var(--dc-shadow)]" aria-hidden />
          <span className="absolute right-[0.1rem] bottom-[0.1rem] grid place-items-center w-[1.35rem] h-[1.35rem] rounded-[999px] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] border border-[#fff] text-[var(--dc-fg-primary)] font-extrabold shadow-[var(--dc-shadow)]">+</span>
        </div>
        <p className="text-[0.95rem] font-bold">@plip_user</p>
        <div className={`${leftoverStyles.plipTtProfileStats} grid w-full max-w-xs grid-cols-3 text-center`}>
          <div>
            <strong>3</strong>
            <span>아지트</span>
          </div>
          <div>
            <strong>12</strong>
            <span>클립</span>
          </div>
          <div>
            <strong>99K</strong>
            <span>포인트</span>
          </div>
        </div>
        <div className="flex gap-[0.4rem] w-full max-w-[20rem]">
          <TextLink href={ROUTES.mypage.profile} className="flex-1 rounded-[var(--dc-btn-radius)] border border-[var(--dc-glass-border)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px] p-[0.55rem_0.75rem] text-center text-[0.8125rem] font-medium !text-[var(--dc-fg-primary)] !no-underline">
            프로필 수정
          </TextLink>
        </div>
        <TextLink href={ROUTES.mypage.profile} className="text-[0.85rem] !text-[rgba(0,_0,_0,_0.55)] !no-underline">
          소개 추가
        </TextLink>
      </div>

      <div className={`${leftoverStyles.plipTtProfileTabs} mx-4 grid grid-cols-3 rounded-[var(--dc-radius)] border border-[var(--dc-glass-border)] bg-[linear-gradient(180deg,var(--dc-glass-from),var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px]`} aria-label="내 콘텐츠">
        <button type="button" className={`${leftoverStyles.isActive}`} aria-label="내 클립">
          클립
        </button>
        <button type="button" aria-label="다이어리">
          다이어리
        </button>
        <button type="button" aria-label="저장">
          저장
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-[0.9rem] p-[2rem_1.5rem] text-center text-[rgba(0,_0,_0,_0.55)]">
        <p>최근 찍은 클립을 모아보세요.</p>
        <TextLink href={ROUTES.create} className="rounded-[var(--dc-btn-radius)] border border-[var(--dc-glass-border)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px] p-[0.55rem_1.4rem] text-[0.8125rem] font-medium !text-[var(--dc-fg-primary)] !no-underline">
          촬영하기
        </TextLink>
      </div>

      <div className="flex flex-col gap-[0.35rem] p-[0.75rem_1rem_1.25rem] [&_a]:rounded-[var(--dc-radius)] [&_a]:border [&_a]:border-[var(--dc-glass-border)] [&_a]:bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] [&_a]:shadow-[var(--dc-shadow)] [&_a]:backdrop-blur-[20px] [&_a]:p-[0.75rem_0.9rem] [&_a]:text-[0.875rem] [&_a]:font-medium [&_a]:!text-[var(--dc-fg-primary)] [&_a]:!no-underline">
        <TextLink href={ROUTES.shop.root}>상점 · 포인트</TextLink>
        <TextLink href={ROUTES.shop.myItems}>내 아이템</TextLink>
        <TextLink href={ROUTES.notifications}>알림</TextLink>
        <TextLink href={ROUTES.mypage.settings}>설정 및 개인정보</TextLink>
      </div>
    </section>
  );
}

export function MyPagePointsSection() {
  return (
    <section className={`${leftoverStyles.plipTtSettings} flex flex-col gap-0.5 bg-transparent p-4 text-[var(--dc-fg-primary)]`} aria-label="포인트">
      <h1>포인트</h1>
      <TextLink href={ROUTES.shop.points} className="flex items-center justify-between mb-[0.5rem] border border-[var(--dc-glass-border)] rounded-[var(--dc-radius)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px] p-[0.85rem_0.95rem] !text-[var(--dc-fg-primary)] !no-underline text-[0.875rem]">
        <span>포인트 로그</span>
        <span aria-hidden>›</span>
      </TextLink>
      <TextLink href={ROUTES.shop.charge} className="flex items-center justify-between mb-[0.5rem] border border-[var(--dc-glass-border)] rounded-[var(--dc-radius)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px] p-[0.85rem_0.95rem] !text-[var(--dc-fg-primary)] !no-underline text-[0.875rem]">
        <span>충전</span>
        <span aria-hidden>›</span>
      </TextLink>
    </section>
  );
}

export function MyPageMenuSection() {
  return (
    <section className={`${leftoverStyles.plipTtSettings} flex flex-col gap-0.5 bg-transparent p-4 text-[var(--dc-fg-primary)]`} aria-label="메뉴">
      <h1>메뉴</h1>
      <TextLink href={ROUTES.mypage.settings} className="flex items-center justify-between mb-[0.5rem] border border-[var(--dc-glass-border)] rounded-[var(--dc-radius)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px] p-[0.85rem_0.95rem] !text-[var(--dc-fg-primary)] !no-underline text-[0.875rem]">
        <span>설정</span>
        <span aria-hidden>›</span>
      </TextLink>
      <TextLink href={ROUTES.shop.root} className="flex items-center justify-between mb-[0.5rem] border border-[var(--dc-glass-border)] rounded-[var(--dc-radius)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px] p-[0.85rem_0.95rem] !text-[var(--dc-fg-primary)] !no-underline text-[0.875rem]">
        <span>상점</span>
        <span aria-hidden>›</span>
      </TextLink>
    </section>
  );
}

export function MyPageWithdrawSection() {
  return (
    <section className={`${leftoverStyles.plipTtSettings} flex flex-col gap-0.5 bg-transparent p-4 text-[var(--dc-fg-primary)]`} aria-label="탈퇴">
      <h1>계정 탈퇴</h1>
      <p className="px-4 text-sm text-black/50">탈퇴 시 아지트·클립 데이터가 삭제될 수 있습니다.</p>
    </section>
  );
}

export function MyPageSettingsSection() {
  return (
    <section className={`${leftoverStyles.plipTtSettings} flex flex-col gap-0.5 bg-transparent p-4 text-[var(--dc-fg-primary)]`} aria-label="설정">
      <h1>설정 및 개인정보</h1>
      {[
        { href: ROUTES.notifications, label: "알림" },
        { href: ROUTES.mypage.password, label: "비밀번호" },
        { href: ROUTES.mypage.profile, label: "계정" },
        { href: ROUTES.shop.root, label: "상점 · 포인트" },
        { href: ROUTES.shop.refund, label: "환불" },
        { href: ROUTES.shop.points, label: "포인트 로그" },
      ].map((item) => (
        <TextLink key={item.href} href={item.href} className="flex items-center justify-between mb-[0.5rem] border border-[var(--dc-glass-border)] rounded-[var(--dc-radius)] bg-[linear-gradient(180deg,_var(--dc-glass-from),_var(--dc-glass-to))] shadow-[var(--dc-shadow)] backdrop-blur-[20px] p-[0.85rem_0.95rem] !text-[var(--dc-fg-primary)] !no-underline text-[0.875rem]">
          <span>{item.label}</span>
          <span aria-hidden>›</span>
        </TextLink>
      ))}
    </section>
  );
}
