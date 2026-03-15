'use client'

import { useState, useTransition, useRef } from 'react'
import { addMember } from '../actions'
import type { UserRole } from '@/types'

const ROLES: UserRole[] = ['admin', 'staff', 'student', 'parent']

interface AddMemberFormProps {
  orgId: string
}

export function AddMemberForm({ orgId }: AddMemberFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await addMember(orgId, fd)
      if (result.error) {
        setError(result.error)
      } else {
        formRef.current?.reset()
      }
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Add Member</h3>
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label htmlFor="add-email" className="block text-xs font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="add-email"
            name="email"
            type="email"
            required
            placeholder="person@example.com"
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="add-role" className="block text-xs font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="add-role"
            name="role"
            defaultValue="student"
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Adding…' : 'Add Member'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
