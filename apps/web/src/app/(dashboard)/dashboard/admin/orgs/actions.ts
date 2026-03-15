'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const OrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  is_active: z.boolean(),
})

const OrgSettingsSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  enrollment_fields: z.array(
    z.object({
      name: z.string().min(1, 'Field name is required'),
      type: z.enum(['text', 'number', 'date', 'select']),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    })
  ).max(20, 'Maximum 20 enrollment fields allowed'),
})

// ─── createOrg ────────────────────────────────────────────────────────────────

export async function createOrg(formData: FormData): Promise<ApiResponse<{ id: string }>> {
  const raw = {
    name: formData.get('name') as string,
    slug: (formData.get('slug') as string) || slugify(formData.get('name') as string ?? ''),
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = OrgSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizations')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { data: null, error: 'An organization with that slug already exists.' }
    }
    return { data: null, error: error.message }
  }

  redirect(`/dashboard/admin/orgs/${data.id}`)
}

// ─── updateOrg ────────────────────────────────────────────────────────────────

export async function updateOrg(id: string, formData: FormData): Promise<ApiResponse<{ id: string }>> {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = OrgSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizations')
    .update(parsed.data)
    .eq('id', id)
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { data: null, error: 'An organization with that slug already exists.' }
    }
    if (error.code === 'PGRST116') {
      return { data: null, error: 'Organization not found or you do not have permission to update it.' }
    }
    return { data: null, error: error.message }
  }

  redirect(`/dashboard/admin/orgs/${data.id}`)
}

// ─── archiveOrg ───────────────────────────────────────────────────────────────

export async function archiveOrg(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('organizations')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .is('archived_at', null)  // idempotency guard

  if (error) {
    return { data: null, error: error.message }
  }

  redirect('/dashboard/admin/orgs')
}

// ─── unarchiveOrg ─────────────────────────────────────────────────────────────

export async function unarchiveOrg(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('organizations')
    .update({ archived_at: null })
    .eq('id', id)

  if (error) {
    return { data: null, error: error.message }
  }

  redirect(`/dashboard/admin/orgs/${id}`)
}

// ─── updateOrgSettings ────────────────────────────────────────────────────────

export async function updateOrgSettings(orgId: string, formData: FormData): Promise<ApiResponse<null>> {
  const enrollmentFieldsRaw = formData.get('enrollment_fields') as string
  let enrollmentFields: unknown[]
  try {
    enrollmentFields = JSON.parse(enrollmentFieldsRaw || '[]')
  } catch {
    return { data: null, error: 'Invalid enrollment fields format.' }
  }

  const raw = {
    timezone: formData.get('timezone') as string,
    enrollment_fields: enrollmentFields,
  }

  const parsed = OrgSettingsSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('org_settings')
    .update({
      timezone: parsed.data.timezone,
      enrollment_fields: parsed.data.enrollment_fields,
    })
    .eq('org_id', orgId)

  if (error) {
    return { data: null, error: error.message }
  }

  redirect(`/dashboard/admin/orgs/${orgId}`)
}

// ─── uploadOrgLogo ────────────────────────────────────────────────────────────

export async function uploadOrgLogo(
  orgId: string,
  formData: FormData
): Promise<ApiResponse<{ logo_url: string }>> {
  const file = formData.get('logo') as File | null
  if (!file || file.size === 0) {
    return { data: null, error: 'No file provided.' }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    return { data: null, error: 'File must be a JPEG, PNG, WebP, or SVG image.' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { data: null, error: 'File must be 5 MB or smaller.' }
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${orgId}/${Date.now()}.${ext}`

  const supabase = await createClient()
  const { error: uploadError } = await supabase.storage
    .from('org-logos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return { data: null, error: uploadError.message }
  }

  const { data: urlData } = supabase.storage.from('org-logos').getPublicUrl(path)
  const logo_url = urlData.publicUrl

  const { error: updateError } = await supabase
    .from('organizations')
    .update({ logo_url })
    .eq('id', orgId)

  if (updateError) {
    return { data: null, error: updateError.message }
  }

  return { data: { logo_url }, error: null }
}
