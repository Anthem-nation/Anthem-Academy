import type { SupabaseClient } from '@supabase/supabase-js'
import type { Organization, Program, Cohort } from '@/types'

export interface CatalogProgram extends Program {
  cohorts: Cohort[]
}

export interface OrgCatalog {
  org: Organization
  programs: CatalogProgram[]
}

export async function getOrgCatalog(
  supabase: SupabaseClient,
  slug: string,
): Promise<{ data: OrgCatalog | null; error: unknown }> {
  // 1. Fetch org by slug
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, is_active, archived_at, created_at, updated_at')
    .eq('slug', slug)
    .eq('is_active', true)
    .is('archived_at', null)
    .single()

  if (orgError || !org) return { data: null, error: orgError }

  // 2. Fetch active programs + their upcoming/active cohorts
  const { data: programs, error: progError } = await supabase
    .from('programs')
    .select('*, cohorts(*)')
    .eq('org_id', org.id)
    .eq('is_active', true)
    .order('name')

  if (progError) return { data: null, error: progError }

  // 3. Filter cohorts client-side to upcoming/active (RLS already filters, this is a safety belt)
  const catalogPrograms: CatalogProgram[] = (programs ?? []).map((p) => ({
    ...p,
    cohorts: ((p.cohorts ?? []) as Cohort[]).filter(
      (c) => c.status === 'upcoming' || c.status === 'active',
    ),
  }))

  return { data: { org: org as Organization, programs: catalogPrograms }, error: null }
}
