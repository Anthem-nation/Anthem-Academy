import Link from 'next/link'
import { SignupForm } from './SignupForm'

interface SignupPageProps {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
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
            &ldquo;Join a growing network of youth-focused organizations building the future.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-sidebar-foreground/60">
            500+ students across 12 organizations.
          </p>
        </div>

        <div className="space-y-2">
          {['Free to join', 'Role-based access', 'Portable credentials', 'Progress tracking'].map(
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
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join Anthem Academy to get started
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            {params.error && (
              <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {params.error}
              </div>
            )}

            <SignupForm />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
