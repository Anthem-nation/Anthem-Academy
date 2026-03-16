'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

const AssignSchema = z.object({
  cohort_id: z.string().uuid('Please select a cohort.'),
})

export async function assignCohort(
  enrollmentId: string,
  orgId: string,
  formData: FormData,
): Promise<ApiResponse<null>> {
  const parsed = AssignSchema.safeParse({ cohort_id: formData.get('cohort_id') })
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message }

  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_assign_cohort', {
    p_enrollment_id: enrollmentId,
    p_cohort_id:     parsed.data.cohort_id,
    p_org_id:        orgId,
  })

  if (error) return { data: null, error: mapError(error.code) ?? error.message }

  revalidatePath(`/dashboard/admin/orgs/${orgId}/enrollments`)
  return { data: null, error: null }
}

function mapError(code: string): string | null {
  if (code === 'P0002') return 'Cohort or enrollment not found.'
  if (code === 'P0003') return 'This cohort is at full capacity.'
  if (code === '42501') return 'You do not have permission to manage enrollments.'
  return null
}
