'use client'

import { useTransition } from 'react'
import { createProgram, updateProgram, deleteProgram } from '../actions'
import type { Program } from '@/types'

interface Props {
  orgId: string
  program?: Program
}

export function ProgramForm({ orgId, program }: Props) {
  const [isPending, startTransition] = useTransition()
  const isEdit = !!program

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit) {
        const result = await updateProgram(program.id, orgId, formData)
        if (result?.error) {
          alert(result.error)
        }
      } else {
        const result = await createProgram(orgId, formData)
        if (result?.error) {
          alert(result.error)
        }
      }
    })
  }

  async function handleDelete() {
    if (!program) return
    if (!confirm('Delete this program? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteProgram(program.id, orgId)
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
            defaultValue={program?.name ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={program?.description ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            defaultValue={program?.subject ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Age range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="min_age" className="block text-sm font-medium text-gray-700">
              Min Age
            </label>
            <input
              id="min_age"
              name="min_age"
              type="number"
              min={0}
              defaultValue={program?.min_age ?? ''}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="max_age" className="block text-sm font-medium text-gray-700">
              Max Age
            </label>
            <input
              id="max_age"
              name="max_age"
              type="number"
              min={0}
              defaultValue={program?.max_age ?? ''}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            value="true"
            defaultChecked={program?.is_active ?? true}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Active
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Program'}
        </button>
      </form>

      {/* Danger zone */}
      {isEdit && (
        <div className="rounded-md border border-red-200 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          <p className="text-sm text-red-600">
            Deleting a program will also remove all associated cohorts and sessions.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Delete Program
          </button>
        </div>
      )}
    </div>
  )
}
