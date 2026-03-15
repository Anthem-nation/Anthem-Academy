import { Users, Calendar, ClipboardList, GraduationCap } from 'lucide-react'

const stats = [
  { label: 'My Cohorts', value: '2', delta: 'Active this term', icon: ClipboardList },
  { label: 'Students', value: '24', delta: 'Across all cohorts', icon: Users },
  { label: 'Sessions This Week', value: '5', delta: '2 remaining today', icon: Calendar },
  { label: 'Pending Grades', value: '8', delta: 'Due by Friday', icon: GraduationCap },
]

const todaySchedule = [
  { time: '9:00 AM', course: 'Introduction to Python', room: 'Room 101', students: 12 },
  { time: '1:00 PM', course: 'Financial Literacy 101', room: 'Room 204', students: 14 },
]

const pendingActions = [
  { action: 'Submit grades', detail: 'Python — Quiz 3 (12 students)', priority: 'high' },
  { action: 'Submit grades', detail: 'Financial Literacy — Project 1 (14 students)', priority: 'high' },
  { action: 'Confirm attendance', detail: 'Leadership Seminar — Mar 13', priority: 'medium' },
  { action: 'Review reflection', detail: 'Jordan W. — Module 4 reflection', priority: 'low' },
]

const priorityColor: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-warning/10 text-warning-foreground',
  low: 'bg-muted text-muted-foreground',
}

export default function StaffPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your schedule and pending actions for today.
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
        {/* Today's schedule */}
        <div
          className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-6"
          style={{ animationDelay: '375ms' }}
        >
          <h2 className="text-lg font-semibold text-foreground">Today&apos;s Schedule</h2>
          {todaySchedule.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {todaySchedule.map((session) => (
                <li key={session.time} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{session.course}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.room} · {session.students} students
                    </p>
                  </div>
                  <span className="ml-4 flex-shrink-0 text-xs font-medium text-primary">
                    {session.time}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No sessions scheduled today.</p>
          )}
        </div>

        {/* Pending actions */}
        <div
          className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-6"
          style={{ animationDelay: '450ms' }}
        >
          <h2 className="text-lg font-semibold text-foreground">Pending Actions</h2>
          <ul className="mt-4 space-y-3">
            {pendingActions.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${priorityColor[item.priority]}`}
                >
                  {item.priority}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
