import type { ScheduleSession } from '@/app/(dashboard)/dashboard/student/schedule/_components/ScheduleCalendar'

// Returns Monday of the week containing `date`
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day // adjust so Monday=0
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Returns array of 7 Date objects for the week (Mon–Sun)
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
}

// Returns the 6×7 grid dates for a month calendar (including overflow days)
export function getMonthGrid(year: number, month: number): Date[] {
  // First day of month
  const firstDay = new Date(year, month, 1)
  // day: 0=Sun, 1=Mon ... we want Mon as col 0
  const startDow = firstDay.getDay() // 0=Sun
  const offset = startDow === 0 ? 6 : startDow - 1
  const gridStart = new Date(firstDay)
  gridStart.setDate(1 - offset)

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
}

// Filters sessions to those starting on a given calendar day (local date match)
export function getSessionsForDay(sessions: ScheduleSession[], day: Date): ScheduleSession[] {
  const y = day.getFullYear()
  const m = day.getMonth()
  const d = day.getDate()
  return sessions.filter(s => {
    const sd = new Date(s.starts_at)
    return sd.getFullYear() === y && sd.getMonth() === m && sd.getDate() === d
  })
}

// Formats time range: '9:00 AM – 10:00 AM'
export function formatTimeRange(starts_at: string, ends_at: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  return `${fmt(starts_at)} – ${fmt(ends_at)}`
}
