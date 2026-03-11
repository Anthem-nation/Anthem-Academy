import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks ---
const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockSignInWithOAuth = vi.fn()

const mockSupabase = {
  from: mockFrom,
  auth: {
    signInWithPassword: mockSignInWithPassword,
    signUp: mockSignUp,
    signOut: mockSignOut,
    signInWithOAuth: mockSignInWithOAuth,
  },
}

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
import { getRoleRedirect, signInWithEmail, signUpWithEmail, signOut } from '@/app/(auth)/actions'

// Helper to call an action and capture the redirect URL
async function captureRedirect(fn: () => Promise<void>): Promise<string> {
  try {
    await fn()
  } catch (e: unknown) {
    const msg = (e as Error).message
    if (msg.startsWith('NEXT_REDIRECT:')) return msg.replace('NEXT_REDIRECT:', '')
  }
  throw new Error('Expected redirect but none occurred')
}

describe('getRoleRedirect', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each([
    ['admin', '/dashboard/admin'],
    ['staff', '/dashboard/staff'],
    ['student', '/dashboard/student'],
    ['parent', '/dashboard/parent'],
  ] as const)('returns /dashboard/%s for role %s', async (role, expected) => {
    mockSingle.mockResolvedValue({ data: { role }, error: null })
    const result = await getRoleRedirect('user-123')
    expect(result).toBe(expected)
  })

  it('defaults to /dashboard/student when persons row is missing', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'No rows' } })
    const result = await getRoleRedirect('user-456')
    expect(result).toBe('/dashboard/student')
  })
})

describe('signInWithEmail', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to role path on success', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })

    const fd = new FormData()
    fd.set('email', 'admin@test.com')
    fd.set('password', 'secret')

    const url = await captureRedirect(() => signInWithEmail(fd))
    expect(url).toBe('/dashboard/admin')
  })

  it('redirects to /login?error on auth failure', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' },
    })

    const fd = new FormData()
    fd.set('email', 'bad@test.com')
    fd.set('password', 'wrong')

    const url = await captureRedirect(() => signInWithEmail(fd))
    expect(url).toContain('/login?error=')
    expect(decodeURIComponent(url)).toContain('Invalid credentials')
  })
})

describe('signUpWithEmail', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /login?message=check-email on success', async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: null })

    const fd = new FormData()
    fd.set('email', 'new@test.com')
    fd.set('password', 'password123')
    fd.set('role', 'student')

    const url = await captureRedirect(() => signUpWithEmail(fd))
    expect(url).toBe('/login?message=check-email')
  })

  it('redirects to /signup?error on failure', async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'Email already in use' },
    })

    const fd = new FormData()
    fd.set('email', 'existing@test.com')
    fd.set('password', 'password123')
    fd.set('role', 'parent')

    const url = await captureRedirect(() => signUpWithEmail(fd))
    expect(url).toContain('/signup?error=')
    expect(decodeURIComponent(url)).toContain('Email already in use')
  })
})

describe('signOut', () => {
  beforeEach(() => vi.clearAllMocks())

  it('signs out and redirects to /login', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    const url = await captureRedirect(() => signOut())
    expect(url).toBe('/login')
    expect(mockSignOut).toHaveBeenCalledOnce()
  })
})
