// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRpc = vi.fn()
const mockSupabase = { rpc: mockRpc }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

// Import after mocks
import { createCohort, updateCohort, deleteCohort } from '@/app/(dashboard)/dashboard/admin/orgs/[id]/programs/[programId]/cohorts/actions'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

async function captureRedirect(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn()
  } catch (e: unknown) {
    const msg = (e as Error).message
    if (msg.startsWith('NEXT_REDIRECT:')) return msg.replace('NEXT_REDIRECT:', '')
  }
  throw new Error('Expected redirect but none occurred')
}

// ─── createCohort ─────────────────────────────────────────────────────────────

describe('createCohort', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to cohort page on success', async () => {
    mockRpc.mockResolvedValue({ data: 'uuid-1', error: null })
    const fd = makeFormData({ name: 'Spring 2026', status: 'upcoming' })
    const url = await captureRedirect(() => createCohort('org-1', 'program-1', fd))
    expect(url).toBe('/dashboard/admin/orgs/org-1/programs/program-1/cohorts/uuid-1')
  })

  it('returns date error on 22023', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '22023', message: 'invalid dates' } })
    const fd = makeFormData({ name: 'Spring 2026', status: 'upcoming' })
    const result = await createCohort('org-1', 'program-1', fd)
    expect(result.error).toContain('date')
    expect(result.data).toBeNull()
  })

  it('returns permission error on 42501', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'permission denied' } })
    const fd = makeFormData({ name: 'Spring 2026', status: 'upcoming' })
    const result = await createCohort('org-1', 'program-1', fd)
    expect(result.error).toContain('permission')
  })

  it('returns success on updateCohort', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const fd = makeFormData({ name: 'Spring 2026', status: 'active' })
    const result = await updateCohort('cohort-1', 'org-1', 'program-1', fd)
    expect(result).toEqual({ data: null, error: null })
  })

  it('redirects to cohorts list on deleteCohort success', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const url = await captureRedirect(() => deleteCohort('cohort-1', 'org-1', 'program-1'))
    expect(url).toBe('/dashboard/admin/orgs/org-1/programs/program-1/cohorts')
  })
})
