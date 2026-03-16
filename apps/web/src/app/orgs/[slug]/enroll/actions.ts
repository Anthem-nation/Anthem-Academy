'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types'

const EnrollSchema = z.object({
  cohort_id:      z.string().uuid('Please select a cohort.'),
  full_name:      z.string().min(2, 'Full name must be at least 2 characters.'),
  email:          z.string().email('Please enter a valid email address.'),
  dob:            z.string().min(1, 'Date of birth is required.'),
  guardian_name:  z.string().min(2, 'Guardian name is required.'),
  guardian_phone: z.string().min(7, 'Guardian phone is required.'),
})

export async function submitEnrollment(
  orgSlug: string,
  enrollmentFields: { name: string; type: string; required: boolean }[],
  formData: FormData,
): Promise<ApiResponse<{ enrollmentId: string }>> {
  // ── Parse standard fields ──────────────────────────────────────────────────
  const parsed = EnrollSchema.safeParse({
    cohort_id:      formData.get('cohort_id'),
    full_name:      formData.get('full_name'),
    email:          formData.get('email'),
    dob:            formData.get('dob'),
    guardian_name:  formData.get('guardian_name'),
    guardian_phone: formData.get('guardian_phone'),
  })
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  // ── Parse custom org fields ────────────────────────────────────────────────
  const customData: Record<string, unknown> = {}
  for (const field of enrollmentFields) {
    const val = formData.get(`custom_${field.name}`)
    if (field.required && !val) {
      return { data: null, error: `"${field.name}" is required.` }
    }
    customData[field.name] = val ?? null
  }

  const enrollmentData = {
    dob:            parsed.data.dob,
    guardian_name:  parsed.data.guardian_name,
    guardian_phone: parsed.data.guardian_phone,
    ...customData,
  }

  // ── Auth check ─────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let personId: string

  if (user) {
    // Existing authenticated user — enroll directly
    personId = user.id
    const { data: enrollmentId, error } = await supabase.rpc('submit_enrollment', {
      p_cohort_id:       parsed.data.cohort_id,
      p_person_id:       personId,
      p_enrollment_data: enrollmentData,
    })
    if (error) return { data: null, error: mapEnrollError(error.code) ?? error.message }
    redirect(`/orgs/${orgSlug}/enroll/success`)
    return { data: { enrollmentId }, error: null }  // unreachable, satisfies types
  }

  // ── New user: sign up first ────────────────────────────────────────────────
  const password = formData.get('password') as string
  if (!password || password.length < 6) {
    return { data: null, error: 'Password must be at least 6 characters.' }
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password,
    options:  { data: { role: 'student', full_name: parsed.data.full_name } },
  })
  if (signUpError || !authData.user) {
    return { data: null, error: signUpError?.message ?? 'Sign-up failed.' }
  }
  personId = authData.user.id

  // ── Use admin client to create enrollment for new (unconfirmed) user ───────
  const admin = createAdminClient()
  const { data: enrollmentId, error: enrollError } = await admin.rpc('submit_enrollment', {
    p_cohort_id:       parsed.data.cohort_id,
    p_person_id:       personId,
    p_enrollment_data: enrollmentData,
  })
  if (enrollError) return { data: null, error: mapEnrollError(enrollError.code) ?? enrollError.message }

  redirect(`/orgs/${orgSlug}/enroll/success`)
  return { data: { enrollmentId }, error: null }  // unreachable
}

function mapEnrollError(code: string): string | null {
  if (code === 'P0002') return 'This cohort is no longer accepting enrollments.'
  if (code === '23505') return 'You are already enrolled in this cohort.'
  if (code === '23503') return 'Selected cohort does not exist.'
  return null
}
