import { OrgForm } from '../_components/OrgForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewOrgPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: person } = await supabase
    .from('persons')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPlatformAdmin = person?.role === 'admin'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Organization</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new organization to the platform.
        </p>
      </div>
      <OrgForm isPlatformAdmin={isPlatformAdmin} />
    </div>
  )
}
