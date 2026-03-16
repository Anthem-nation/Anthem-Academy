// Shared TypeScript types for Anthem Academy
// Extended with full schema types in issue #3

export type UserRole = 'admin' | 'staff' | 'student' | 'parent'

export type CohortStatus = 'upcoming' | 'active' | 'completed' | 'cancelled'

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

// ─── Core entities ────────────────────────────────────────────────────────────

export interface AppUser {
  id: string
  email: string
  role: UserRole
  org_id: string | null
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface OrgMembership {
  id: string
  org_id: string
  person_id: string
  role: UserRole
  joined_at: string
  created_at: string
  updated_at: string
}

export interface Role {
  name: string
  label: string
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Program {
  id: string
  org_id: string
  name: string
  description: string | null
  subject: string | null
  min_age: number | null
  max_age: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Cohort {
  id: string
  program_id: string
  org_id: string
  name: string
  start_date: string | null
  end_date: string | null
  capacity: number | null
  status: CohortStatus
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  cohort_id: string
  program_id: string
  org_id: string
  title: string
  starts_at: string
  ends_at: string
  location: string | null
  notes: string | null
  status: SessionStatus
  created_at: string
  updated_at: string
}

// ─── Org settings ─────────────────────────────────────────────────────────────

export type EnrollmentFieldType = 'text' | 'number' | 'date' | 'select'

export interface EnrollmentField {
  name: string
  type: EnrollmentFieldType
  required: boolean
  options?: string[]  // only when type = 'select'
}

export interface OrgSettings {
  org_id: string
  timezone: string
  enrollment_fields: EnrollmentField[]
  created_at: string
  updated_at: string
}

export interface OrganizationWithSettings extends Organization {
  org_settings: OrgSettings | null
}

export type EnrollmentStatus = 'pending' | 'active' | 'dropped' | 'completed'

export interface Enrollment {
  id: string
  cohort_id: string
  org_id: string
  person_id: string
  enrollment_data: Record<string, unknown>
  status: EnrollmentStatus
  enrolled_at: string
  created_at: string
  updated_at: string
}

// ─── Join / view types ────────────────────────────────────────────────────────

export interface SessionWithContext extends Session {
  cohort: Pick<Cohort, 'id' | 'name'>
  program: Pick<Program, 'id' | 'name' | 'subject'>
  organization: Pick<Organization, 'id' | 'name' | 'slug'>
}

export interface MembershipWithOrg extends OrgMembership {
  organization: Pick<Organization, 'id' | 'name' | 'slug' | 'logo_url'>
}

export interface RoleChangeLog {
  id: string
  org_id: string
  person_id: string
  changed_by: string
  old_role: UserRole | null
  new_role: UserRole | null
  changed_at: string
}

export interface MemberWithPerson extends OrgMembership {
  person: Pick<AppUser, 'id' | 'email' | 'full_name'>
}

export interface OrgRoleClaim {
  org_id: string
  role: UserRole
}

// ─── API response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
}
