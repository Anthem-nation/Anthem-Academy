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
import { createSession, updateSession, deleteSession } from '@/app/(dashboard)/dashboard/admin/orgs/[id]/programs/[programId]/cohorts/[cohortId]/sessions/actions'

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

// ─── createSession ────────────────────────────────────────────────────────────

describe('createSession', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to session page on success', async () => {
    mockRpc.mockResolvedValue({ data: 'uuid-1', error: null })
    const fd = makeFormData({
      title: 'Introduction to Algebra',
      starts_at: '2026-04-01T09:00',
      ends_at: '2026-04-01T10:00',
    })
    const url = await captureRedirect(() => createSession('cohort-1', 'program-1', 'org-1', fd))
    expect(url).toBe('/dashboard/admin/orgs/org-1/programs/program-1/cohorts/cohort-1/sessions/uuid-1')
  })

  it('returns after start error on 22023', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '22023', message: 'end must be after start' } })
    const fd = makeFormData({
      title: 'Introduction to Algebra',
      starts_at: '2026-04-01T10:00',
      ends_at: '2026-04-01T09:00',
    })
    const result = await createSession('cohort-1', 'program-1', 'org-1', fd)
    expect(result.error).toContain('after start')
    expect(result.data).toBeNull()
  })

  it('returns permission error on 42501', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'permission denied' } })
    const fd = makeFormData({
      title: 'Introduction to Algebra',
      starts_at: '2026-04-01T09:00',
      ends_at: '2026-04-01T10:00',
    })
    const result = await createSession('cohort-1', 'program-1', 'org-1', fd)
    expect(result.error).toContain('permission')
  })

  it('returns success on updateSession', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const fd = makeFormData({
      title: 'Introduction to Algebra',
      starts_at: '2026-04-01T09:00',
      ends_at: '2026-04-01T10:00',
      status: 'scheduled',
    })
    const result = await updateSession('session-1', 'org-1', 'cohort-1', 'program-1', fd)
    expect(result).toEqual({ data: null, error: null })
  })

  it('redirects to sessions list on deleteSession success', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const url = await captureRedirect(() => deleteSession('session-1', 'org-1', 'cohort-1', 'program-1'))
    expect(url).toBe('/dashboard/admin/orgs/org-1/programs/program-1/cohorts/cohort-1/sessions')
  })
})
