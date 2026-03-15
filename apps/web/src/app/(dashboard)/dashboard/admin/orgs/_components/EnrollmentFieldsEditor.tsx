'use client'

import type { EnrollmentField, EnrollmentFieldType } from '@/types'

interface EnrollmentFieldsEditorProps {
  fields: EnrollmentField[]
  onChange: (fields: EnrollmentField[]) => void
}

const FIELD_TYPES: { value: EnrollmentFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select (dropdown)' },
]

export function EnrollmentFieldsEditor({ fields, onChange }: EnrollmentFieldsEditorProps) {
  function addField() {
    onChange([...fields, { name: '', type: 'text', required: false }])
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index))
  }

  function updateField(index: number, updates: Partial<EnrollmentField>) {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Enrollment Fields</p>
        <span className="text-xs text-gray-400">{fields.length}/20</span>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No custom enrollment fields. Add fields below.</p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={index} className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-2">
              <div className="flex items-start gap-2">
                {/* Field name */}
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Field name</label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    placeholder="e.g. Guardian name"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Field type */}
                <div className="w-40">
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value as EnrollmentFieldType })}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Required */}
                <div className="pt-5">
                  <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Required
                  </label>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="pt-5 text-gray-400 hover:text-red-500 text-xs"
                  aria-label="Remove field"
                >
                  ✕
                </button>
              </div>

              {/* Options for select type */}
              {field.type === 'select' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Options <span className="text-gray-400">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={field.options?.join(', ') ?? ''}
                    onChange={(e) =>
                      updateField(index, {
                        options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g. Option A, Option B, Option C"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addField}
        disabled={fields.length >= 20}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        + Add field
      </button>
    </div>
  )
}
