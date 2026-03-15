// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock chain builders ───────────────────────────────────────────────────────

function makeCountChain(count: number) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ count, error: null }),
    }),
  }
}

function makeDataChain(data: unknown[], error: unknown = null) {
  const mockRange = vi.fn().mockResolvedValue({ data, error })
  const mockOrder = vi.fn().mockReturnValue({ range: mockRange })
  const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
  return { mockSelect, mockEq, mockOrder, mockRange }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

import { getOrgEvents } from '@/lib/queries/event-log'
import { PAGE_SIZE } from '@/lib/utils/pagination'

describe('getOrgEvents', () => {
  const ORG_ID = 'org-123'

  function buildSupabase(count: number, data: unknown[], dataError: unknown = null) {
    const { mockSelect, mockEq, mockOrder, mockRange } = makeDataChain(data, dataError)

    let callCount = 0
    const fromFn = vi.fn(() => {
      callCount++
      if (callCount === 1) {
        // First call: count query
        return makeCountChain(count)
      }
      // Second call: data query
      return { select: mockSelect }
    })

    return {
      supabase: { from: fromFn },
      mockSelect, mockEq, mockOrder, mockRange,
    }
  }

  it('returns events when data exists', async () => {
    const events = [
      { id: 'e1', org_id: ORG_ID, entity: 'organization', action: 'org_created', actor_id: 'u1', payload: { name: 'Acme' }, created_at: '2026-01-01T00:00:00Z' },
      { id: 'e2', org_id: ORG_ID, entity: 'person', action: 'role_assigned', actor_id: 'u1', payload: { person_id: 'p1', role: 'student' }, created_at: '2026-01-02T00:00:00Z' },
    ]
    const { supabase } = buildSupabase(2, events)

    const result = await getOrgEvents(supabase, ORG_ID, 1)

    expect(result.data).toEqual(events)
    expect(result.error).toBeNull()
    expect(result.count).toBe(2)
    expect(result.totalPages).toBe(1)
  })

  it('returns empty array when no events', async () => {
    const { supabase } = buildSupabase(0, [])

    const result = await getOrgEvents(supabase, ORG_ID, 1)

    expect(result.data).toEqual([])
    expect(result.count).toBe(0)
    expect(result.totalPages).toBe(1)
  })

  it('calculates correct offset for page 1', async () => {
    const { supabase, mockRange } = buildSupabase(25, [])

    await getOrgEvents(supabase, ORG_ID, 1)

    expect(mockRange).toHaveBeenCalledWith(0, PAGE_SIZE - 1)
  })

  it('calculates correct offset for page 2', async () => {
    const { supabase, mockRange } = buildSupabase(25, [])

    await getOrgEvents(supabase, ORG_ID, 2)

    expect(mockRange).toHaveBeenCalledWith(PAGE_SIZE, PAGE_SIZE * 2 - 1)
  })

  it('clamps out-of-range page to last page', async () => {
    // 5 total events → 1 page. Page 99 clamps to page 1 → offset 0
    const { supabase, mockRange } = buildSupabase(5, [])

    await getOrgEvents(supabase, ORG_ID, 99)

    expect(mockRange).toHaveBeenCalledWith(0, PAGE_SIZE - 1)
  })

  it('passes org_id filter to data query', async () => {
    const { supabase, mockEq } = buildSupabase(1, [])

    await getOrgEvents(supabase, ORG_ID, 1)

    expect(mockEq).toHaveBeenCalledWith('org_id', ORG_ID)
  })

  it('returns error when data query fails', async () => {
    const dbError = { message: 'connection refused', code: '08006' }
    const { supabase } = buildSupabase(0, null, dbError)

    const result = await getOrgEvents(supabase, ORG_ID, 1)

    expect(result.error).toEqual(dbError)
    expect(result.data).toBeNull()
  })
})
