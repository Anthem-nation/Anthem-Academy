'use client'

import { useTransition, useState } from 'react'
import { submitEnrollment } from './actions'
import type { Organization, Program, Cohort, EnrollmentField, EnrollmentFieldType } from '@/types'

interface Props {
  org: Organization
  program: Program
  cohorts: Cohort[]
  enrollmentFields: EnrollmentField[]
  orgSlug: string
  isAuthenticated: boolean
}

function DynamicField({ field }: { field: EnrollmentField }) {
  const inputClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
  const labelClass = 'block text-sm font-medium text-foreground mb-1'

  const label = (
    <label htmlFor={`custom_${field.name}`} className={labelClass}>
      {field.name}
      {field.required && <span className="ml-1 text-destructive">*</span>}
    </label>
  )

  if (field.type === 'select' && field.options) {
    return (
      <div>
        {label}
        <select
          id={`custom_${field.name}`}
          name={`custom_${field.name}`}
          required={field.required}
          className={inputClass}
          defaultValue=""
        >
          <option value="" disabled>Select an option</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  const typeMap: Record<EnrollmentFieldType, string> = {
    text:   'text',
    number: 'number',
    date:   'date',
    select: 'text',
  }

  return (
    <div>
      {label}
      <input
        id={`custom_${field.name}`}
        name={`custom_${field.name}`}
        type={typeMap[field.type] ?? 'text'}
        required={field.required}
        className={inputClass}
      />
    </div>
  )
}

export default function EnrollmentForm({
  org,
  program,
  cohorts,
  enrollmentFields,
  orgSlug,
  isAuthenticated,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const defaultCohortId = cohorts.length === 1 ? cohorts[0].id : ''

  const inputClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50'
  const labelClass = 'block text-sm font-medium text-foreground mb-1'

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await submitEnrollment(orgSlug, enrollmentFields, formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-muted-foreground">{org.name}</p>
          <h1 className="text-2xl font-bold text-foreground">Enroll in {program.name}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <form action={handleSubmit} className="space-y-5">
          {/* Cohort selector — only if multiple cohorts */}
          {cohorts.length > 1 && (
            <div>
              <label htmlFor="cohort_id" className={labelClass}>
                Session <span className="text-destructive">*</span>
              </label>
              <select
                id="cohort_id"
                name="cohort_id"
                required
                className={inputClass}
                defaultValue={defaultCohortId}
              >
                <option value="" disabled>Select a session</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Hidden cohort_id when only one cohort */}
          {cohorts.length === 1 && (
            <input type="hidden" name="cohort_id" value={cohorts[0].id} />
          )}

          {/* Standard fields */}
          <div>
            <label htmlFor="full_name" className={labelClass}>
              Full name <span className="text-destructive">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              minLength={2}
              placeholder="Student's full name"
              className={inputClass}
            />
          </div>

          {!isAuthenticated && (
            <>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password <span className="text-destructive">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="dob" className={labelClass}>
              Date of birth <span className="text-destructive">*</span>
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="guardian_name" className={labelClass}>
              Guardian name <span className="text-destructive">*</span>
            </label>
            <input
              id="guardian_name"
              name="guardian_name"
              type="text"
              required
              minLength={2}
              placeholder="Parent or guardian full name"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="guardian_phone" className={labelClass}>
              Guardian phone <span className="text-destructive">*</span>
            </label>
            <input
              id="guardian_phone"
              name="guardian_phone"
              type="tel"
              required
              placeholder="+1 555 000 0000"
              className={inputClass}
            />
          </div>

          {/* Dynamic custom fields */}
          {enrollmentFields.map((field) => (
            <DynamicField key={field.name} field={field} />
          ))}

          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isPending ? 'Submitting…' : 'Submit Enrollment'}
          </button>
        </form>
      </main>
    </div>
  )
}
