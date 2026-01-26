import type { ChatResponse } from '@/types/chat'

export function extractPendingId(msg: ChatResponse): string | null {
  if ('pending_id' in msg) return msg.pending_id ?? null
  return null
}
