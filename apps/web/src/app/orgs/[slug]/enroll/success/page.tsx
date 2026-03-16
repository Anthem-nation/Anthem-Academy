import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enrollment Confirmed | Anthem Academy',
}

export default async function EnrollSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-foreground">You&apos;re enrolled!</h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Check your email to confirm your account — your enrollment is pending until confirmed.
        </p>
        <Link
          href={`/orgs/${slug}`}
          className="inline-block rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Back to Programs
        </Link>
      </div>
    </div>
  )
}
