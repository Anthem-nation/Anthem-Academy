// Shared TypeScript types for Anthem Academy
// Extended with full schema types in issue #3

export type UserRole = 'admin' | 'staff' | 'student' | 'parent'

export interface AppUser {
  id: string
  email: string
  role: UserRole
  orgId: string
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  createdAt: string
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
}
