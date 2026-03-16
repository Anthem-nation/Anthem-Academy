import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { getOrgCatalog } from '@/lib/queries/catalog'
import type { CatalogProgram } from '@/lib/queries/catalog'
import type { Cohort } from '@/types'

export const revalidate = 60

export async function generateStaticParams() {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('organizations')
    .select('slug')
    .eq('is_active', true)
    .is('archived_at', null)
  return (data ?? []).map((o: { slug: string }) => ({ slug: o.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('organizations')
    .select('name')
    .eq('slug', slug)
    .single()
  return {
    title: data ? `${data.name} — Programs | Anthem Academy` : 'Programs | Anthem Academy',
    description: `Browse programs offered by ${data?.name ?? 'this organization'}.`,
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function CohortRow({ cohort }: { cohort: Cohort }) {
  const start = formatDate(cohort.start_date)
  const end = formatDate(cohort.end_date)
  const dateRange = start && end ? `${start} – ${end}` : start ?? end ?? 'Dates TBD'

  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            cohort.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {cohort.status}
        </span>
        <span className="truncate font-medium text-foreground">{cohort.name}</span>
      </div>
      <div className="shrink-0 text-right text-muted-foreground">
        <div>{dateRange}</div>
        {cohort.capacity != null && (
          <div className="text-xs">{cohort.capacity} seats</div>
        )}
      </div>
    </div>
  )
}

function ProgramCard({
  program,
  orgSlug,
}: {
  program: CatalogProgram
  orgSlug: string
}) {
  const ageRange =
    program.min_age != null && program.max_age != null
      ? `Ages ${program.min_age}–${program.max_age}`
      : program.min_age != null
        ? `Ages ${program.min_age}+`
        : program.max_age != null
          ? `Up to age ${program.max_age}`
          : null

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">{program.name}</h3>
        {program.subject && (
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-primary">
            {program.subject}
          </span>
        )}
      </div>

      {program.description && (
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {program.description}
        </p>
      )}

      {ageRange && (
        <p className="mb-4 text-xs font-medium text-muted-foreground">{ageRange}</p>
      )}

      <div className="mt-auto">
        {program.cohorts.length > 0 ? (
          <div className="mb-4 space-y-2">
            {program.cohorts.map((cohort) => (
              <CohortRow key={cohort.id} cohort={cohort} />
            ))}
          </div>
        ) : (
          <p className="mb-4 text-sm italic text-muted-foreground">Schedule coming soon</p>
        )}

        <Link
          href={`/orgs/${orgSlug}/enroll?program=${program.id}`}
          className="block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Enroll Now
        </Link>
      </div>
    </div>
  )
}

export default async function OrgCatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createPublicClient()
  const { data } = await getOrgCatalog(supabase, slug)

  if (!data) notFound()

  const { org, programs } = data

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            {org.logo_url && (
              <Image
                src={org.logo_url}
                alt={`${org.name} logo`}
                width={64}
                height={64}
                className="rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{org.name}</h1>
              <p className="text-sm text-muted-foreground">@{org.slug}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Programs */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-8 text-xl font-semibold text-foreground">Programs</h2>

        {programs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card px-8 py-16 text-center">
            <p className="text-muted-foreground">No active programs available.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} orgSlug={org.slug} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
