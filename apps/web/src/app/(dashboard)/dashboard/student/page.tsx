import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, CheckSquare, Star, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const stats = [
  { label: 'Courses Enrolled', value: '3', delta: '+1 this month', icon: BookOpen },
  { label: 'Attendance Rate', value: '92%', delta: '+3% this month', icon: CheckSquare },
  { label: 'Skill Level', value: '2', delta: 'Level 3 in progress', icon: Star },
  { label: 'Credentials', value: '1', delta: 'Earned this term', icon: Award },
]

const recentActivity = [
  { action: 'Completed quiz', detail: 'Python Variables & Types', time: '2h ago' },
  { action: 'Attendance marked', detail: 'Financial Literacy 101', time: '1d ago' },
  { action: 'Level milestone', detail: 'Skill Level 2 unlocked', time: '3d ago' },
  { action: 'Credential issued', detail: 'Digital Literacy Certificate', time: '5d ago' },
  { action: 'Course enrolled', detail: 'Leadership Seminar', time: '1w ago' },
]

export default async function StudentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // enrolled cohort IDs
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('cohort_id')
    .eq('person_id', user.id)
    .eq('status', 'active')

  const cohortIds = (enrollments ?? []).map((e: { cohort_id: string }) => e.cohort_id)

  // next 5 upcoming sessions
  let upcomingSessions: {
    id: string
    title: string
    starts_at: string
    location: string | null
    cohort_name: string
  }[] = []

  if (cohortIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select('id, title, starts_at, location, cohorts(name)')
      .in('cohort_id', cohortIds)
      .gte('starts_at', new Date().toISOString())
      .in('status', ['scheduled', 'in_progress'])
      .order('starts_at')
      .limit(5)

    upcomingSessions = (data ?? []).map((s) => ({
      id: s.id as string,
      title: s.title as string,
      starts_at: s.starts_at as string,
      location: (s.location ?? null) as string | null,
      cohort_name: (Array.isArray(s.cohorts) ? s.cohorts[0]?.name : (s.cohorts as { name: string } | null)?.name) ?? '',
    }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back — here&apos;s your progress overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-5"
              style={{ animationDelay: `${75 + i * 75}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.delta}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming sessions */}
        <div
          className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-6"
          style={{ animationDelay: '375ms' }}
        >
          <h2 className="text-lg font-semibold text-foreground">Upcoming Sessions</h2>
          {upcomingSessions.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No upcoming sessions.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {upcomingSessions.map(session => (
                <li key={session.id} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.location ?? session.cohort_name}
                    </p>
                  </div>
                  <span className="ml-4 flex-shrink-0 text-xs text-muted-foreground">
                    {new Date(session.starts_at).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 text-right">
            <Link
              href="/dashboard/student/schedule"
              className="text-xs font-medium text-primary hover:underline"
            >
              View Full Schedule →
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div
          className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-6"
          style={{ animationDelay: '450ms' }}
        >
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <ul className="mt-4 space-y-3">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
