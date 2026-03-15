// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRpc = vi.fn()
const mockSupabase = { rpc: mockRpc }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

// Import after mocks
import {
  createOrg,
  updateOrg,
  archiveOrg,
  updateOrgSettings,
} from '@/app/(dashboard)/dashboard/admin/orgs/actions'

// ─── Helper ───────────────────────────────────────────────────────────────────

async function captureRedirect(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn()
  } catch (e: unknown) {
    const msg = (e as Error).message
    if (msg.startsWith('NEXT_REDIRECT:')) return msg.replace('NEXT_REDIRECT:', '')
  }
  throw new Error('Expected redirect but none occurred')
}

// ─── createOrg ────────────────────────────────────────────────────────────────

describe('createOrg', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to org detail page on success', async () => {
    mockRpc.mockResolvedValue({ data: 'uuid-1', error: null })

    const fd = new FormData()
    fd.set('name', 'Test Org')
    fd.set('slug', 'test-org')
    fd.set('is_active', 'true')

    const url = await captureRedirect(() => createOrg(fd))
    expect(url).toBe('/dashboard/admin/orgs/uuid-1')
  })

  it('returns error for duplicate slug (23505)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '23505', message: 'duplicate key value' } })

    const fd = new FormData()
    fd.set('name', 'Test Org')
    fd.set('slug', 'test-org')
    fd.set('is_active', 'true')

    const result = await createOrg(fd)
    expect(result).toEqual({ data: null, error: 'An organization with that slug already exists.' })
  })

  it('returns validation error when name is too short', async () => {
    const fd = new FormData()
    fd.set('name', 'X') // too short (< 2 chars)
    fd.set('slug', 'x')
    fd.set('is_active', 'true')

    const result = await createOrg(fd)
    expect(result?.data).toBeNull()
    expect(result?.error).toContain('at least 2')
    expect(mockRpc).not.toHaveBeenCalled()
  })
})

// ─── updateOrg ────────────────────────────────────────────────────────────────

describe('updateOrg', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to org detail page on success', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })

    const fd = new FormData()
    fd.set('name', 'Updated Org')
    fd.set('slug', 'updated-org')
    fd.set('is_active', 'true')

    const url = await captureRedirect(() => updateOrg('uuid-1', fd))
    expect(url).toBe('/dashboard/admin/orgs/uuid-1')
  })

  it('returns error when permission denied (42501)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'Permission denied' } })

    const fd = new FormData()
    fd.set('name', 'Updated Org')
    fd.set('slug', 'updated-org')
    fd.set('is_active', 'false')

    const result = await updateOrg('uuid-missing', fd)
    expect(result?.data).toBeNull()
    expect(result?.error).toContain('permission')
  })
})

// ─── archiveOrg ───────────────────────────────────────────────────────────────

describe('archiveOrg', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /dashboard/admin/orgs on success', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })

    const url = await captureRedirect(() => archiveOrg('uuid-1'))
    expect(url).toBe('/dashboard/admin/orgs')
  })
})

// ─── updateOrgSettings ────────────────────────────────────────────────────────

describe('updateOrgSettings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to org detail page on success', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })

    const fd = new FormData()
    fd.set('timezone', 'America/Chicago')
    fd.set('enrollment_fields', JSON.stringify([{ name: 'Grade', type: 'text', required: true }]))

    const url = await captureRedirect(() => updateOrgSettings('org-1', fd))
    expect(url).toBe('/dashboard/admin/orgs/org-1')
  })

  it('returns validation error for empty timezone', async () => {
    const fd = new FormData()
    fd.set('timezone', '')
    fd.set('enrollment_fields', '[]')

    const result = await updateOrgSettings('org-1', fd)
    expect(result?.data).toBeNull()
    expect(result?.error).toBeTruthy()
    expect(mockRpc).not.toHaveBeenCalled()
  })
})
