import type { SupabaseClient } from '@supabase/supabase-js'
import { getPaginationRange, PAGE_SIZE } from '@/lib/utils/pagination'

export interface EventLogEntry {
  id: string
  org_id: string | null
  entity: string
  action: string
  actor_id: string | null
  payload: Record<string, unknown>
  created_at: string
}

export async function getOrgEvents(
  supabase: SupabaseClient,
  orgId: string,
  page: number,
) {
  const { count } = await supabase
    .from('event_log')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)

  const { offset, totalPages } = getPaginationRange(page, PAGE_SIZE, count ?? 0)

  const { data, error } = await supabase
    .from('event_log')
    .select('id, org_id, entity, action, actor_id, payload, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  return { data: data as EventLogEntry[] | null, error, count, totalPages }
}
