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
import { addMember, updateMemberRole, removeMember } from '@/app/(dashboard)/dashboard/admin/orgs/[id]/members/actions'

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

// ─── addMember ────────────────────────────────────────────────────────────────

describe('addMember', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns membershipId on success', async () => {
    mockRpc.mockResolvedValue({ data: 'uuid-1', error: null })
    const fd = makeFormData({ email: 'test@example.com', role: 'student' })
    const result = await addMember('org-1', fd)
    expect(result).toEqual({ data: { membershipId: 'uuid-1' }, error: null })
  })

  it('returns email error when person not found (P0002)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: 'P0002', message: 'not found' } })
    const fd = makeFormData({ email: 'nobody@example.com', role: 'student' })
    const result = await addMember('org-1', fd)
    expect(result.error).toContain('email')
    expect(result.data).toBeNull()
  })

  it('returns already a member error on duplicate (23505)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '23505', message: 'duplicate' } })
    const fd = makeFormData({ email: 'exists@example.com', role: 'student' })
    const result = await addMember('org-1', fd)
    expect(result.error).toContain('already a member')
  })

  it('returns Zod validation error for invalid email', async () => {
    const fd = makeFormData({ email: 'not-an-email', role: 'student' })
    const result = await addMember('org-1', fd)
    expect(result.error).toBeTruthy()
    expect(result.data).toBeNull()
    expect(mockRpc).not.toHaveBeenCalled()
  })
})

// ─── updateMemberRole ─────────────────────────────────────────────────────────

describe('updateMemberRole', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success on valid role update', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const fd = makeFormData({ role: 'staff' })
    const result = await updateMemberRole('membership-1', 'org-1', fd)
    expect(result).toEqual({ data: null, error: null })
  })

  it('returns permission error on 42501', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'permission denied' } })
    const fd = makeFormData({ role: 'admin' })
    const result = await updateMemberRole('membership-1', 'org-1', fd)
    expect(result.error).toContain('permission')
  })
})

// ─── removeMember ─────────────────────────────────────────────────────────────

describe('removeMember', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to members page on success', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const url = await captureRedirect(() => removeMember('membership-1', 'org-1'))
    expect(url).toBe('/dashboard/admin/orgs/org-1/members')
  })

  it('returns not found error on P0002', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: 'P0002', message: 'not found' } })
    const result = await removeMember('membership-1', 'org-1')
    expect(result.error).toContain('not found')
  })

  it('returns permission error on 42501', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'permission denied' } })
    const result = await removeMember('membership-1', 'org-1')
    expect(result.error).toContain('permission')
  })
})
