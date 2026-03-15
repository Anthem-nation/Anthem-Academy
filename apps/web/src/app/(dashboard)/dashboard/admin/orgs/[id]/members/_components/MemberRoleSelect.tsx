'use client'

import { useState, useTransition } from 'react'
import { updateMemberRole } from '../actions'
import type { UserRole } from '@/types'

const ROLES: UserRole[] = ['admin', 'staff', 'student', 'parent']

interface MemberRoleSelectProps {
  membershipId: string
  orgId: string
  currentRole: UserRole
}

export function MemberRoleSelect({ membershipId, orgId, currentRole }: MemberRoleSelectProps) {
  const [role, setRole] = useState<UserRole>(currentRole)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as UserRole
    const previousRole = role
    setRole(newRole)
    setError(null)

    const fd = new FormData()
    fd.set('role', newRole)

    startTransition(async () => {
      const result = await updateMemberRole(membershipId, orgId, fd)
      if (result.error) {
        setRole(previousRole)
        setError(result.error)
      }
    })
  }

  return (
    <div>
      <select
        value={role}
        onChange={handleChange}
        disabled={isPending}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
