'use client'

import { useState, useTransition } from 'react'
import { assignCohort } from '../actions'

interface AssignCohortFormProps {
  enrollmentId: string
  orgId: string
  currentCohortId: string
  cohorts: { id: string; name: string }[]
}

export function AssignCohortForm({
  enrollmentId,
  orgId,
  currentCohortId,
  cohorts,
}: AssignCohortFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await assignCohort(enrollmentId, orgId, fd)
      if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <select
          name="cohort_id"
          defaultValue={currentCohortId}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Confirming…' : 'Confirm'}
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
