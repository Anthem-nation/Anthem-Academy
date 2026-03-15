import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrgForm } from '../_components/OrgForm'
import type { Organization, OrgSettings } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditOrgPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: person } = await supabase
    .from('persons')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPlatformAdmin = person?.role === 'admin'

  const { data: orgData, error } = await supabase
    .from('organizations')
    .select('*, org_settings(*)')
    .eq('id', id)
    .single()

  if (error || !orgData) {
    redirect('/dashboard/admin/orgs')
  }

  const { org_settings, ...org } = orgData as Organization & { org_settings: OrgSettings | null }
  const settings = Array.isArray(org_settings) ? (org_settings[0] ?? null) : org_settings

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Organization</h1>
        <p className="mt-1 text-sm text-gray-500">{org.name}</p>
      </div>

      {org.archived_at && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800 font-medium">
            This organization is archived. It is hidden from active listings.
          </p>
        </div>
      )}

      <OrgForm
        org={org as Organization}
        settings={settings}
        isPlatformAdmin={isPlatformAdmin}
      />
    </div>
  )
}
