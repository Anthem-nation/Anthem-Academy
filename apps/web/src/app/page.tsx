import Link from 'next/link'
import { BookOpen, Shield, Brain, TrendingUp, Award, Users } from 'lucide-react'

const pillars = [
  {
    icon: Users,
    title: 'Identity & Roles',
    description:
      'Multi-org RBAC with org-scoped permissions. Students, instructors, admins, and partners — each with the right access.',
  },
  {
    icon: BookOpen,
    title: 'Program Delivery',
    description:
      'Course library, cohort management, session scheduling, and gated learning paths with progress tracking.',
  },
  {
    icon: Shield,
    title: 'Compliance & Attendance',
    description:
      'QR-based check-in, real-time dashboards, late/absent flagging, and immutable audit trails.',
  },
  {
    icon: Brain,
    title: 'Learning Layer',
    description:
      'Quizzes, projects, reflections, and rubric-based grading. AI-assisted content tagging to STEM/SEL competencies.',
  },
  {
    icon: TrendingUp,
    title: 'Growth & Competency',
    description:
      'Skill Passport with competency radar chart. Evidence-based level advancement from 1–5 across STEM and SEL.',
  },
  {
    icon: Award,
    title: 'Credentialing',
    description:
      'Auto-issued badges and certificates on completion. Portable, verifiable credentials for every participant.',
  },
]

const stats = [
  { value: '500+', label: 'Students' },
  { value: '12', label: 'Orgs' },
  { value: '6', label: 'Programs' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span className="text-lg font-bold text-foreground">Anthem Academy</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#pillars" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Platform
            </Link>
            <Link href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Who it&apos;s for
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-sidebar px-6 py-28 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#15465F,_#111C30)]" />
        {/* Subtle animated shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(208,116,75,0.12),transparent)]" />
        <div className="relative mx-auto max-w-4xl animate-fade-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            90-Day Build · MVP in Progress
          </div>
          <h1 className="mt-6 text-5xl font-bold leading-tight text-white md:text-6xl">
            One platform for{' '}
            <span className="text-accent">every youth program</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Anthem Academy unifies enrollment, attendance, learning, competency tracking,
            and credentialing into a single system — built for schools, community orgs,
            and workforce partners.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Request access
            </Link>
            <Link
              href="#pillars"
              className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white hover:bg-white/20 transition-colors"
            >
              See the platform
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center divide-x divide-border">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-12 py-6">
              <span className="text-3xl font-bold text-primary">{stat.value}</span>
              <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Six Pillars */}
      <section id="pillars" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Platform Capabilities
            </p>
            <h2 className="mt-3 text-4xl font-bold text-foreground">Six pillars, one system</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Every feature maps to one of six foundational capabilities. No more fragmented
              spreadsheets or disconnected tools.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className="opacity-0 animate-fade-up rounded-lg border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="roles" className="bg-sidebar px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Built for everyone
            </p>
            <h2 className="mt-3 text-4xl font-bold">A portal for every role</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/60">
              Students, instructors, site ops, admins, and partners all get a tailored
              experience — scoped to exactly what they need.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { role: 'Student', desc: 'Schedule, courses, Skill Passport, credentials' },
              { role: 'Instructor', desc: 'Cohort rosters, grading, attendance' },
              { role: 'Site Ops', desc: 'Kiosk QR check-in, real-time dashboards' },
              { role: 'Admin', desc: 'Org-wide reporting, user management, compliance' },
            ].map((item, i) => (
              <div
                key={item.role}
                className="opacity-0 animate-fade-up rounded-lg border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <h3 className="mb-2 text-lg font-semibold text-accent">{item.role}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="about"
        className="relative overflow-hidden px-6 py-24 text-center"
        style={{ background: 'linear-gradient(135deg, hsl(18 57% 55% / 0.08) 0%, hsl(40 98% 49% / 0.06) 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(208,116,75,0.06),transparent)]" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Early Access
          </p>
          <h2 className="mt-3 text-4xl font-bold text-foreground">Ready to get started?</h2>
          <p className="mx-auto mt-4 text-muted-foreground">
            Anthem Academy is currently in active development. Request early access to be
            part of the pilot program.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-primary px-8 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity shadow-md"
            >
              Request early access
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-border px-8 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Anthem Academy</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Anthem Nation. All rights reserved.
          </p>
          <Link href="#about" className="text-xs text-primary hover:underline">
            Learn more
          </Link>
        </div>
      </footer>
    </div>
  )
}
