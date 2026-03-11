import Link from 'next/link'

const pillars = [
  {
    icon: '🪪',
    title: 'Identity & Roles',
    description:
      'Multi-org RBAC with org-scoped permissions. Students, instructors, admins, and partners — each with the right access.',
  },
  {
    icon: '📚',
    title: 'Program Delivery',
    description:
      'Course library, cohort management, session scheduling, and gated learning paths with progress tracking.',
  },
  {
    icon: '✅',
    title: 'Compliance & Attendance',
    description:
      'QR-based check-in, real-time dashboards, late/absent flagging, and immutable audit trails.',
  },
  {
    icon: '🧠',
    title: 'Learning Layer',
    description:
      'Quizzes, projects, reflections, and rubric-based grading. AI-assisted content tagging to STEM/SEL competencies.',
  },
  {
    icon: '📈',
    title: 'Growth & Competency',
    description:
      'Skill Passport with competency radar chart. Evidence-based level advancement from 1–5 across STEM and SEL.',
  },
  {
    icon: '🏅',
    title: 'Credentialing',
    description:
      'Auto-issued badges and certificates on completion. Portable, verifiable credentials for every participant.',
  },
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
            <Link href="#pillars" className="text-sm text-muted-foreground hover:text-foreground">
              Platform
            </Link>
            <Link href="#roles" className="text-sm text-muted-foreground hover:text-foreground">
              Who it&apos;s for
            </Link>
            <Link href="/design" className="text-sm text-muted-foreground hover:text-foreground">
              Design System
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
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
        <div className="relative mx-auto max-w-4xl">
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
              href="/design"
              className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white hover:bg-white/20 transition-colors"
            >
              View design system →
            </Link>
          </div>
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
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-lg border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-2xl">
                  {pillar.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
              </div>
            ))}
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
              { role: 'Student', desc: 'Schedule, courses, Skill Passport, credentials', emoji: '🎓' },
              { role: 'Instructor', desc: 'Cohort rosters, grading, attendance', emoji: '👩‍🏫' },
              { role: 'Site Ops', desc: 'Kiosk QR check-in, real-time dashboards', emoji: '📱' },
              { role: 'Admin', desc: 'Org-wide reporting, user management, compliance', emoji: '🏛️' },
            ].map((item) => (
              <div
                key={item.role}
                className="rounded-lg border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
              >
                <div className="mb-3 text-3xl">{item.emoji}</div>
                <h3 className="mb-2 text-lg font-semibold text-accent">{item.role}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold text-foreground">Ready to get started?</h2>
          <p className="mx-auto mt-4 text-muted-foreground">
            Anthem Academy is currently in active development. Request early access to be
            part of the pilot program.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-md bg-primary px-8 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Request early access
          </Link>
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
          <Link href="/design" className="text-xs text-primary hover:underline">
            Design System Preview →
          </Link>
        </div>
      </footer>
    </div>
  )
}
