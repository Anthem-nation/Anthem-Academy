import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScheduleCalendar } from './_components/ScheduleCalendar'
import type { ScheduleSession } from './_components/ScheduleCalendar'

export default async function StudentSchedulePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // enrolled cohort IDs (active only)
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('cohort_id')
    .eq('person_id', user.id)
    .eq('status', 'active')

  const cohortIds = (enrollments ?? []).map((e: { cohort_id: string }) => e.cohort_id)

  // 5-month window: 1 month back → 3 months forward
  const windowStart = new Date()
  windowStart.setMonth(windowStart.getMonth() - 1)
  windowStart.setDate(1)

  const windowEnd = new Date()
  windowEnd.setMonth(windowEnd.getMonth() + 4)
  windowEnd.setDate(0) // last day of +3 month

  let sessions: ScheduleSession[] = []
  if (cohortIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select('id, title, starts_at, ends_at, location, status, cohort_id, cohorts(name)')
      .in('cohort_id', cohortIds)
      .gte('starts_at', windowStart.toISOString())
      .lte('starts_at', windowEnd.toISOString())
      .order('starts_at')

    sessions = (data ?? []).map((s) => ({
      id: s.id as string,
      title: s.title as string,
      starts_at: s.starts_at as string,
      ends_at: s.ends_at as string,
      location: (s.location ?? null) as string | null,
      status: s.status as string,
      cohort_name: (Array.isArray(s.cohorts) ? s.cohorts[0]?.name : (s.cohorts as { name: string } | null)?.name) ?? '',
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Schedule</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your enrolled sessions</p>
      </div>
      <ScheduleCalendar sessions={sessions} hasEnrollments={cohortIds.length > 0} />
    </div>
  )
}
