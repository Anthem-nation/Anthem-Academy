'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse, UserRole } from '@/types'

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const ROLES = ['admin', 'staff', 'student', 'parent'] as const satisfies readonly UserRole[]

const AddMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(ROLES, { message: 'Invalid role' }),
})

const UpdateRoleSchema = z.object({
  role: z.enum(ROLES, { message: 'Invalid role' }),
})

// ─── addMember ────────────────────────────────────────────────────────────────

export async function addMember(
  orgId: string,
  formData: FormData
): Promise<ApiResponse<{ membershipId: string }>> {
  const raw = {
    email: formData.get('email') as string,
    role: formData.get('role') as string,
  }

  const parsed = AddMemberSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_add_member', {
    p_org_id: orgId,
    p_email: parsed.data.email,
    p_role: parsed.data.role,
  })

  if (error) {
    if (error.code === 'P0002') {
      return { data: null, error: 'No user found with that email address.' }
    }
    if (error.code === '23505') {
      return { data: null, error: 'This person is already a member of this organization.' }
    }
    if (error.code === '42501') {
      return { data: null, error: 'You do not have permission to add members.' }
    }
    return { data: null, error: error.message }
  }

  revalidatePath(`/dashboard/admin/orgs/${orgId}/members`)
  return { data: { membershipId: data as string }, error: null }
}

// ─── updateMemberRole ─────────────────────────────────────────────────────────

export async function updateMemberRole(
  membershipId: string,
  orgId: string,
  formData: FormData
): Promise<ApiResponse<null>> {
  const raw = { role: formData.get('role') as string }

  const parsed = UpdateRoleSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_update_member_role', {
    p_membership_id: membershipId,
    p_new_role: parsed.data.role,
  })

  if (error) {
    if (error.code === 'P0002') {
      return { data: null, error: 'Membership not found.' }
    }
    if (error.code === '42501') {
      return { data: null, error: 'You do not have permission to change member roles.' }
    }
    return { data: null, error: error.message }
  }

  revalidatePath(`/dashboard/admin/orgs/${orgId}/members`)
  return { data: null, error: null }
}

// ─── removeMember ─────────────────────────────────────────────────────────────

export async function removeMember(
  membershipId: string,
  orgId: string
): Promise<ApiResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('admin_remove_member', {
    p_membership_id: membershipId,
  })

  if (error) {
    if (error.code === 'P0002') {
      return { data: null, error: 'Membership not found.' }
    }
    if (error.code === '42501') {
      return { data: null, error: 'You do not have permission to remove members.' }
    }
    return { data: null, error: error.message }
  }

  redirect(`/dashboard/admin/orgs/${orgId}/members`)
}
