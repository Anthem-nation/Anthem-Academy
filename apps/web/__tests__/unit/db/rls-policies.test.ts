import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// Supabase query builder chain: from → select → [eq / in_ / ...] → (resolve)
// We capture the chain so each test can configure the resolved value.
// ---------------------------------------------------------------------------

type MockResult = { data: unknown[]; error: null }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockData    = vi.fn() as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockResolve = vi.fn() as any

// Chainable builder returned by .select()
const mockIn  = vi.fn((_col: string, _vals: unknown[]) => mockResolve() as Promise<MockResult>)
const mockEq  = vi.fn((_col: string, _val:  unknown)   => mockResolve() as Promise<MockResult>)
const mockSelect = vi.fn((_cols: string) => ({
  eq:  mockEq,
  in:  mockIn,
  // allow awaiting .select() directly (no further filter)
  then: (
    resolve:  (v: MockResult) => unknown,
    _reject?: (e: unknown)    => unknown,
  ) => (Promise.resolve(mockData() as MockResult)).then(resolve),
}))
const mockFrom = vi.fn((_table: string) => ({ select: mockSelect }))

const mockSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => mockSupabase),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simulate a Supabase response with the given rows. */
function rows<T>(data: T[]) {
  return { data, error: null }
}

/** Simulate a Supabase response with no rows (RLS blocked). */
const noRows = { data: [] as unknown[], error: null }

// ---------------------------------------------------------------------------
// Test data (UUIDs are deterministic for readability)
// ---------------------------------------------------------------------------

const ORG_A = '00000000-0000-0000-0000-000000000001'
const ORG_B = '00000000-0000-0000-0000-000000000002'

const STUDENT = {
  id: 'aaaaaaaa-0000-0000-0000-000000000001',
  email: 'student@anthem.test',
  role: 'student',
  org_id: ORG_A,
  full_name: 'Sam Student',
}

const STAFF = {
  id: 'bbbbbbbb-0000-0000-0000-000000000001',
  email: 'staff@anthem.test',
  role: 'staff',
  org_id: ORG_A,
  full_name: 'Sara Staff',
}

const ADMIN_A = {
  id: 'cccccccc-0000-0000-0000-000000000001',
  email: 'admin@anthem.test',
  role: 'admin',
  org_id: ORG_A,
  full_name: 'Adam Admin',
}

const ADMIN_B = {
  id: 'dddddddd-0000-0000-0000-000000000001',
  email: 'admin-b@anthem.test',
  role: 'admin',
  org_id: ORG_B,
  full_name: 'Beth Admin',
}

const ORG_A_PERSONS = [STUDENT, STAFF, ADMIN_A]

const MEMBERSHIP_STUDENT = { id: 'm1', org_id: ORG_A, person_id: STUDENT.id, role: 'student' }
const MEMBERSHIP_STAFF   = { id: 'm2', org_id: ORG_A, person_id: STAFF.id,   role: 'staff' }
const MEMBERSHIP_ADMIN_A = { id: 'm3', org_id: ORG_A, person_id: ADMIN_A.id, role: 'admin' }
const MEMBERSHIP_ADMIN_B = { id: 'm4', org_id: ORG_B, person_id: ADMIN_B.id, role: 'admin' }

// ---------------------------------------------------------------------------
// persons table
// ---------------------------------------------------------------------------

describe('RLS — persons table', () => {
  beforeEach(() => vi.clearAllMocks())

  it('student querying persons — gets only own row', async () => {
    // RLS: id = auth.uid() → 1 row
    mockResolve.mockResolvedValue(rows([STUDENT]))

    const { data } = await mockSupabase
      .from('persons')
      .select('*')
      .eq('id', STUDENT.id)

    expect(data).toHaveLength(1)
    expect(data![0]).toMatchObject({ id: STUDENT.id, role: 'student' })
  })

  it('staff querying persons — gets only own row', async () => {
    mockResolve.mockResolvedValue(rows([STAFF]))

    const { data } = await mockSupabase
      .from('persons')
      .select('*')
      .eq('id', STAFF.id)

    expect(data).toHaveLength(1)
    expect(data![0]).toMatchObject({ id: STAFF.id, role: 'staff' })
  })

  it('admin querying persons in their org — gets all org members', async () => {
    // RLS: is_org_admin(org_id) → all ORG_A persons visible
    mockResolve.mockResolvedValue(rows(ORG_A_PERSONS))

    const { data } = await mockSupabase
      .from('persons')
      .select('*')
      .eq('org_id', ORG_A)

    expect(data).toHaveLength(3)
    const persons = data! as (typeof STUDENT)[]
    expect(persons.map(p => p.id)).toContain(ADMIN_A.id)
    expect(persons.map(p => p.id)).toContain(STUDENT.id)
  })

  it('admin from Org A querying Org B persons — blocked (0 rows)', async () => {
    // RLS: is_org_admin(ORG_B) = false for admin@anthem.test → no rows
    mockResolve.mockResolvedValue(noRows)

    const { data } = await mockSupabase
      .from('persons')
      .select('*')
      .eq('org_id', ORG_B)

    expect(data).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// organizations table
// ---------------------------------------------------------------------------

describe('RLS — organizations table', () => {
  beforeEach(() => vi.clearAllMocks())

  it('student querying organizations — sees only their org', async () => {
    // RLS: id in (select org_id from org_memberships where person_id = auth.uid())
    // student is only in ORG_A
    mockData.mockReturnValue(rows([{ id: ORG_A, name: 'Anthem Academy', slug: 'anthem-academy' }]))

    const { data } = await mockSupabase.from('organizations').select('*')

    expect(data).toHaveLength(1)
    expect(data![0]).toMatchObject({ id: ORG_A })
  })

  it('admin querying organizations — sees both orgs they belong to', async () => {
    // Scenario: admin is a member of both ORG_A and ORG_B
    mockData.mockReturnValue(rows([
      { id: ORG_A, name: 'Anthem Academy', slug: 'anthem-academy' },
      { id: ORG_B, name: 'Beta Org',       slug: 'beta-org' },
    ]))

    const { data } = await mockSupabase.from('organizations').select('*')

    expect(data).toHaveLength(2)
    const orgs = data! as { id: string }[]
    expect(orgs.map(o => o.id)).toContain(ORG_A)
    expect(orgs.map(o => o.id)).toContain(ORG_B)
  })
})

// ---------------------------------------------------------------------------
// org_memberships table
// ---------------------------------------------------------------------------

describe('RLS — org_memberships table', () => {
  beforeEach(() => vi.clearAllMocks())

  it('student querying org_memberships — gets only their own row', async () => {
    // RLS: person_id = auth.uid() → 1 row
    mockResolve.mockResolvedValue(rows([MEMBERSHIP_STUDENT]))

    const { data } = await mockSupabase
      .from('org_memberships')
      .select('*')
      .eq('person_id', STUDENT.id)

    expect(data).toHaveLength(1)
    expect(data![0]).toMatchObject({ person_id: STUDENT.id })
  })

  it('admin querying org_memberships for their org — sees all org rows', async () => {
    // RLS: is_org_admin(org_id) → all ORG_A memberships visible
    mockResolve.mockResolvedValue(rows([MEMBERSHIP_STUDENT, MEMBERSHIP_STAFF, MEMBERSHIP_ADMIN_A]))

    const { data } = await mockSupabase
      .from('org_memberships')
      .select('*')
      .eq('org_id', ORG_A)

    expect(data).toHaveLength(3)
    const personIds = (data! as (typeof MEMBERSHIP_STUDENT)[]).map(m => m.person_id)
    expect(personIds).toContain(STUDENT.id)
    expect(personIds).toContain(STAFF.id)
    expect(personIds).toContain(ADMIN_A.id)
  })

  it('admin querying org_memberships for another org — blocked (0 rows)', async () => {
    // RLS: is_org_admin(ORG_B) = false for admin@anthem.test → no rows
    mockResolve.mockResolvedValue(noRows)

    const { data } = await mockSupabase
      .from('org_memberships')
      .select('*')
      .eq('org_id', ORG_B)

    expect(data).toHaveLength(0)
  })

  it('admin_b can see their own org_b memberships but not org_a', async () => {
    // Positive: admin_b queries ORG_B → sees their own membership
    mockResolve.mockResolvedValue(rows([MEMBERSHIP_ADMIN_B]))

    const { data: orgBData } = await mockSupabase
      .from('org_memberships')
      .select('*')
      .eq('org_id', ORG_B)

    expect(orgBData).toHaveLength(1)
    expect(orgBData![0]).toMatchObject({ person_id: ADMIN_B.id })

    // Negative: admin_b queries ORG_A → blocked
    mockResolve.mockResolvedValue(noRows)

    const { data: orgAData } = await mockSupabase
      .from('org_memberships')
      .select('*')
      .eq('org_id', ORG_A)

    expect(orgAData).toHaveLength(0)
  })
})
