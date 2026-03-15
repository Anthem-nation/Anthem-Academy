import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MemberRoleSelect } from './_components/MemberRoleSelect'
import { AddMemberForm } from './_components/AddMemberForm'
import { removeMember } from './actions'
import type { MemberWithPerson, UserRole } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrgMembersPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('id', id)
    .single()

  if (orgError || !org) {
    redirect('/dashboard/admin/orgs')
  }

  const { data: members } = await supabase
    .from('org_memberships')
    .select('*, person:persons(id, email, full_name)')
    .eq('org_id', id)
    .order('joined_at')

  const typedMembers = (members ?? []) as MemberWithPerson[]

  async function handleRemove(membershipId: string) {
    'use server'
    await removeMember(membershipId, id)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Organization</h1>
        <p className="mt-1 text-sm text-gray-500">{org.name}</p>
      </div>

      {/* Tab nav */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href={`/dashboard/admin/orgs/${id}`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          Settings
        </Link>
        <Link
          href={`/dashboard/admin/orgs/${id}/members`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600"
        >
          Members
        </Link>
      </div>

      {/* Add member form */}
      <AddMemberForm orgId={id} />

      {/* Member table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        {typedMembers.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No members yet. Add the first member above.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {typedMembers.map((m) => {
                const initials = (m.person.full_name ?? m.person.email)
                  .split(' ')
                  .slice(0, 2)
                  .map((s: string) => s[0]?.toUpperCase() ?? '')
                  .join('')

                return (
                  <tr key={m.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {m.person.full_name ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.person.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <MemberRoleSelect
                        membershipId={m.id}
                        orgId={id}
                        currentRole={m.role as UserRole}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <form action={handleRemove.bind(null, m.id)}>
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
