// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Leaf-level mock functions
const mockSingle = vi.fn()
const mockIs = vi.fn(() => ({ single: mockSingle }))
const mockEq = vi.fn(() => ({ single: mockSingle, is: mockIs }))
const mockSelect = vi.fn(() => ({ eq: mockEq, single: mockSingle }))
const mockInsert = vi.fn(() => ({ select: mockSelect }))
const mockUpdate = vi.fn(() => ({ eq: mockEq, is: mockIs }))

const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  update: mockUpdate,
  select: mockSelect,
}))

const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url)
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
  beforeEach(() => {
    vi.clearAllMocks()
    // Default chain: insert → select → single
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
  })

  it('redirects to org detail page on success', async () => {
    mockSingle.mockResolvedValue({ data: { id: 'uuid-1' }, error: null })

    const fd = new FormData()
    fd.set('name', 'Test Org')
    fd.set('slug', 'test-org')
    fd.set('is_active', 'true')

    const url = await captureRedirect(() => createOrg(fd))
    expect(url).toBe('/dashboard/admin/orgs/uuid-1')
  })

  it('returns error for duplicate slug (23505)', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value' },
    })

    const fd = new FormData()
    fd.set('name', 'Test Org')
    fd.set('slug', 'test-org')
    fd.set('is_active', 'true')

    const result = await createOrg(fd)
    expect(result).toEqual({
      data: null,
      error: 'An organization with that slug already exists.',
    })
  })

  it('returns validation error when name is too short', async () => {
    const fd = new FormData()
    fd.set('name', 'X')   // too short (< 2 chars)
    fd.set('slug', 'x')
    fd.set('is_active', 'true')

    const result = await createOrg(fd)
    expect(result?.data).toBeNull()
    expect(result?.error).toContain('at least 2')
  })
})

// ─── updateOrg ────────────────────────────────────────────────────────────────

describe('updateOrg', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // updateOrg chain: .update().eq().select().single()
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle })
    mockEq.mockReturnValue({ single: mockSingle, is: mockIs, select: mockSelect })
    mockUpdate.mockReturnValue({ eq: mockEq })
  })

  it('redirects to org detail page on success', async () => {
    mockSingle.mockResolvedValue({ data: { id: 'uuid-1' }, error: null })

    const fd = new FormData()
    fd.set('name', 'Updated Org')
    fd.set('slug', 'updated-org')
    fd.set('is_active', 'true')

    const url = await captureRedirect(() => updateOrg('uuid-1', fd))
    expect(url).toBe('/dashboard/admin/orgs/uuid-1')
  })

  it('returns error when RLS blocks update (PGRST116)', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows returned' },
    })

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
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ is: mockIs, single: mockSingle })
    mockIs.mockReturnValue({ single: mockSingle })
  })

  it('redirects to /dashboard/admin/orgs on success', async () => {
    // archiveOrg uses .update().eq().is() — no .single()
    mockIs.mockResolvedValue({ error: null })

    const url = await captureRedirect(() => archiveOrg('uuid-1'))
    expect(url).toBe('/dashboard/admin/orgs')
  })
})

// ─── updateOrgSettings ────────────────────────────────────────────────────────

describe('updateOrgSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: null })
  })

  it('redirects to org detail page on success', async () => {
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
  })
})
