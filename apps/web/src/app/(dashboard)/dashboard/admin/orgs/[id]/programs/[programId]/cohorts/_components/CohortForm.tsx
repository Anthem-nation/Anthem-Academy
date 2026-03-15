'use client'

import { useTransition } from 'react'
import { createCohort, updateCohort, deleteCohort } from '../actions'
import type { Cohort, CohortStatus } from '@/types'

const STATUSES: CohortStatus[] = ['upcoming', 'active', 'completed', 'cancelled']

interface Props {
  orgId: string
  programId: string
  cohort?: Cohort
}

export function CohortForm({ orgId, programId, cohort }: Props) {
  const [isPending, startTransition] = useTransition()
  const isEdit = !!cohort

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit) {
        const result = await updateCohort(cohort.id, orgId, programId, formData)
        if (result?.error) {
          alert(result.error)
        }
      } else {
        const result = await createCohort(orgId, programId, formData)
        if (result?.error) {
          alert(result.error)
        }
      }
    })
  }

  async function handleDelete() {
    if (!cohort) return
    if (!confirm('Delete this cohort? All sessions will also be deleted.')) return
    startTransition(async () => {
      const result = await deleteCohort(cohort.id, orgId, programId)
      if (result?.error) {
        alert(result.error)
      }
    })
  }

  return (
    <div className="space-y-8">
      <form action={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={cohort?.name ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            defaultValue={cohort?.status ?? 'upcoming'}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={cohort?.start_date ?? ''}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={cohort?.end_date ?? ''}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Capacity
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={cohort?.capacity ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Cohort'}
        </button>
      </form>

      {/* Danger zone */}
      {isEdit && (
        <div className="rounded-md border border-red-200 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          <p className="text-sm text-red-600">
            Deleting a cohort will also remove all associated sessions.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Delete Cohort
          </button>
        </div>
      )}
    </div>
  )
}
