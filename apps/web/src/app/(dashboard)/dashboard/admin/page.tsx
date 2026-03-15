import { Users, Building2, BookOpen, ShieldCheck } from 'lucide-react'

const stats = [
  { label: 'Total Students', value: '48', delta: '+6 this month', icon: Users },
  { label: 'Organizations', value: '3', delta: 'Active orgs', icon: Building2 },
  { label: 'Active Programs', value: '6', delta: '2 new this term', icon: BookOpen },
  { label: 'Compliance Rate', value: '97%', delta: '+2% this month', icon: ShieldCheck },
]

const recentSignups = [
  { name: 'Jordan Williams', role: 'Student', org: 'Downtown Youth Center', date: 'Mar 14' },
  { name: 'Priya Sharma', role: 'Student', org: 'East Side Academy', date: 'Mar 13' },
  { name: 'Marcus Johnson', role: 'Staff', org: 'Downtown Youth Center', date: 'Mar 12' },
  { name: 'Aisha Patel', role: 'Student', org: 'Northside STEM Hub', date: 'Mar 11' },
  { name: 'Tyler Chen', role: 'Student', org: 'East Side Academy', date: 'Mar 10' },
]

const programs = [
  { name: 'Introduction to Python', enrolled: 18, capacity: 25, org: 'Downtown Youth Center' },
  { name: 'Financial Literacy 101', enrolled: 22, capacity: 30, org: 'East Side Academy' },
  { name: 'Leadership Seminar', enrolled: 15, capacity: 20, org: 'Northside STEM Hub' },
]

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform overview — all organizations.
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
        {/* Recent signups */}
        <div
          className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-6"
          style={{ animationDelay: '375ms' }}
        >
          <h2 className="text-lg font-semibold text-foreground">Recent Signups</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-muted-foreground">Name</th>
                  <th className="pb-2 font-medium text-muted-foreground">Role</th>
                  <th className="pb-2 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentSignups.map((signup) => (
                  <tr key={signup.name}>
                    <td className="py-2.5">
                      <p className="font-medium text-foreground">{signup.name}</p>
                      <p className="text-xs text-muted-foreground">{signup.org}</p>
                    </td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {signup.role}
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{signup.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Program overview */}
        <div
          className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-6"
          style={{ animationDelay: '450ms' }}
        >
          <h2 className="text-lg font-semibold text-foreground">Program Overview</h2>
          <ul className="mt-4 space-y-4">
            {programs.map((prog) => {
              const pct = Math.round((prog.enrolled / prog.capacity) * 100)
              return (
                <li key={prog.name}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{prog.name}</p>
                      <p className="text-xs text-muted-foreground">{prog.org}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {prog.enrolled}/{prog.capacity}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
