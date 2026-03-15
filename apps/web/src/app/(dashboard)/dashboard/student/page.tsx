import { BookOpen, CheckSquare, Star, Award } from 'lucide-react'

const stats = [
  { label: 'Courses Enrolled', value: '3', delta: '+1 this month', icon: BookOpen },
  { label: 'Attendance Rate', value: '92%', delta: '+3% this month', icon: CheckSquare },
  { label: 'Skill Level', value: '2', delta: 'Level 3 in progress', icon: Star },
  { label: 'Credentials', value: '1', delta: 'Earned this term', icon: Award },
]

const upcomingSessions = [
  { date: 'Mon Mar 16', course: 'Introduction to Python', location: 'Room 101' },
  { date: 'Wed Mar 18', course: 'Financial Literacy 101', location: 'Room 204' },
  { date: 'Fri Mar 20', course: 'Leadership Seminar', location: 'Main Hall' },
]

const recentActivity = [
  { action: 'Completed quiz', detail: 'Python Variables & Types', time: '2h ago' },
  { action: 'Attendance marked', detail: 'Financial Literacy 101', time: '1d ago' },
  { action: 'Level milestone', detail: 'Skill Level 2 unlocked', time: '3d ago' },
  { action: 'Credential issued', detail: 'Digital Literacy Certificate', time: '5d ago' },
  { action: 'Course enrolled', detail: 'Leadership Seminar', time: '1w ago' },
]

export default function StudentPage() {
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
          <ul className="mt-4 divide-y divide-border">
            {upcomingSessions.map((session) => (
              <li key={session.date} className="flex items-start justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{session.course}</p>
                  <p className="text-xs text-muted-foreground">{session.location}</p>
                </div>
                <span className="ml-4 flex-shrink-0 text-xs text-muted-foreground">
                  {session.date}
                </span>
              </li>
            ))}
          </ul>
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
