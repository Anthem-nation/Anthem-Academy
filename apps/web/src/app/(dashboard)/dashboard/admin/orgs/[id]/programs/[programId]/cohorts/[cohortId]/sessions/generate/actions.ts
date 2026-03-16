'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { GeneratedSession } from '@/lib/utils/session-generator'

const SessionItemSchema = z.object({
  title: z.string().min(1),
  starts_at: z.string(),
  ends_at: z.string(),
  location: z.string().nullable(),
})

export async function generateSessions(
  cohortId: string,
  programId: string,
  orgId: string,
  sessions: GeneratedSession[],
): Promise<ApiResponse<{ count: number }>> {
  if (sessions.length === 0) return { data: null, error: 'No sessions to create.' }

  const parsed = z.array(SessionItemSchema).safeParse(sessions)
  if (!parsed.success) return { data: null, error: 'Invalid session data.' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_generate_sessions', {
    p_cohort_id:  cohortId,
    p_program_id: programId,
    p_org_id:     orgId,
    p_sessions:   parsed.data,
  })

  if (error) {
    if (error.code === '42501') return { data: null, error: 'Permission denied.' }
    if (error.code === 'P0002') return { data: null, error: 'Cohort not found.' }
    return { data: null, error: error.message }
  }

  revalidatePath(`/dashboard/admin/orgs/${orgId}/programs/${programId}/cohorts/${cohortId}/sessions`)
  redirect(`/dashboard/admin/orgs/${orgId}/programs/${programId}/cohorts/${cohortId}/sessions`)
}
