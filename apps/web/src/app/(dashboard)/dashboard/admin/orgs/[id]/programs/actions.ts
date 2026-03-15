'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

// ─── Zod schema ───────────────────────────────────────────────────────────────

const ProgramSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  description: z.string().optional(),
  subject: z.string().optional(),
  min_age: z.coerce.number().int().min(0).optional().nullable(),
  max_age: z.coerce.number().int().min(0).optional().nullable(),
  is_active: z.boolean(),
})

function parseFormData(formData: FormData) {
  const minAgeRaw = formData.get('min_age') as string
  const maxAgeRaw = formData.get('max_age') as string
  return {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    subject: (formData.get('subject') as string) || undefined,
    min_age: minAgeRaw ? Number(minAgeRaw) : null,
    max_age: maxAgeRaw ? Number(maxAgeRaw) : null,
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
  }
}

function mapError(code: string): string | null {
  if (code === '23505') return 'A program with that name already exists in this organization.'
  if (code === '42501') return 'You do not have permission to manage programs.'
  if (code === '22023') return 'Invalid age range: minimum age must be less than or equal to maximum age.'
  return null
}

// ─── createProgram ────────────────────────────────────────────────────────────

export async function createProgram(
  orgId: string,
  formData: FormData
): Promise<ApiResponse<{ programId: string }>> {
  const parsed = ProgramSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_create_program', {
    p_org_id:      orgId,
    p_name:        parsed.data.name,
    p_description: parsed.data.description ?? null,
    p_subject:     parsed.data.subject ?? null,
    p_min_age:     parsed.data.min_age ?? null,
    p_max_age:     parsed.data.max_age ?? null,
    p_is_active:   parsed.data.is_active,
  })

  if (error) {
    return { data: null, error: mapError(error.code) ?? error.message }
  }

  redirect(`/dashboard/admin/orgs/${orgId}/programs/${data}`)
}

// ─── updateProgram ────────────────────────────────────────────────────────────

export async function updateProgram(
  programId: string,
  orgId: string,
  formData: FormData
): Promise<ApiResponse<null>> {
  const parsed = ProgramSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_update_program', {
    p_id:          programId,
    p_name:        parsed.data.name,
    p_description: parsed.data.description ?? null,
    p_subject:     parsed.data.subject ?? null,
    p_min_age:     parsed.data.min_age ?? null,
    p_max_age:     parsed.data.max_age ?? null,
    p_is_active:   parsed.data.is_active,
  })

  if (error) {
    return { data: null, error: mapError(error.code) ?? error.message }
  }

  revalidatePath(`/dashboard/admin/orgs/${orgId}/programs/${programId}`)
  return { data: null, error: null }
}

// ─── deleteProgram ────────────────────────────────────────────────────────────

export async function deleteProgram(
  programId: string,
  orgId: string
): Promise<ApiResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_delete_program', {
    p_id: programId,
  })

  if (error) {
    if (error.code === 'P0002') return { data: null, error: 'Program not found.' }
    if (error.code === '42501') return { data: null, error: 'You do not have permission to delete programs.' }
    return { data: null, error: error.message }
  }

  redirect(`/dashboard/admin/orgs/${orgId}/programs`)
}
