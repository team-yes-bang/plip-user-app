type Listener = () => void;

const overrides = new Map<string, number>();
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeAgitChatUnread(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAgitChatUnreadSnapshot(agitId: string, fallback: number): number {
  return overrides.get(agitId.trim().toLowerCase()) ?? fallback;
}

export function setAgitChatUnread(agitId: string, count: number): void {
  overrides.set(agitId.trim().toLowerCase(), Math.max(0, count));
  emit();
}

export function incrementAgitChatUnread(agitId: string, fallback: number): void {
  const normalizedAgitId = agitId.trim().toLowerCase();
  const current = getAgitChatUnreadSnapshot(normalizedAgitId, fallback);
  overrides.set(normalizedAgitId, current + 1);
  emit();
}
