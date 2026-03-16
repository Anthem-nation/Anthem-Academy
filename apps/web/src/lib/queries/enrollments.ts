import type { SupabaseClient } from '@supabase/supabase-js'

export interface PendingEnrollmentRow {
  id: string
  cohort_id: string
  enrolled_at: string
  enrollment_data: Record<string, unknown>
  person: { id: string; email: string; full_name: string | null }
  cohort: {
    id: string
    name: string
    program_id: string
    capacity: number | null
    program: { id: string; name: string }
  }
}

export async function getOrgPendingEnrollments(
  supabase: SupabaseClient,
  orgId: string,
): Promise<{ data: PendingEnrollmentRow[] | null; error: unknown }> {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id, cohort_id, enrolled_at, enrollment_data,
      person:persons(id, email, full_name),
      cohort:cohorts(id, name, program_id, capacity,
        program:programs(id, name)
      )
    `)
    .eq('org_id', orgId)
    .eq('status', 'pending')
    .order('enrolled_at')

  if (error) return { data: null, error }
  return { data: (data ?? []) as unknown as PendingEnrollmentRow[], error: null }
}
