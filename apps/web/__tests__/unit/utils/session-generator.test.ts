import { describe, it, expect } from 'vitest'
import { generateSessionDates } from '@/lib/utils/session-generator'
import type { SessionTemplate } from '@/lib/utils/session-generator'

const BASE_TEMPLATE: SessionTemplate = {
  title: 'Weekly Training',
  weekdays: [0], // Monday
  startTime: '09:00',
  durationMinutes: 60,
  location: 'Room 101',
}

describe('generateSessionDates', () => {
  it('generates correct sessions for a weekly Monday schedule', () => {
    const sessions = generateSessionDates(BASE_TEMPLATE, '2026-01-05', '2026-01-26')
    // 2026-01-05 is a Monday; mondays in range: Jan 5, 12, 19, 26
    expect(sessions).toHaveLength(4)
    expect(sessions[0].title).toBe('Weekly Training')
    expect(sessions[0].location).toBe('Room 101')
  })

  it('sessions all fall within cohort start/end boundaries', () => {
    const sessions = generateSessionDates(BASE_TEMPLATE, '2026-01-05', '2026-01-19')
    for (const s of sessions) {
      const startsAt = new Date(s.starts_at)
      expect(startsAt >= new Date('2026-01-05')).toBe(true)
      expect(startsAt <= new Date('2026-01-19T23:59:59')).toBe(true)
    }
  })

  it('ends_at equals starts_at plus durationMinutes', () => {
    const sessions = generateSessionDates(BASE_TEMPLATE, '2026-01-05', '2026-01-05')
    expect(sessions).toHaveLength(1)
    const start = new Date(sessions[0].starts_at).getTime()
    const end   = new Date(sessions[0].ends_at).getTime()
    expect(end - start).toBe(60 * 60_000)
  })

  it('generates sessions on each specified weekday when multiple days selected', () => {
    // Mon=0, Wed=2 → two sessions per week
    const template: SessionTemplate = { ...BASE_TEMPLATE, weekdays: [0, 2] }
    // Week of Jan 5: Mon Jan 5, Wed Jan 7
    const sessions = generateSessionDates(template, '2026-01-05', '2026-01-11')
    expect(sessions).toHaveLength(2)
    // Check days: Monday = day 1, Wednesday = day 3 in JS (0=Sun)
    const days = sessions.map(s => new Date(s.starts_at).getDay())
    expect(days).toContain(1) // Monday
    expect(days).toContain(3) // Wednesday
  })

  it('returns empty array when no weekdays selected', () => {
    const template: SessionTemplate = { ...BASE_TEMPLATE, weekdays: [] }
    const sessions = generateSessionDates(template, '2026-01-05', '2026-01-26')
    expect(sessions).toHaveLength(0)
  })

  it('returns empty array when cohort has zero-length date range (end before start)', () => {
    const sessions = generateSessionDates(BASE_TEMPLATE, '2026-01-26', '2026-01-05')
    expect(sessions).toHaveLength(0)
  })
})
