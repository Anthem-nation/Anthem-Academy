'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Star,
  Award,
  BarChart2,
  Users,
  Building2,
  FileText,
  Calendar,
  ClipboardList,
  GraduationCap,
  Heart,
  TrendingUp,
  MessageSquare,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { signOut } from '@/app/(auth)/actions'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

function getNavItems(role: UserRole): NavItem[] {
  const base: NavItem = {
    label: 'Dashboard',
    href: `/dashboard/${role}`,
    icon: LayoutDashboard,
  }

  const roleItems: Record<UserRole, NavItem[]> = {
    student: [
      base,
      { label: 'Courses', href: '/dashboard/student/courses', icon: BookOpen },
      { label: 'Attendance', href: '/dashboard/student/attendance', icon: CheckSquare },
      { label: 'Skill Passport', href: '/dashboard/student/skills', icon: Star },
      { label: 'Credentials', href: '/dashboard/student/credentials', icon: Award },
    ],
    admin: [
      base,
      { label: 'Overview', href: '/dashboard/admin/overview', icon: BarChart2 },
      { label: 'Users', href: '/dashboard/admin/users', icon: Users },
      { label: 'Organizations', href: '/dashboard/admin/orgs', icon: Building2 },
      { label: 'Reports', href: '/dashboard/admin/reports', icon: FileText },
    ],
    staff: [
      base,
      { label: 'Schedule', href: '/dashboard/staff/schedule', icon: Calendar },
      { label: 'Roster', href: '/dashboard/staff/roster', icon: ClipboardList },
      { label: 'Grading', href: '/dashboard/staff/grading', icon: GraduationCap },
    ],
    parent: [
      base,
      { label: 'My Child', href: '/dashboard/parent/child', icon: Heart },
      { label: 'Progress', href: '/dashboard/parent/progress', icon: TrendingUp },
      { label: 'Messages', href: '/dashboard/parent/messages', icon: MessageSquare },
    ],
  }

  return roleItems[role]
}

interface SidebarProps {
  role: UserRole
  email: string
}

export function Sidebar({ role, email }: SidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItems(role)

  return (
    <aside className="animate-slide-in-left flex h-screen w-64 flex-shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-white">A</span>
        </div>
        <span className="text-base font-bold tracking-tight">Anthem Academy</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-l-2 border-primary bg-primary/10 pl-[10px] text-white'
                      : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-primary' : '')} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User + sign out */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="mb-2 px-3">
          <p className="truncate text-xs text-sidebar-foreground/50">{email}</p>
          <p className="mt-0.5 text-xs font-medium capitalize text-sidebar-foreground/70">{role}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
