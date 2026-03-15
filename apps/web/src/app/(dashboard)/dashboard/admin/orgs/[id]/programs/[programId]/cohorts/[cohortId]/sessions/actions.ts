'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse, SessionStatus } from '@/types'

// ─── Zod schema ───────────────────────────────────────────────────────────────

const SESSION_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const satisfies readonly SessionStatus[]

const SessionSchema = z.object({
  title:     z.string().min(2, 'Title must be at least 2 characters'),
  starts_at: z.string().min(1, 'Start time is required'),
  ends_at:   z.string().min(1, 'End time is required'),
  location:  z.string().optional().nullable(),
  notes:     z.string().optional().nullable(),
  status:    z.enum(SESSION_STATUSES, { message: 'Invalid status' }).default('scheduled'),
})

function parseFormData(formData: FormData) {
  return {
    title:     formData.get('title') as string,
    starts_at: formData.get('starts_at') as string,
    ends_at:   formData.get('ends_at') as string,
    location:  (formData.get('location') as string) || null,
    notes:     (formData.get('notes') as string) || null,
    status:    (formData.get('status') as string) || 'scheduled',
  }
}

function mapError(code: string): string | null {
  if (code === '42501') return 'You do not have permission to manage sessions.'
  if (code === '22023') return 'End time must be after start time.'
  return null
}

// ─── createSession ────────────────────────────────────────────────────────────

export async function createSession(
  cohortId: string,
  programId: string,
  orgId: string,
  formData: FormData
): Promise<ApiResponse<{ sessionId: string }>> {
  const parsed = SessionSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_create_session', {
    p_cohort_id:  cohortId,
    p_program_id: programId,
    p_org_id:     orgId,
    p_title:      parsed.data.title,
    p_starts_at:  parsed.data.starts_at,
    p_ends_at:    parsed.data.ends_at,
    p_location:   parsed.data.location ?? null,
    p_notes:      parsed.data.notes ?? null,
  })

  if (error) {
    return { data: null, error: mapError(error.code) ?? error.message }
  }

  redirect(`/dashboard/admin/orgs/${orgId}/programs/${programId}/cohorts/${cohortId}/sessions/${data}`)
}

// ─── updateSession ────────────────────────────────────────────────────────────

export async function updateSession(
  sessionId: string,
  orgId: string,
  cohortId: string,
  programId: string,
  formData: FormData
): Promise<ApiResponse<null>> {
  const parsed = SessionSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_update_session', {
    p_id:        sessionId,
    p_title:     parsed.data.title,
    p_starts_at: parsed.data.starts_at,
    p_ends_at:   parsed.data.ends_at,
    p_location:  parsed.data.location ?? null,
    p_notes:     parsed.data.notes ?? null,
    p_status:    parsed.data.status,
  })

  if (error) {
    if (error.code === 'P0002') return { data: null, error: 'Session not found.' }
    return { data: null, error: mapError(error.code) ?? error.message }
  }

  revalidatePath(`/dashboard/admin/orgs/${orgId}/programs/${programId}/cohorts/${cohortId}/sessions/${sessionId}`)
  return { data: null, error: null }
}

// ─── deleteSession ────────────────────────────────────────────────────────────

export async function deleteSession(
  sessionId: string,
  orgId: string,
  cohortId: string,
  programId: string
): Promise<ApiResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_delete_session', {
    p_id: sessionId,
  })

  if (error) {
    if (error.code === 'P0002') return { data: null, error: 'Session not found.' }
    if (error.code === '42501') return { data: null, error: 'You do not have permission to delete sessions.' }
    return { data: null, error: error.message }
  }

  redirect(`/dashboard/admin/orgs/${orgId}/programs/${programId}/cohorts/${cohortId}/sessions`)
}
