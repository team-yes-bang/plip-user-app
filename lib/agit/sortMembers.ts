import type { ApiAgitDetailMember } from "@/types/agit/api";

export function sortAgitMembers(
  members: ApiAgitDetailMember[],
  currentUserUuid?: string,
): ApiAgitDetailMember[] {
  return [...members].sort((a, b) => {
    const rank = (member: ApiAgitDetailMember) => {
      if (member.role === "HOST") return 0;
      if (currentUserUuid && member.userUuid === currentUserUuid) return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });
}
