// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'
import { getOrgCatalog } from '@/lib/queries/catalog'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ORG = {
  id: 'org-1',
  name: 'Acme Academy',
  slug: 'acme',
  logo_url: null,
  is_active: true,
  archived_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const COHORT_UPCOMING = {
  id: 'c1',
  program_id: 'p1',
  org_id: 'org-1',
  name: 'Spring 2026',
  start_date: '2026-03-01',
  end_date: '2026-05-31',
  capacity: 20,
  status: 'upcoming',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const COHORT_ACTIVE = {
  id: 'c2',
  program_id: 'p1',
  org_id: 'org-1',
  name: 'Winter 2026',
  start_date: '2026-01-01',
  end_date: '2026-02-28',
  capacity: 15,
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const COHORT_COMPLETED = {
  id: 'c3',
  program_id: 'p1',
  org_id: 'org-1',
  name: 'Fall 2025',
  start_date: '2025-09-01',
  end_date: '2025-11-30',
  capacity: 10,
  status: 'completed',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const PROGRAM = {
  id: 'p1',
  org_id: 'org-1',
  name: 'Coding Fundamentals',
  description: 'Learn to code',
  subject: 'STEM',
  min_age: 10,
  max_age: 18,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  cohorts: [COHORT_UPCOMING, COHORT_ACTIVE, COHORT_COMPLETED],
}

// ─── Mock chain builders ───────────────────────────────────────────────────────

function makeOrgChain(org: unknown, error: unknown = null) {
  const mockSingle = vi.fn().mockResolvedValue({ data: org, error })
  const mockIs = vi.fn().mockReturnValue({ single: mockSingle })
  const mockEqActive = vi.fn().mockReturnValue({ is: mockIs })
  const mockEqSlug = vi.fn().mockReturnValue({ eq: mockEqActive })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSlug })
  return { mockSelect, mockSingle }
}

function makeProgramsChain(programs: unknown[], error: unknown = null) {
  const mockOrder = vi.fn().mockResolvedValue({ data: programs, error })
  const mockEqActive = vi.fn().mockReturnValue({ order: mockOrder })
  const mockEqOrgId = vi.fn().mockReturnValue({ eq: mockEqActive })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEqOrgId })
  return { mockSelect, mockOrder }
}

function buildSupabase(
  org: unknown,
  orgError: unknown = null,
  programs: unknown[] = [],
  progError: unknown = null,
) {
  const orgChain = makeOrgChain(org, orgError)
  const programsChain = makeProgramsChain(programs, progError)

  let callCount = 0
  const fromFn = vi.fn(() => {
    callCount++
    if (callCount === 1) return { select: orgChain.mockSelect }
    return { select: programsChain.mockSelect }
  })

  return { supabase: { from: fromFn } }
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('getOrgCatalog', () => {
  it('returns org and programs with cohorts when found', async () => {
    const { supabase } = buildSupabase(ORG, null, [PROGRAM])

    const result = await getOrgCatalog(supabase, 'acme')

    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data!.org).toEqual(ORG)
    expect(result.data!.programs).toHaveLength(1)
    expect(result.data!.programs[0].name).toBe('Coding Fundamentals')
  })

  it('returns null when org slug not found (orgError)', async () => {
    const dbError = { message: 'No rows found', code: 'PGRST116' }
    const { supabase } = buildSupabase(null, dbError)

    const result = await getOrgCatalog(supabase, 'nonexistent')

    expect(result.data).toBeNull()
    expect(result.error).toEqual(dbError)
  })

  it('returns null when org query returns null data', async () => {
    const { supabase } = buildSupabase(null, null)

    const result = await getOrgCatalog(supabase, 'ghost')

    expect(result.data).toBeNull()
  })

  it('filters cohorts to upcoming and active only', async () => {
    const { supabase } = buildSupabase(ORG, null, [PROGRAM])

    const result = await getOrgCatalog(supabase, 'acme')

    expect(result.data).not.toBeNull()
    const cohorts = result.data!.programs[0].cohorts
    expect(cohorts).toHaveLength(2)
    expect(cohorts.map((c) => c.status)).toEqual(
      expect.arrayContaining(['upcoming', 'active']),
    )
    expect(cohorts.find((c) => c.status === 'completed')).toBeUndefined()
  })

  it('returns empty programs array when org has no active programs', async () => {
    const { supabase } = buildSupabase(ORG, null, [])

    const result = await getOrgCatalog(supabase, 'acme')

    expect(result.data).not.toBeNull()
    expect(result.data!.programs).toEqual([])
  })

  it('returns null when programs query fails', async () => {
    const progError = { message: 'query failed', code: '42P01' }
    const { supabase } = buildSupabase(ORG, null, [], progError)

    const result = await getOrgCatalog(supabase, 'acme')

    expect(result.data).toBeNull()
    expect(result.error).toEqual(progError)
  })

  it('handles program with no cohorts', async () => {
    const programNoCohorts = { ...PROGRAM, cohorts: [] }
    const { supabase } = buildSupabase(ORG, null, [programNoCohorts])

    const result = await getOrgCatalog(supabase, 'acme')

    expect(result.data!.programs[0].cohorts).toEqual([])
  })
})
