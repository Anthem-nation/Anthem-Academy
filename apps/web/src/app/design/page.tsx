// Design System Preview — for review only, not part of the production app
import Link from 'next/link'

const brandColors = [
  { name: 'Terracotta', hex: '#D0744B', label: 'Primary / CTA', class: 'bg-primary' },
  { name: 'Midnight Navy', hex: '#111C30', label: 'Sidebar / Dark BG', class: 'bg-sidebar' },
  { name: 'Deep Navy', hex: '#15465F', label: 'Dark Cards', class: 'bg-brand-navy' },
  { name: 'Gold', hex: '#F9AC02', label: 'Accent / Achievement', class: 'bg-accent' },
  { name: 'Brand Red', hex: '#ED1C24', label: 'Error / Destructive', class: 'bg-destructive' },
  { name: 'Brand Blue', hex: '#0088CB', label: 'Info', class: 'bg-info' },
  { name: 'Brand Yellow', hex: '#FFCB05', label: 'Logo accent', class: 'bg-brand-yellow' },
  { name: 'Success', hex: '#10B981', label: 'Success states', class: 'bg-success' },
]

const neutralColors = [
  { name: 'Off-White', hex: '#F3F1F2', label: 'Background', dark: false },
  { name: 'White', hex: '#FFFFFF', label: 'Card surface', dark: false },
  { name: 'Light Gray', hex: '#E3E3E3', label: 'Border', dark: false },
  { name: 'Charcoal', hex: '#4F4F4F', label: 'Body text', dark: true },
  { name: 'Dark Brown', hex: '#26140A', label: 'Secondary text', dark: true },
  { name: 'Black', hex: '#000000', label: 'Primary text', dark: true },
]

export default function DesignPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-sidebar px-8 py-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Anthem Academy
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">Design System Preview</h1>
            <p className="mt-1 text-sm text-white/60">
              Brand colors, typography, and components — for review
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-8 py-12">

        {/* Brand Colors */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Brand Colors</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Extracted from theanthemacademy.org CSS variables
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {brandColors.map((color) => (
              <div key={color.hex} className="overflow-hidden rounded-lg border border-border">
                <div
                  className="h-20 w-full"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="bg-card p-3">
                  <p className="text-sm font-semibold text-foreground">{color.name}</p>
                  <p className="text-xs text-muted-foreground">{color.label}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Neutral Colors */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Neutral Scale</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Warm-tinted neutrals with slight brown undertone from brand identity
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
            {neutralColors.map((color) => (
              <div key={color.hex} className="overflow-hidden rounded-lg border border-border">
                <div
                  className="h-16 w-full"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="bg-card p-3">
                  <p className="text-xs font-semibold text-foreground">{color.name}</p>
                  <p className="text-xs text-muted-foreground">{color.label}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Typography</h2>
          <p className="mb-8 text-sm text-muted-foreground">Inter — all weights, all sizes</p>
          <div className="space-y-6 rounded-lg border border-border bg-card p-8">
            <div>
              <p className="mb-1 font-mono text-xs text-muted-foreground">text-5xl / font-bold</p>
              <p className="text-5xl font-bold text-foreground">Anthem Academy</p>
            </div>
            <div>
              <p className="mb-1 font-mono text-xs text-muted-foreground">text-3xl / font-bold</p>
              <p className="text-3xl font-bold text-foreground">Six pillars, one system</p>
            </div>
            <div>
              <p className="mb-1 font-mono text-xs text-muted-foreground">text-xl / font-semibold</p>
              <p className="text-xl font-semibold text-foreground">Program Delivery</p>
            </div>
            <div>
              <p className="mb-1 font-mono text-xs text-muted-foreground">text-base / font-normal</p>
              <p className="text-base text-foreground">
                Anthem Academy unifies enrollment, attendance, learning, competency tracking,
                and credentialing into a single coherent system.
              </p>
            </div>
            <div>
              <p className="mb-1 font-mono text-xs text-muted-foreground">text-sm / muted</p>
              <p className="text-sm text-muted-foreground">
                Session details · Attendance record · 14px dashboard data
              </p>
            </div>
            <div>
              <p className="mb-1 font-mono text-xs text-muted-foreground">text-xs / uppercase / tracking</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Platform Capabilities
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Buttons</h2>
          <p className="mb-8 text-sm text-muted-foreground">All button variants</p>
          <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-card p-8">
            <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Primary
            </button>
            <button className="rounded-md border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-secondary transition-colors">
              Secondary
            </button>
            <button className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity">
              Accent / Gold
            </button>
            <button className="rounded-md bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 transition-opacity">
              Destructive
            </button>
            <button className="rounded-md bg-muted px-5 py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed">
              Disabled
            </button>
            <button className="rounded-md bg-sidebar px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              Dark / Navy
            </button>
          </div>
          {/* Buttons on dark */}
          <div className="mt-4 flex flex-wrap gap-4 rounded-lg bg-sidebar p-8">
            <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              Primary on dark
            </button>
            <button className="rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
              Ghost on dark
            </button>
            <button className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity">
              Gold on dark
            </button>
          </div>
        </section>

        {/* Status Badges */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Status Badges</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Attendance, submissions, approval states
          </p>
          <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-8">
            {[
              { label: 'Present', color: 'bg-success text-white' },
              { label: 'Absent', color: 'bg-destructive text-white' },
              { label: 'Late', color: 'bg-warning text-warning-foreground' },
              { label: 'Pending', color: 'bg-info text-white' },
              { label: 'Completed', color: 'bg-success text-white' },
              { label: 'Overdue', color: 'bg-destructive text-white' },
              { label: 'In Progress', color: 'bg-info text-white' },
              { label: 'Excused', color: 'bg-muted text-muted-foreground' },
              { label: 'Level 3', color: 'bg-accent text-accent-foreground' },
              { label: '🏅 Certified', color: 'bg-accent text-accent-foreground' },
            ].map((badge) => (
              <span
                key={badge.label}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Cards</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Dashboard card patterns
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Stat card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Total Students
              </p>
              <p className="mt-2 text-4xl font-bold text-foreground">248</p>
              <p className="mt-1 text-sm text-success">↑ 12% this month</p>
            </div>
            {/* Stat card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Attendance Rate
              </p>
              <p className="mt-2 text-4xl font-bold text-foreground">91%</p>
              <p className="mt-1 text-sm text-warning">↓ 2% vs last week</p>
            </div>
            {/* Stat card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Credentials Issued
              </p>
              <p className="mt-2 text-4xl font-bold text-foreground">64</p>
              <p className="mt-1 text-sm text-muted-foreground">This cohort</p>
            </div>
            {/* Achievement card */}
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-6">
              <div className="mb-3 text-3xl">🏅</div>
              <p className="font-semibold text-foreground">Digital Literacy Badge</p>
              <p className="mt-1 text-sm text-muted-foreground">Earned on completion of Module 4</p>
              <span className="mt-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                Verified
              </span>
            </div>
            {/* Skill passport card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Skill Passport
              </p>
              {[
                { skill: 'Communication', level: 3, max: 5 },
                { skill: 'Problem Solving', level: 4, max: 5 },
                { skill: 'Data Literacy', level: 2, max: 5 },
              ].map((item) => (
                <div key={item.skill} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">{item.skill}</span>
                    <span className="text-muted-foreground">Level {item.level}/{item.max}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(item.level / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Attendance card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Today&apos;s Attendance
              </p>
              <div className="space-y-2">
                {[
                  { name: 'Jaylen Brown', status: 'Present', color: 'text-success' },
                  { name: 'Maria Santos', status: 'Late', color: 'text-warning' },
                  { name: 'Devon Clarke', status: 'Absent', color: 'text-destructive' },
                  { name: 'Priya Nair', status: 'Present', color: 'text-success' },
                ].map((student) => (
                  <div key={student.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{student.name}</span>
                    <span className={`font-medium ${student.color}`}>{student.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Layout Preview */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Dashboard Layout</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Sidebar (always Midnight Navy) + main content structure
          </p>
          <div className="overflow-hidden rounded-lg border border-border" style={{ height: 400 }}>
            <div className="flex h-full">
              {/* Sidebar */}
              <aside className="flex w-56 flex-shrink-0 flex-col bg-sidebar p-4">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
                    <span className="text-xs font-bold text-white">A</span>
                  </div>
                  <span className="text-sm font-bold text-white">Anthem Academy</span>
                </div>
                <nav className="flex-1 space-y-1">
                  {[
                    { label: 'Dashboard', active: true },
                    { label: 'Students', active: false },
                    { label: 'Attendance', active: false },
                    { label: 'Courses', active: false },
                    { label: 'Credentials', active: false },
                    { label: 'Reports', active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
                        item.active
                          ? 'bg-primary text-white'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </div>
                  ))}
                </nav>
                <div className="mt-auto pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/60" />
                    <div>
                      <p className="text-xs font-medium text-white">Nishanth</p>
                      <p className="text-xs text-white/40">Admin</p>
                    </div>
                  </div>
                </div>
              </aside>
              {/* Main */}
              <main className="flex-1 overflow-auto bg-background p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground">Good morning, Nishanth 👋</h3>
                  <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening today</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Students', val: '248', trend: '↑ 12%', color: 'text-success' },
                    { label: 'Attendance', val: '91%', trend: '↓ 2%', color: 'text-warning' },
                    { label: 'Credentials', val: '64', trend: 'this cohort', color: 'text-muted-foreground' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border bg-card p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{s.val}</p>
                      <p className={`text-xs mt-1 ${s.color}`}>{s.trend}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">Today&apos;s Sessions</p>
                  {[
                    { name: 'Web Development 101', time: '9:00 AM', status: 'In Progress', color: 'bg-info' },
                    { name: 'Data Literacy', time: '11:00 AM', status: 'Upcoming', color: 'bg-muted' },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center justify-between py-2 border-t border-border first:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.time}</p>
                      </div>
                      <span className={`rounded-full ${s.color} px-2 py-0.5 text-xs text-white font-medium`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-8 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Design System Preview · Anthem Academy · March 2026
        </p>
      </footer>
    </div>
  )
}
