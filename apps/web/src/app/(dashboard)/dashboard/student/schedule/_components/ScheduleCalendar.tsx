'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  getWeekStart,
  getWeekDays,
  getMonthGrid,
  getSessionsForDay,
  formatTimeRange,
} from '@/lib/utils/schedule-helpers'

export interface ScheduleSession {
  id: string
  title: string
  starts_at: string
  ends_at: string
  location: string | null
  status: string
  cohort_name: string
}

interface Props {
  sessions: ScheduleSession[]
  hasEnrollments: boolean
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-indigo-500',
  in_progress: 'bg-green-500',
  completed: 'bg-gray-400',
  cancelled: 'bg-red-500',
}

const DAY_HEADERS_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_HEADERS_MONTH = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function isToday(date: Date): boolean {
  const t = new Date()
  return (
    date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate()
  )
}

function formatMonthTitle(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatWeekTitle(weekStart: Date): string {
  return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export function ScheduleCalendar({ sessions, hasEnrollments }: Props) {
  const [view, setView] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(() => new Date())

  function goBack() {
    setCurrentDate(prev => {
      const d = new Date(prev)
      if (view === 'week') d.setDate(d.getDate() - 7)
      else d.setMonth(d.getMonth() - 1)
      return d
    })
  }

  function goForward() {
    setCurrentDate(prev => {
      const d = new Date(prev)
      if (view === 'week') d.setDate(d.getDate() + 7)
      else d.setMonth(d.getMonth() + 1)
      return d
    })
  }

  function goToday() {
    setCurrentDate(new Date())
  }

  if (!hasEnrollments) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">You&apos;re not enrolled in any cohorts yet.</p>
      </div>
    )
  }

  const weekStart = getWeekStart(currentDate)
  const weekDays = getWeekDays(weekStart)
  const monthGrid = getMonthGrid(currentDate.getFullYear(), currentDate.getMonth())

  const title = view === 'week' ? formatWeekTitle(weekStart) : formatMonthTitle(currentDate)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[180px] text-center text-sm font-medium text-foreground">{title}</span>
          <button
            onClick={goForward}
            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={goToday}
            className="ml-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Today
          </button>
        </div>

        {/* View toggle */}
        <div className="flex rounded-md border border-border overflow-hidden">
          {(['week', 'month'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-4 py-1.5 text-xs font-medium transition-colors capitalize',
                view === v
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      {view === 'week' ? (
        <WeekView days={weekDays} sessions={sessions} />
      ) : (
        <MonthView
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          grid={monthGrid}
          sessions={sessions}
        />
      )}
    </div>
  )
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({ days, sessions }: { days: Date[]; sessions: ScheduleSession[] }) {
  const hasAnySessions = days.some(d => getSessionsForDay(sessions, d).length > 0)

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <div className="min-w-[640px]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {days.map((day, i) => (
            <div
              key={i}
              className={cn(
                'px-2 py-3 text-center text-xs font-medium',
                isToday(day) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              )}
            >
              <div>{DAY_HEADERS_WEEK[i]}</div>
              <div
                className={cn(
                  'mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold',
                  isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground'
                )}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="grid grid-cols-7 divide-x divide-border">
          {days.map((day, i) => {
            const daySessions = getSessionsForDay(sessions, day)
            return (
              <div
                key={i}
                className={cn(
                  'min-h-[120px] p-2 space-y-1.5',
                  isToday(day) ? 'bg-primary/5' : ''
                )}
              >
                {daySessions.map(s => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {!hasAnySessions && (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No sessions this week.
        </div>
      )}
    </div>
  )
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({
  year,
  month,
  grid,
  sessions,
}: {
  year: number
  month: number
  grid: Date[]
  sessions: ScheduleSession[]
}) {
  const hasAnySessions = grid.some(d => getSessionsForDay(sessions, d).length > 0)

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Day-of-week headers (Sun–Sat for month grid) */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {DAY_HEADERS_MONTH.map(h => (
          <div key={h} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {h}
          </div>
        ))}
      </div>

      {/* 6 rows × 7 cols */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border">
        {grid.map((day, i) => {
          const isCurrentMonth = day.getMonth() === month && day.getFullYear() === year
          const daySessions = getSessionsForDay(sessions, day)
          const overflow = daySessions.length - 3

          return (
            <div
              key={i}
              className={cn(
                'min-h-[80px] p-1.5',
                isToday(day) ? 'bg-primary/5' : '',
                !isCurrentMonth ? 'opacity-40' : ''
              )}
            >
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  isToday(day)
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'text-foreground'
                )}
              >
                {day.getDate()}
              </span>

              <div className="mt-0.5 space-y-0.5">
                {daySessions.slice(0, 3).map(s => (
                  <div
                    key={s.id}
                    className={cn(
                      'truncate rounded px-1 py-0.5 text-[10px] font-medium text-white',
                      STATUS_COLORS[s.status] ?? 'bg-indigo-500'
                    )}
                    title={s.title}
                  >
                    {s.title}
                  </div>
                ))}
                {overflow > 0 && (
                  <div className="text-[10px] text-muted-foreground pl-1">+{overflow} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!hasAnySessions && (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No sessions this month.
        </div>
      )}
    </div>
  )
}

// ─── Session Card (week view) ─────────────────────────────────────────────────

function SessionCard({ session }: { session: ScheduleSession }) {
  const dotColor = STATUS_COLORS[session.status] ?? 'bg-indigo-500'

  return (
    <div className="rounded-md border border-border bg-background p-2 text-xs space-y-1">
      <div className="flex items-start gap-1.5">
        <span className={cn('mt-0.5 h-2 w-2 flex-shrink-0 rounded-full', dotColor)} />
        <span className="font-medium text-foreground leading-tight">{session.title}</span>
      </div>
      <div className="text-muted-foreground pl-3.5">
        {formatTimeRange(session.starts_at, session.ends_at)}
      </div>
      {session.location && (
        <div className="flex items-center gap-1 pl-3.5 text-muted-foreground">
          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
          <span className="truncate">{session.location}</span>
        </div>
      )}
      {session.cohort_name && (
        <div className="pl-3.5">
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {session.cohort_name}
          </span>
        </div>
      )}
    </div>
  )
}
