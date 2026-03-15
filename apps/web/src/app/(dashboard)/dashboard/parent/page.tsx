import { CheckSquare, BookOpen, Star, Award } from 'lucide-react'

const stats = [
  { label: 'Attendance', value: '88%', delta: '+2% this month', icon: CheckSquare },
  { label: 'Courses', value: '2', delta: 'Active this term', icon: BookOpen },
  { label: 'Skill Level', value: '1', delta: 'Level 2 in progress', icon: Star },
  { label: 'Credentials', value: '0', delta: 'First one coming soon', icon: Award },
]

const recentSessions = [
  { date: 'Mar 14', course: 'Introduction to Python', status: 'Present', duration: '90 min' },
  { date: 'Mar 12', course: 'Financial Literacy 101', status: 'Present', duration: '60 min' },
  { date: 'Mar 10', course: 'Introduction to Python', status: 'Absent', duration: '—' },
  { date: 'Mar 7', course: 'Financial Literacy 101', status: 'Present', duration: '60 min' },
]

const progressSummary = [
  { competency: 'Computational Thinking', level: 1, progress: 60 },
  { competency: 'Financial Literacy', level: 1, progress: 45 },
  { competency: 'Communication', level: 1, progress: 30 },
]

const statusColor: Record<string, string> = {
  Present: 'text-success',
  Absent: 'text-destructive',
}

export default function ParentPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground">Parent Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tracking progress for your child — Spring 2026.
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
        {/* Recent sessions */}
        <div
          className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-6"
          style={{ animationDelay: '375ms' }}
        >
          <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>
          <ul className="mt-4 divide-y divide-border">
            {recentSessions.map((session, i) => (
              <li key={i} className="flex items-start justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{session.course}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.date} · {session.duration}
                  </p>
                </div>
                <span
                  className={`ml-4 flex-shrink-0 text-xs font-semibold ${statusColor[session.status] ?? 'text-muted-foreground'}`}
                >
                  {session.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Progress summary */}
        <div
          className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-6"
          style={{ animationDelay: '450ms' }}
        >
          <h2 className="text-lg font-semibold text-foreground">Progress Summary</h2>
          <ul className="mt-4 space-y-5">
            {progressSummary.map((item) => (
              <li key={item.competency}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{item.competency}</p>
                  <span className="text-xs text-muted-foreground">Level {item.level}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.progress}% to next level</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
