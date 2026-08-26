"use client";

import { leaveAgitAction, reissueInviteCodeAction } from "@/actions/agitActions";
import { listTopicsByStatusAction } from "@/actions/topicActions";
import { DailyIcon, IconButton, Separator, TextLink } from "@/components/atoms";
import { ConfirmModal } from "@/components/molecules";
import { AnimatedSideSheet } from "@/components/molecules/AnimatedOverlays";
import { MenuNavRow, SideSheetHeader } from "@/components/molecules/SideSheetMenu";
import { ROUTES } from "@/config/routes";
import { toast } from "@/components/ui/toast";
import { copyText } from "@/lib/copyText";
import type { UiAgit } from "@/types/agit/ui";
import type { UiTopicListItem } from "@/types/topic/ui";
import { Check, Copy, Link2, LogOut, Plus, Settings, UserRoundCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AgitMenuDrawerProps = {
  agit: UiAgit;
  open: boolean;
  onClose: () => void;
};

const MENU = [
  {
    id: "topics" as const,
    label: "토픽",
    href: (id: string) => ROUTES.agit.topics(id),
    hostOnly: false,
  },
  { id: "chat" as const, label: "채팅", href: (id: string) => ROUTES.agit.chat(id), hostOnly: false },
  {
    id: "members" as const,
    label: "멤버리스트",
    href: (id: string) => ROUTES.agit.members(id),
    hostOnly: false,
  },
  {
    id: "profile" as const,
    label: "내프로필관리",
    href: (id: string) => ROUTES.agit.profileEdit(id),
    hostOnly: false,
  },
  {
    id: "manage" as const,
    label: "아지트관리",
    href: (id: string) => ROUTES.agit.manage(id),
    hostOnly: true,
  },
];

function MenuItemIcon({ id }: { id: (typeof MENU)[number]["id"] }) {
  if (id === "topics") {
    return <DailyIcon name="list" size={24} className="brightness-0 saturate-100 [filter:invert(32%)_sepia(98%)_saturate(1142%)_hue-rotate(231deg)_brightness(94%)_contrast(99%)]" />;
  }
  if (id === "chat") {
    return <DailyIcon name="messageBrand" size={24} />;
  }
  if (id === "members") {
    return <DailyIcon name="usersBrand" size={24} />;
  }
  if (id === "profile") {
    return <UserRoundCog className="size-6 shrink-0 text-[var(--dl-color-text-brand)]" strokeWidth={2} />;
  }
  return <Settings className="size-6 shrink-0 text-[var(--dl-color-text-brand)]" strokeWidth={2} />;
}

export function AgitMenuDrawer({ agit, open, onClose }: AgitMenuDrawerProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [reissuing, setReissuing] = useState(false);
  const [ongoingTopics, setOngoingTopics] = useState<UiTopicListItem[]>([]);
  const [reissuedCode, setReissuedCode] = useState<{ agitId: string; code: string } | null>(null);
  const isHost = agit.myRole === "HOST";
  const menuItems = MENU.filter((item) => !item.hostOnly || isHost);
  const inviteCode =
    (reissuedCode?.agitId === agit.id ? reissuedCode.code : agit.inviteCode)?.trim() ?? "";

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listTopicsByStatusAction(agit.id, "ONGOING", 3).then((result) => {
      if (cancelled) return;
      setOngoingTopics(result.ok ? result.data : []);
    });
    return () => {
      cancelled = true;
    };
  }, [open, agit.id]);

  async function copyInviteCode() {
    if (!inviteCode) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const joinUrl = `${origin}${ROUTES.agit.join(inviteCode)}`;
    const ok = await copyText(joinUrl);
    setCopied(ok);
    if (ok) {
      toast.add({ type: "success", title: "초대 링크가 복사되었습니다" });
    }
  }

  async function reissueInviteCode() {
    if (reissuing || !isHost) return;
    setReissuing(true);
    const result = await reissueInviteCodeAction(agit.id);
    setReissuing(false);
    if (!result.ok) {
      toast.add({
        type: "error",
        title: "초대코드를 재설정하지 못했습니다",
        description: result.error,
      });
      return;
    }
    setReissuedCode({ agitId: agit.id, code: result.data });
    setCopied(false);
    toast.add({ type: "success", title: "초대코드를 재설정했습니다" });
    router.refresh();
  }

  function handleClose() {
    setConfirmLeave(false);
    onClose();
  }

  async function handleLeave() {
    if (leaving) return;
    setLeaving(true);
    const result = await leaveAgitAction(agit.id);
    if (!result.ok) {
      toast.add({
        type: "error",
        title: "아지트를 나가지 못했습니다",
        description: result.error,
      });
      setLeaving(false);
      return;
    }
    handleClose();
    toast.add({
      type: "success",
      title: "아지트에서 나갔습니다",
    });
    router.push(ROUTES.agit.root);
  }

  return (
    <>
      <AnimatedSideSheet
        open={open}
        onClose={handleClose}
        aria-label="아지트 메뉴"
      >
        <SideSheetHeader title={agit.name} onClose={handleClose} />

        <div className="flex h-8 w-full shrink-0 overflow-hidden rounded-[10px] border border-[#e3e0ed] bg-[#fff]">
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 bg-transparent px-2.5 text-left disabled:cursor-default"
            onClick={copyInviteCode}
            disabled={!inviteCode}
            aria-label="초대 URL 복사"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Link2 className="size-3.5 shrink-0 text-[#262433]" strokeWidth={2} />
              <p className="m-0 overflow-hidden text-xs font-medium tracking-[0.04em] text-[#262433] whitespace-nowrap [text-overflow:ellipsis]">
                {inviteCode || "초대코드"}
              </p>
            </div>
            {copied ? (
              <Check className="size-3.5 shrink-0 text-[var(--dl-color-text-brand)]" strokeWidth={2} aria-hidden />
            ) : (
              <Copy className="size-3.5 shrink-0 text-[var(--dl-color-text-brand)]" strokeWidth={2} aria-hidden />
            )}
            <span className="sr-only">{copied ? "복사됨" : "복사"}</span>
          </button>
          {isHost ? (
            <button
              type="button"
              className="flex h-full shrink-0 w-14 items-center justify-center border-l border-[#e3e0ed] px-2.5 text-xs  font-semibold text-[var(--dl-color-text-brand)] bg-[var(--dl-color-bg-brand-subtle)] disabled:opacity-50"
              onClick={reissueInviteCode}
              disabled={reissuing}
            >
              {reissuing ? "..." : "재설정"}
            </button>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          <div className="flex flex-col gap-2" aria-label="진행중인 토픽">
            <div className="flex min-h-[32px] items-center justify-between gap-2 px-1">
              <span className="inline-flex items-center rounded-full bg-[var(--dl-color-bg-brand-subtle)] px-2 py-0.5 text-xs font-bold text-[var(--dl-color-text-brand)]">
                진행중 토픽
              </span>
              <div className="flex items-center gap-1.5">
              </div>
              <div className="flex items-center gap-2">
                <TextLink
                  href={ROUTES.agit.topicCreate(agit.id)}
                  className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--dl-color-bg-surface-subtle)] text-[var(--dl-color-text-brand)] hover:bg-[var(--dl-color-bg-brand-subtle)] transition-colors !no-underline"
                  onClick={handleClose}
                  aria-label="새 토픽 만들기"
                >
                  <Plus className="size-3.5 stroke-[2.5]" />
                </TextLink>
                <TextLink
                  href={ROUTES.agit.topics(agit.id)}
                  className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--dl-color-bg-surface-subtle)] text-[var(--dl-color-text-secondary)] hover:bg-[var(--dl-color-bg-brand-subtle)] hover:text-[var(--dl-color-text-brand)] transition-colors !no-underline"
                  onClick={handleClose}
                  aria-label="토픽 목록 더보기"
                >
                  <DailyIcon name="ellipsis" size={14} />
                </TextLink>
              </div>
            </div>

            {ongoingTopics.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#e3e0ed] bg-[#fbfaff] p-3 text-center">
                <p className="m-0 text-xs font-medium text-[#756e8a]">진행 중인 토픽이 없어요</p>
              </div>
            ) : (
              <div className="flex flex-col overflow-hidden rounded-xl border border-[#e3e0ed] bg-white divide-y divide-[#f0f0f5]">
                {ongoingTopics.map((topic) => {
                  const needsUpload = !topic.uploadedByMe;

                  return (
                    <TextLink
                      key={topic.id}
                      href={ROUTES.agit.topicFeed(agit.id, topic.id)}
                      className="group flex items-center justify-between gap-2 p-2.5 transition-all hover:bg-[var(--dl-color-bg-brand-subtle)] cursor-pointer !no-underline"
                      onClick={handleClose}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {/* Status Ping 애니메이션 (내가 아직 업로드하지 않은 경우 - 테마 컬러 적용 & 고정 위치 보장) */}
                        <div className="relative flex size-2 shrink-0 items-center justify-center">
                          {needsUpload ? (
                            <>
                              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--dl-color-text-brand)] opacity-75" />
                              <span className="relative inline-flex size-2 rounded-full bg-[var(--dl-color-text-brand)]" />
                            </>
                          ) : (
                            <span className="size-2 rounded-full bg-gray-300" title="기록 완료" />
                          )}
                        </div>
                        <span className="min-w-0 overflow-hidden text-xs font-semibold text-[#262433] whitespace-nowrap [text-overflow:ellipsis] group-hover:text-[var(--dl-color-text-brand)]">
                          {topic.title || "제목 없음"}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[var(--dl-color-text-secondary)]">
                        {topic.videoCount}/{agit.memberCount ?? 1}
                      </span>
                    </TextLink>
                  );
                })}
              </div>
            )}
          </div>

          <Separator className="!m-1 !border-[#e3e0ed]" />

          {menuItems.map((item) => (
            <MenuNavRow key={item.id} href={item.href(agit.id)} onClick={handleClose}>
              <MenuItemIcon id={item.id} />
              {item.label}
            </MenuNavRow>
          ))}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <IconButton
            variant="surface"
            label="아지트 나가기"
            className="cursor-pointer border border-[#e3e0ed] bg-[#fff] disabled:opacity-50"
            disabled={leaving}
            onClick={() => setConfirmLeave(true)}
          >
            <LogOut className="size-5 text-[#d84545]" strokeWidth={2} />
          </IconButton>
        </div>
      </AnimatedSideSheet>

      <ConfirmModal
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={handleLeave}
        title="아지트에서 나가시겠어요?"
        description="나가면 목록에서 이 아지트가 사라집니다."
        confirmLabel="나가기"
        cancelLabel="취소"
        tone="danger"
        loading={leaving}
      />
    </>
  );
}

