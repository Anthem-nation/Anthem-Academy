'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse, CohortStatus } from '@/types'

// ─── Zod schema ───────────────────────────────────────────────────────────────

const COHORT_STATUSES = ['upcoming', 'active', 'completed', 'cancelled'] as const satisfies readonly CohortStatus[]

const CohortSchema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters'),
  start_date: z.string().optional().nullable(),
  end_date:   z.string().optional().nullable(),
  capacity:   z.coerce.number().int().positive('Capacity must be greater than zero').optional().nullable(),
  status:     z.enum(COHORT_STATUSES, { message: 'Invalid status' }),
})

function parseFormData(formData: FormData) {
  const capacityRaw = formData.get('capacity') as string
  return {
    name:       formData.get('name') as string,
    start_date: (formData.get('start_date') as string) || null,
    end_date:   (formData.get('end_date') as string) || null,
    capacity:   capacityRaw ? Number(capacityRaw) : null,
    status:     formData.get('status') as string,
  }
}

function mapError(code: string): string | null {
  if (code === '42501') return 'You do not have permission to manage cohorts.'
  if (code === '22023') return 'Invalid dates or capacity values.'
  return null
}

// ─── createCohort ─────────────────────────────────────────────────────────────

export async function createCohort(
  orgId: string,
  programId: string,
  formData: FormData
): Promise<ApiResponse<{ cohortId: string }>> {
  const parsed = CohortSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_create_cohort', {
    p_org_id:     orgId,
    p_program_id: programId,
    p_name:       parsed.data.name,
    p_start_date: parsed.data.start_date ?? null,
    p_end_date:   parsed.data.end_date ?? null,
    p_capacity:   parsed.data.capacity ?? null,
    p_status:     parsed.data.status,
  })

  if (error) {
    return { data: null, error: mapError(error.code) ?? error.message }
  }

  redirect(`/dashboard/admin/orgs/${orgId}/programs/${programId}/cohorts/${data}`)
}

// ─── updateCohort ─────────────────────────────────────────────────────────────

export async function updateCohort(
  cohortId: string,
  orgId: string,
  programId: string,
  formData: FormData
): Promise<ApiResponse<null>> {
  const parsed = CohortSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_update_cohort', {
    p_id:         cohortId,
    p_name:       parsed.data.name,
    p_start_date: parsed.data.start_date ?? null,
    p_end_date:   parsed.data.end_date ?? null,
    p_capacity:   parsed.data.capacity ?? null,
    p_status:     parsed.data.status,
  })

  if (error) {
    if (error.code === 'P0002') return { data: null, error: 'Cohort not found.' }
    return { data: null, error: mapError(error.code) ?? error.message }
  }

  revalidatePath(`/dashboard/admin/orgs/${orgId}/programs/${programId}/cohorts/${cohortId}`)
  return { data: null, error: null }
}

// ─── deleteCohort ─────────────────────────────────────────────────────────────

export async function deleteCohort(
  cohortId: string,
  orgId: string,
  programId: string
): Promise<ApiResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_delete_cohort', {
    p_id: cohortId,
  })

  if (error) {
    if (error.code === 'P0002') return { data: null, error: 'Cohort not found.' }
    if (error.code === '42501') return { data: null, error: 'You do not have permission to delete cohorts.' }
    return { data: null, error: error.message }
  }

  redirect(`/dashboard/admin/orgs/${orgId}/programs/${programId}/cohorts`)
}
