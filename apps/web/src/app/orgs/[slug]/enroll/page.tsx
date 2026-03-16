import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { createClient } from '@/lib/supabase/server'
import { getEnrollmentFormData } from '@/lib/queries/enrollment'
import EnrollmentForm from './EnrollmentForm'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ program?: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { program: programId } = await searchParams
  if (!programId) return { title: 'Enroll | Anthem Academy' }

  const supabase = createPublicClient()
  const { data } = await getEnrollmentFormData(supabase, slug, programId)
  if (!data) return { title: 'Enroll | Anthem Academy' }

  return {
    title: `${data.program.name} — Enroll | ${data.org.name}`,
    description: `Enroll in ${data.program.name} offered by ${data.org.name}.`,
  }
}

export default async function EnrollPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ program?: string }>
}) {
  const { slug } = await params
  const { program: programId } = await searchParams

  if (!programId) notFound()

  const supabase = createPublicClient()
  const { data } = await getEnrollmentFormData(supabase, slug, programId)
  if (!data) notFound()

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  return (
    <EnrollmentForm
      {...data}
      orgSlug={slug}
      isAuthenticated={!!user}
    />
  )
}
