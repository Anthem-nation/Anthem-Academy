import Link from 'next/link'
import { LoginForm } from './LoginForm'

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string; redirectTo?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen">
      {/* Left panel — Midnight Navy branding */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between bg-sidebar p-12 text-sidebar-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-base font-bold text-white">A</span>
          </div>
          <span className="text-lg font-bold">Anthem Academy</span>
        </div>

        <div>
          <blockquote className="text-2xl font-semibold leading-snug text-white">
            &ldquo;Empowering every student with the tools to learn, grow, and succeed.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-sidebar-foreground/60">
            One platform. Every youth program.
          </p>
        </div>

        <div className="space-y-2">
          {['Program Delivery', 'Attendance Tracking', 'Skill Passports', 'Credentialing'].map(
            (feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {feature}
              </div>
            )
          )}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-lg font-bold text-foreground">Anthem Academy</span>
        </div>

        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            {params.error && (
              <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {params.error}
              </div>
            )}
            {params.message === 'check-email' && (
              <div className="mb-4 rounded-lg bg-info/10 px-4 py-3 text-sm text-info">
                Check your email for a confirmation link before signing in.
              </div>
            )}

            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
