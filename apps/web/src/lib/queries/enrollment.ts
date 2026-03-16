import type { SupabaseClient } from '@supabase/supabase-js'
import type { Organization, Program, Cohort, EnrollmentField } from '@/types'

export interface EnrollmentFormData {
  org: Organization
  program: Program
  cohorts: Cohort[]
  enrollmentFields: EnrollmentField[]
}

export async function getEnrollmentFormData(
  supabase: SupabaseClient,
  slug: string,
  programId: string,
): Promise<{ data: EnrollmentFormData | null; error: unknown }> {
  // 1. Fetch active org by slug
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, is_active, archived_at, created_at, updated_at')
    .eq('slug', slug)
    .eq('is_active', true)
    .is('archived_at', null)
    .single()

  if (orgError || !org) return { data: null, error: orgError }

  // 2. Fetch program
  const { data: program, error: progError } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .eq('org_id', org.id)
    .eq('is_active', true)
    .single()

  if (progError || !program) return { data: null, error: progError }

  // 3. Fetch open cohorts for this program
  const { data: cohorts, error: cohortError } = await supabase
    .from('cohorts')
    .select('*')
    .eq('program_id', programId)
    .in('status', ['upcoming', 'active'])
    .order('start_date')

  if (cohortError) return { data: null, error: cohortError }

  // 4. Fetch org_settings for enrollment_fields (anon policy added in migration 014)
  const { data: settings } = await supabase
    .from('org_settings')
    .select('enrollment_fields')
    .eq('org_id', org.id)
    .single()

  return {
    data: {
      org: org as Organization,
      program: program as Program,
      cohorts: (cohorts ?? []) as Cohort[],
      enrollmentFields: (settings?.enrollment_fields ?? []) as EnrollmentField[],
    },
    error: null,
  }
}
