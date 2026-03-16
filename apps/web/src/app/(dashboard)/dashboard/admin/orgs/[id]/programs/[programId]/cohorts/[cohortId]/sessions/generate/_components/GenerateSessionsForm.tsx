'use client'

import { useState, useTransition } from 'react'
import { generateSessionDates } from '@/lib/utils/session-generator'
import type { GeneratedSession, SessionTemplate } from '@/lib/utils/session-generator'
import { generateSessions } from '../actions'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKDAY_LONG   = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface Props {
  cohortId: string
  programId: string
  orgId: string
  cohortStartDate: string
  cohortEndDate: string
  cohortName: string
  existingScheduledCount: number
}

export function GenerateSessionsForm({
  cohortId,
  programId,
  orgId,
  cohortStartDate,
  cohortEndDate,
  cohortName,
  existingScheduledCount,
}: Props) {
  const [step, setStep] = useState<'template' | 'preview'>('template')

  // Template fields
  const [title, setTitle] = useState('')
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [startTime, setStartTime] = useState('09:00')
  const [duration, setDuration] = useState(60)
  const [location, setLocation] = useState('')
  const [templateError, setTemplateError] = useState<string | null>(null)

  // Preview
  const [sessions, setSessions] = useState<GeneratedSession[]>([])
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleWeekday(idx: number) {
    setWeekdays(prev =>
      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx].sort()
    )
  }

  function handlePreview() {
    setTemplateError(null)

    if (title.trim().length < 2) {
      setTemplateError('Title must be at least 2 characters.')
      return
    }
    if (weekdays.length === 0) {
      setTemplateError('Select at least one day of the week.')
      return
    }
    if (!cohortStartDate || !cohortEndDate) {
      setTemplateError('This cohort has no start or end date. Please set them before generating sessions.')
      return
    }

    const template: SessionTemplate = {
      title: title.trim(),
      weekdays,
      startTime,
      durationMinutes: duration,
      location: location.trim(),
    }

    const generated = generateSessionDates(template, cohortStartDate, cohortEndDate)
    setSessions(generated)
    setStep('preview')
  }

  function removeSession(idx: number) {
    setSessions(prev => prev.filter((_, i) => i !== idx))
  }

  function handleConfirm() {
    setConfirmError(null)
    startTransition(async () => {
      const result = await generateSessions(cohortId, programId, orgId, sessions)
      if (result?.error) {
        setConfirmError(result.error)
      }
    })
  }

  if (step === 'template') {
    return (
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="gen-title" className="block text-sm font-medium text-gray-700">
            Session Title <span className="text-red-500">*</span>
          </label>
          <input
            id="gen-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Weekly Training"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Days of week */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Day(s) of Week <span className="text-red-500">*</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((label, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleWeekday(idx)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                  weekdays.includes(idx)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Start time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="gen-time" className="block text-sm font-medium text-gray-700">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              id="gen-time"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="gen-duration" className="block text-sm font-medium text-gray-700">
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              id="gen-duration"
              type="number"
              min={1}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="gen-location" className="block text-sm font-medium text-gray-700">
            Location <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="gen-location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Room 101"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {templateError && (
          <p className="text-sm text-red-600">{templateError}</p>
        )}

        <button
          type="button"
          onClick={handlePreview}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Preview →
        </button>
      </div>
    )
  }

  // Preview step
  return (
    <div className="space-y-6">
      {/* Count banner */}
      {sessions.length === 0 ? (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          No sessions match the schedule within the cohort date range.
        </div>
      ) : (
        <div className="rounded-md bg-indigo-50 border border-indigo-200 px-4 py-3 text-sm text-indigo-800">
          <strong>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</strong> will be created for <strong>{cohortName}</strong>.
        </div>
      )}

      {/* Replace warning */}
      {existingScheduledCount > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          ⚠ <strong>{existingScheduledCount} existing scheduled session{existingScheduledCount !== 1 ? 's' : ''}</strong> will be replaced.
        </div>
      )}

      {/* Session table */}
      {sessions.length > 0 && (
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((s, idx) => {
                const d = new Date(s.starts_at)
                return (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {WEEKDAY_LONG[d.getDay() === 0 ? 6 : d.getDay() - 1]}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeSession(idx)}
                        className="text-gray-400 hover:text-red-600 text-sm font-medium"
                        aria-label="Remove session"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmError && (
        <p className="text-sm text-red-600">{confirmError}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep('template')}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={sessions.length === 0 || isPending}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Confirm & Save'}
        </button>
      </div>
    </div>
  )
}
