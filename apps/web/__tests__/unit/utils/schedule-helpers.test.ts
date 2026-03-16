import { describe, it, expect } from 'vitest'
import {
  getWeekStart,
  getWeekDays,
  getMonthGrid,
  getSessionsForDay,
  formatTimeRange,
} from '@/lib/utils/schedule-helpers'
import type { ScheduleSession } from '@/app/(dashboard)/dashboard/student/schedule/_components/ScheduleCalendar'

// Helper: local-time Date (avoids UTC-midnight timezone traps)
function localDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day)
}

// Helper to make a minimal ScheduleSession for testing
function makeSession(starts_at: string, ends_at: string): ScheduleSession {
  return {
    id: starts_at,
    title: 'Test Session',
    starts_at,
    ends_at,
    location: null,
    status: 'scheduled',
    cohort_name: 'Test Cohort',
  }
}

describe('getWeekStart', () => {
  it('returns Monday when given a Wednesday', () => {
    // 2026-03-11 is a Wednesday; Monday of that week is 2026-03-09
    const result = getWeekStart(localDate(2026, 2, 11))
    expect(result.getDay()).toBe(1) // Monday
    expect(result.getDate()).toBe(9)
    expect(result.getMonth()).toBe(2) // March (0-indexed)
  })

  it('returns the same day when given a Monday', () => {
    const result = getWeekStart(localDate(2026, 2, 9)) // Monday March 9
    expect(result.getDay()).toBe(1)
    expect(result.getDate()).toBe(9)
  })

  it('returns the previous Monday when given a Sunday', () => {
    // 2026-03-15 is a Sunday; Monday of that week is 2026-03-09
    const result = getWeekStart(localDate(2026, 2, 15))
    expect(result.getDay()).toBe(1)
    expect(result.getDate()).toBe(9)
  })
})

describe('getWeekDays', () => {
  it('returns exactly 7 days', () => {
    const weekStart = localDate(2026, 2, 9) // Monday
    const days = getWeekDays(weekStart)
    expect(days).toHaveLength(7)
  })

  it('starts from the Monday provided and ends on Sunday', () => {
    const weekStart = localDate(2026, 2, 9)
    const days = getWeekDays(weekStart)
    expect(days[0].getDay()).toBe(1) // Monday
    expect(days[6].getDay()).toBe(0) // Sunday
  })

  it('days are consecutive', () => {
    const weekStart = localDate(2026, 2, 9)
    const days = getWeekDays(weekStart)
    for (let i = 1; i < 7; i++) {
      expect(days[i].getDate() - days[i - 1].getDate()).toBe(1)
    }
  })
})

describe('getMonthGrid', () => {
  it('returns exactly 42 dates (6 rows × 7 cols)', () => {
    const grid = getMonthGrid(2026, 2) // March 2026
    expect(grid).toHaveLength(42)
  })

  it('grid for a month whose 1st is Monday starts on that Monday', () => {
    // 2026-06-01 is a Monday — grid[0] should be June 1 itself
    const grid = getMonthGrid(2026, 5) // June 2026 (month=5)
    expect(grid[0].getMonth()).toBe(5) // June
    expect(grid[0].getDate()).toBe(1)
    expect(grid[0].getDay()).toBe(1) // Monday
  })

  it('includes dates from adjacent months for overflow', () => {
    // March 2026: 1st is a Sunday, grid starts on Mon Feb 23
    const grid = getMonthGrid(2026, 2)
    const firstDay = grid[0]
    expect(firstDay < localDate(2026, 2, 1)).toBe(true)
  })
})

describe('getSessionsForDay', () => {
  it('returns sessions that start on the given day', () => {
    // Build sessions with explicit local-time ISO strings
    const day = localDate(2026, 2, 16) // March 16 local
    const startISO = new Date(2026, 2, 16, 9, 0).toISOString()
    const endISO = new Date(2026, 2, 16, 10, 0).toISOString()
    const otherISO = new Date(2026, 2, 17, 9, 0).toISOString()
    const sessions = [
      makeSession(startISO, endISO),
      makeSession(otherISO, new Date(2026, 2, 17, 10, 0).toISOString()),
    ]
    const result = getSessionsForDay(sessions, day)
    expect(result).toHaveLength(1)
    expect(result[0].starts_at).toBe(startISO)
  })

  it('returns empty array when no sessions on that day', () => {
    const startISO = new Date(2026, 2, 16, 9, 0).toISOString()
    const sessions = [makeSession(startISO, new Date(2026, 2, 16, 10, 0).toISOString())]
    const day = localDate(2026, 2, 20) // March 20 local
    const result = getSessionsForDay(sessions, day)
    expect(result).toHaveLength(0)
  })
})

describe('formatTimeRange', () => {
  it('formats a time range and includes separator and AM/PM', () => {
    const starts = new Date(2026, 2, 16, 9, 0).toISOString()
    const ends = new Date(2026, 2, 16, 10, 0).toISOString()
    const result = formatTimeRange(starts, ends)
    expect(result).toContain('–')
    expect(result).toMatch(/AM|PM/i)
  })
})
