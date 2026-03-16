// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'
import { getOrgPendingEnrollments } from '@/lib/queries/enrollments'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ENROLLMENT_ROW = {
  id: 'enroll-1',
  cohort_id: 'cohort-1',
  enrolled_at: '2026-03-01T10:00:00Z',
  enrollment_data: { grade: '5th' },
  person: { id: 'person-1', email: 'student@example.com', full_name: 'Alice Smith' },
  cohort: {
    id: 'cohort-1',
    name: 'Spring 2026',
    program_id: 'prog-1',
    capacity: 20,
    program: { id: 'prog-1', name: 'Coding Fundamentals' },
  },
}

// ─── Mock chain builder ────────────────────────────────────────────────────────

function buildSupabase(data: unknown[], error: unknown = null) {
  const mockOrder = vi.fn().mockResolvedValue({ data, error })
  const mockEqStatus = vi.fn().mockReturnValue({ order: mockOrder })
  const mockEqOrgId = vi.fn().mockReturnValue({ eq: mockEqStatus })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEqOrgId })
  const supabase = { from: vi.fn().mockReturnValue({ select: mockSelect }) }
  return { supabase, mockSelect, mockEqOrgId, mockEqStatus, mockOrder }
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('getOrgPendingEnrollments', () => {
  it('returns pending enrollments array when found', async () => {
    const { supabase } = buildSupabase([ENROLLMENT_ROW])

    const result = await getOrgPendingEnrollments(supabase, 'org-1')

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(1)
    expect(result.data![0].id).toBe('enroll-1')
    expect(result.data![0].person.email).toBe('student@example.com')
    expect(result.data![0].cohort.program.name).toBe('Coding Fundamentals')
  })

  it('returns empty array when no pending enrollments exist', async () => {
    const { supabase } = buildSupabase([])

    const result = await getOrgPendingEnrollments(supabase, 'org-1')

    expect(result.error).toBeNull()
    expect(result.data).toEqual([])
  })

  it('returns null data and error when query fails', async () => {
    const dbError = { message: 'query failed', code: '42501' }
    const { supabase } = buildSupabase([], dbError)

    const result = await getOrgPendingEnrollments(supabase, 'org-1')

    expect(result.data).toBeNull()
    expect(result.error).toEqual(dbError)
  })
})
