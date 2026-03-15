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
import { createProgram, updateProgram, deleteProgram } from '@/app/(dashboard)/dashboard/admin/orgs/[id]/programs/actions'

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

// ─── createProgram ────────────────────────────────────────────────────────────

describe('createProgram', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to program page on success', async () => {
    mockRpc.mockResolvedValue({ data: 'uuid-1', error: null })
    const fd = makeFormData({ name: 'Math Foundations', is_active: 'true' })
    const url = await captureRedirect(() => createProgram('org-1', fd))
    expect(url).toBe('/dashboard/admin/orgs/org-1/programs/uuid-1')
  })

  it('returns already exists error on duplicate name (23505)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '23505', message: 'duplicate' } })
    const fd = makeFormData({ name: 'Math Foundations', is_active: 'true' })
    const result = await createProgram('org-1', fd)
    expect(result.error).toContain('already exists')
    expect(result.data).toBeNull()
  })

  it('returns permission error on 42501', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'permission denied' } })
    const fd = makeFormData({ name: 'Math Foundations', is_active: 'true' })
    const result = await createProgram('org-1', fd)
    expect(result.error).toContain('permission')
  })

  it('returns Zod validation error for short name without calling rpc', async () => {
    const fd = makeFormData({ name: 'A', is_active: 'true' })
    const result = await createProgram('org-1', fd)
    expect(result.error).toBeTruthy()
    expect(result.data).toBeNull()
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('returns success data on updateProgram', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const fd = makeFormData({ name: 'Math Foundations', is_active: 'true' })
    const result = await updateProgram('program-1', 'org-1', fd)
    expect(result).toEqual({ data: null, error: null })
  })

  it('redirects to programs list on deleteProgram success', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const url = await captureRedirect(() => deleteProgram('program-1', 'org-1'))
    expect(url).toBe('/dashboard/admin/orgs/org-1/programs')
  })
})
