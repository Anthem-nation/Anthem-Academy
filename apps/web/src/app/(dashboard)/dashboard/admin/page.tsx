import Link from 'next/link'
import { Users, Building2, BookOpen, UserCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: studentCount },
    { count: orgCount },
    { count: programCount },
    { count: totalPersons },
    { data: recentPersons },
  ] = await Promise.all([
    supabase
      .from('persons')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student'),
    supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .is('archived_at', null),
    supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('persons')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('persons')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    {
      label: 'Total Students',
      value: studentCount != null ? String(studentCount) : '—',
      delta: 'Across all orgs',
      icon: Users,
    },
    {
      label: 'Active Orgs',
      value: orgCount != null ? String(orgCount) : '—',
      delta: 'Non-archived',
      icon: Building2,
    },
    {
      label: 'Active Programs',
      value: programCount != null ? String(programCount) : '—',
      delta: 'Currently running',
      icon: BookOpen,
    },
    {
      label: 'Platform Users',
      value: totalPersons != null ? String(totalPersons) : '—',
      delta: 'All roles',
      icon: UserCircle2,
    },
  ]

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
            {!recentPersons || recentPersons.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No signups yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Name</th>
                    <th className="pb-2 font-medium text-muted-foreground">Role</th>
                    <th className="pb-2 font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentPersons.map((person) => (
                    <tr key={person.id}>
                      <td className="py-2.5">
                        <p className="font-medium text-foreground">{person.full_name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{person.email}</p>
                      </td>
                      <td className="py-2.5">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                          {person.role}
                        </span>
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {new Date(person.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div
          className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-6"
          style={{ animationDelay: '450ms' }}
        >
          <h2 className="text-lg font-semibold text-foreground">Quick Links</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/dashboard/admin/orgs" className="text-primary hover:underline">
                Manage Organizations →
              </Link>
            </li>
            <li>
              <Link href="/dashboard/admin/users" className="text-primary hover:underline">
                Manage Users →
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
