'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import type { EnrollmentField, Organization, OrgSettings } from '@/types'
import { createOrg, updateOrg, updateOrgSettings, archiveOrg, unarchiveOrg, uploadOrgLogo } from '../actions'
import { EnrollmentFieldsEditor } from './EnrollmentFieldsEditor'

const TIMEZONES = [
  'UTC',
  'America/Chicago',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Kolkata',
  'Asia/Singapore',
]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

interface OrgFormProps {
  org?: Organization
  settings?: OrgSettings | null
  isPlatformAdmin: boolean
}

export function OrgForm({ org, settings, isPlatformAdmin }: OrgFormProps) {
  const isEdit = !!org

  const [name, setName] = useState(org?.name ?? '')
  const [slug, setSlug] = useState(org?.slug ?? '')
  const [isActive, setIsActive] = useState(org?.is_active ?? true)
  const [timezone, setTimezone] = useState(settings?.timezone ?? 'America/Chicago')
  const [enrollmentFields, setEnrollmentFields] = useState<EnrollmentField[]>(
    settings?.enrollment_fields ?? []
  )
  const [logoPreview, setLogoPreview] = useState<string | null>(org?.logo_url ?? null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLogoUploading, setIsLogoUploading] = useState(false)

  const slugManuallyEdited = useRef(isEdit)

  // Auto-derive slug from name when not manually edited
  useEffect(() => {
    if (!slugManuallyEdited.current) {
      setSlug(slugify(name))
    }
  }, [name])

  function handleSlugChange(value: string) {
    slugManuallyEdited.current = true
    setSlug(value)
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !org) return

    setLogoError(null)

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setLogoError('File must be a JPEG, PNG, WebP, or SVG image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError('File must be 5 MB or smaller.')
      return
    }

    setIsLogoUploading(true)
    const fd = new FormData()
    fd.set('logo', file)

    startTransition(async () => {
      const result = await uploadOrgLogo(org.id, fd)
      setIsLogoUploading(false)
      if (result.error) {
        setLogoError(result.error)
      } else if (result.data) {
        setLogoPreview(result.data.logo_url)
      }
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    startTransition(async () => {
      const fd = new FormData()
      fd.set('name', name)
      fd.set('slug', slug)
      fd.set('is_active', String(isActive))

      const orgResult = isEdit
        ? await updateOrg(org!.id, fd)
        : await createOrg(fd)

      if (orgResult?.error) {
        setFormError(orgResult.error)
        return
      }

      // If editing, also save settings
      if (isEdit) {
        const sfd = new FormData()
        sfd.set('timezone', timezone)
        sfd.set('enrollment_fields', JSON.stringify(enrollmentFields))
        const settingsResult = await updateOrgSettings(org!.id, sfd)
        if (settingsResult?.error) {
          setFormError(settingsResult.error)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Basic Info ── */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Basic Info</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Anthem Academy"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
            placeholder="anthem-academy"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Lowercase letters, numbers, and hyphens only. Auto-derived from name.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isActive ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">{isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </section>

      {/* ── Logo ── */}
      {isEdit && (
        <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Logo</h2>

          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Organization logo"
                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-2xl border border-gray-200">
                {name.charAt(0).toUpperCase() || '?'}
              </div>
            )}

            <div>
              <label className="cursor-pointer inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                {isLogoUploading ? 'Uploading...' : 'Choose file'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="sr-only"
                  onChange={handleLogoChange}
                  disabled={isLogoUploading}
                />
              </label>
              <p className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP, or SVG. Max 5 MB.</p>
              {logoError && <p className="mt-1 text-xs text-red-600">{logoError}</p>}
            </div>
          </div>
        </section>
      )}

      {/* ── Settings ── */}
      {isEdit && (
        <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <EnrollmentFieldsEditor
            fields={enrollmentFields}
            onChange={setEnrollmentFields}
          />
        </section>
      )}

      {/* ── Danger zone (platform admin only) ── */}
      {isEdit && isPlatformAdmin && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-6 space-y-3">
          <h2 className="text-base font-semibold text-red-800">Danger Zone</h2>

          {org!.archived_at ? (
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">This organization is archived.</p>
              <button
                type="button"
                onClick={() => startTransition(() => unarchiveOrg(org!.id))}
                disabled={isPending}
                className="inline-flex items-center rounded-md border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
              >
                Unarchive
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Archiving hides this org from active listings. Data is preserved.
              </p>
              <button
                type="button"
                onClick={() => startTransition(() => archiveOrg(org!.id))}
                disabled={isPending}
                className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Archive
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Error + Submit ── */}
      {formError && (
        <p className="text-sm text-red-600">{formError}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Create organization'}
        </button>
      </div>
    </form>
  )
}
