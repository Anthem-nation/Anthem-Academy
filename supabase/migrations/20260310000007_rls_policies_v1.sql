-- Issue #4: Tighten RLS policies for persons, organizations, org_memberships
-- Security-only migration — no schema changes

-- ============================================================
-- Step 1: Helper function — is_org_admin(org_uuid)
-- security definer: runs as function owner, bypasses RLS on
--   org_memberships so the check doesn't recurse infinitely.
-- stable: result can be cached within a transaction by the planner.
-- ============================================================
create or replace function public.is_org_admin(org_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.org_memberships
    where org_id = org_uuid
      and person_id = auth.uid()
      and role = 'admin'
  )
$$;

-- ============================================================
-- Step 2: persons table
-- Drop the overly-simple policy; replace with named variant +
-- two new admin policies (SELECT + UPDATE).
-- Supabase evaluates multiple SELECT policies with OR logic.
-- ============================================================

-- Own-row read (renamed for clarity)
drop policy "users can select their own row" on public.persons;
create policy "users can select their own person row"
  on public.persons for select to authenticated
  using (id = auth.uid());

-- Org admins can read all persons in their org
create policy "org admins can select persons in their org"
  on public.persons for select to authenticated
  using (
    org_id is not null
    and public.is_org_admin(org_id)
  );

-- Org admins can update person rows in their org
-- WITH CHECK prevents updating a person into a different org
create policy "org admins can update persons in their org"
  on public.persons for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

-- ============================================================
-- Step 3: organizations table
-- Drop the over-permissive "all authenticated" policy.
-- Replace with membership-scoped access: users see only orgs
-- they belong to (org_memberships is authoritative).
-- ============================================================

drop policy "authenticated users can select organizations" on public.organizations;

create policy "users can select their own orgs"
  on public.organizations for select to authenticated
  using (
    id in (
      select org_id from public.org_memberships
      where person_id = auth.uid()
    )
  );

-- ============================================================
-- Step 4: org_memberships table
-- Existing "users can select their own memberships" stays.
-- Add: admins see all memberships in their org.
-- ============================================================

create policy "org admins can select all memberships in their org"
  on public.org_memberships for select to authenticated
  using (public.is_org_admin(org_id));
