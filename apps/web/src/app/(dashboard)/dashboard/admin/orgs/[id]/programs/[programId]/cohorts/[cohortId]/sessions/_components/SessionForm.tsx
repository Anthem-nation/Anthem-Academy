'use client'

import { useTransition } from 'react'
import { createSession, updateSession, deleteSession } from '../actions'
import type { Session, SessionStatus } from '@/types'

const STATUSES: SessionStatus[] = ['scheduled', 'in_progress', 'completed', 'cancelled']

function toDatetimeLocal(iso: string): string {
  // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
  return iso ? iso.slice(0, 16) : ''
}

interface Props {
  cohortId: string
  programId: string
  orgId: string
  session?: Session
}

export function SessionForm({ cohortId, programId, orgId, session }: Props) {
  const [isPending, startTransition] = useTransition()
  const isEdit = !!session

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit) {
        const result = await updateSession(session.id, orgId, cohortId, programId, formData)
        if (result?.error) {
          alert(result.error)
        }
      } else {
        const result = await createSession(cohortId, programId, orgId, formData)
        if (result?.error) {
          alert(result.error)
        }
      }
    })
  }

  async function handleDelete() {
    if (!session) return
    if (!confirm('Delete this session? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteSession(session.id, orgId, cohortId, programId)
      if (result?.error) {
        alert(result.error)
      }
    })
  }

  return (
    <div className="space-y-8">
      <form action={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={session?.title ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="starts_at" className="block text-sm font-medium text-gray-700">
              Starts At <span className="text-red-500">*</span>
            </label>
            <input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={session ? toDatetimeLocal(session.starts_at) : ''}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="ends_at" className="block text-sm font-medium text-gray-700">
              Ends At <span className="text-red-500">*</span>
            </label>
            <input
              id="ends_at"
              name="ends_at"
              type="datetime-local"
              required
              defaultValue={session ? toDatetimeLocal(session.ends_at) : ''}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={session?.location ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={session?.notes ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status (edit mode only) */}
        {isEdit && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={session?.status ?? 'scheduled'}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Session'}
        </button>
      </form>

      {/* Danger zone */}
      {isEdit && (
        <div className="rounded-md border border-red-200 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          <p className="text-sm text-red-600">
            Deleting a session cannot be undone.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Delete Session
          </button>
        </div>
      )}
    </div>
  )
}
