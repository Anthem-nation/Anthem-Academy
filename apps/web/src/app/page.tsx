import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Anthem Academy
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Multi-org education and operations platform for youth programs.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Sign in
          </Link>
          <Link href="/signup" className="text-sm font-semibold leading-6 text-foreground">
            Create account <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
