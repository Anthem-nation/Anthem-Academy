// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'
import { getEnrollmentFormData } from '@/lib/queries/enrollment'

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

const PROGRAM = {
  id: 'prog-1',
  org_id: 'org-1',
  name: 'Coding Fundamentals',
  description: 'Learn to code',
  subject: 'STEM',
  min_age: 10,
  max_age: 18,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const COHORT_UPCOMING = {
  id: 'c1',
  program_id: 'prog-1',
  org_id: 'org-1',
  name: 'Spring 2026',
  start_date: '2026-03-01',
  end_date: '2026-05-31',
  capacity: 20,
  status: 'upcoming',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const ENROLLMENT_FIELDS = [
  { name: 'school', type: 'text', required: true },
  { name: 'grade', type: 'number', required: false },
]

// ─── Mock chain builders ───────────────────────────────────────────────────────

function makeOrgChain(org: unknown, error: unknown = null) {
  const mockSingle = vi.fn().mockResolvedValue({ data: org, error })
  const mockIs = vi.fn().mockReturnValue({ single: mockSingle })
  const mockEqActive = vi.fn().mockReturnValue({ is: mockIs })
  const mockEqSlug = vi.fn().mockReturnValue({ eq: mockEqActive })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSlug })
  return { mockSelect }
}

function makeProgramChain(program: unknown, error: unknown = null) {
  const mockSingle = vi.fn().mockResolvedValue({ data: program, error })
  const mockEqActive = vi.fn().mockReturnValue({ single: mockSingle })
  const mockEqOrgId = vi.fn().mockReturnValue({ eq: mockEqActive })
  const mockEqId = vi.fn().mockReturnValue({ eq: mockEqOrgId })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEqId })
  return { mockSelect }
}

function makeCohortChain(cohorts: unknown[], error: unknown = null) {
  const mockOrder = vi.fn().mockResolvedValue({ data: cohorts, error })
  const mockIn = vi.fn().mockReturnValue({ order: mockOrder })
  const mockEq = vi.fn().mockReturnValue({ in: mockIn })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
  return { mockSelect }
}

function makeSettingsChain(settings: unknown, error: unknown = null) {
  const mockSingle = vi.fn().mockResolvedValue({ data: settings, error })
  const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
  return { mockSelect }
}

function buildSupabase({
  org = ORG,
  orgError = null,
  program = PROGRAM,
  progError = null,
  cohorts = [COHORT_UPCOMING],
  cohortError = null,
  settings = { enrollment_fields: ENROLLMENT_FIELDS },
  settingsError = null,
} = {}) {
  const orgChain = makeOrgChain(org, orgError)
  const programChain = makeProgramChain(program, progError)
  const cohortChain = makeCohortChain(cohorts, cohortError)
  const settingsChain = makeSettingsChain(settings, settingsError)

  let callCount = 0
  const fromFn = vi.fn(() => {
    callCount++
    if (callCount === 1) return { select: orgChain.mockSelect }
    if (callCount === 2) return { select: programChain.mockSelect }
    if (callCount === 3) return { select: cohortChain.mockSelect }
    return { select: settingsChain.mockSelect }
  })

  return { supabase: { from: fromFn } }
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('getEnrollmentFormData', () => {
  it('returns org + program + cohorts + enrollmentFields when all found', async () => {
    const { supabase } = buildSupabase()

    const result = await getEnrollmentFormData(supabase, 'acme', 'prog-1')

    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data!.org).toEqual(ORG)
    expect(result.data!.program).toEqual(PROGRAM)
    expect(result.data!.cohorts).toHaveLength(1)
    expect(result.data!.cohorts[0].id).toBe('c1')
    expect(result.data!.enrollmentFields).toEqual(ENROLLMENT_FIELDS)
  })

  it('returns null when org not found', async () => {
    const dbError = { message: 'No rows found', code: 'PGRST116' }
    const { supabase } = buildSupabase({ org: null, orgError: dbError })

    const result = await getEnrollmentFormData(supabase, 'nonexistent', 'prog-1')

    expect(result.data).toBeNull()
    expect(result.error).toEqual(dbError)
  })

  it('returns null when program not found', async () => {
    const dbError = { message: 'No rows found', code: 'PGRST116' }
    const { supabase } = buildSupabase({ program: null, progError: dbError })

    const result = await getEnrollmentFormData(supabase, 'acme', 'bad-prog')

    expect(result.data).toBeNull()
    expect(result.error).toEqual(dbError)
  })

  it('returns empty cohorts array when no open cohorts', async () => {
    const { supabase } = buildSupabase({ cohorts: [] })

    const result = await getEnrollmentFormData(supabase, 'acme', 'prog-1')

    expect(result.data).not.toBeNull()
    expect(result.data!.cohorts).toEqual([])
  })

  it('returns empty enrollmentFields when org has no settings row', async () => {
    const { supabase } = buildSupabase({ settings: null })

    const result = await getEnrollmentFormData(supabase, 'acme', 'prog-1')

    expect(result.data).not.toBeNull()
    expect(result.data!.enrollmentFields).toEqual([])
  })

  it('returns null when cohort query fails', async () => {
    const dbError = { message: 'query failed', code: '42P01' }
    const { supabase } = buildSupabase({ cohorts: [], cohortError: dbError })

    const result = await getEnrollmentFormData(supabase, 'acme', 'prog-1')

    expect(result.data).toBeNull()
    expect(result.error).toEqual(dbError)
  })
})
