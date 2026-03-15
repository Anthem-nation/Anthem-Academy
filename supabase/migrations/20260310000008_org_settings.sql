-- Issue #6: Organizations CRUD with Settings
-- Adds org_settings table, archived_at column, storage bucket, and write RLS policies

-- ============================================================
-- Step 1: Add archived_at to organizations (soft delete)
-- ============================================================

alter table public.organizations
  add column if not exists archived_at timestamptz;

-- ============================================================
-- Step 2: Create org_settings table
-- ============================================================

create table if not exists public.org_settings (
  org_id         uuid        primary key references public.organizations(id) on delete cascade,
  timezone       text        not null default 'America/Chicago',
  enrollment_fields jsonb    not null default '[]',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Reuse existing set_updated_at trigger function
create trigger set_org_settings_updated_at
  before update on public.org_settings
  for each row execute function public.set_updated_at();

-- Enable RLS on org_settings
alter table public.org_settings enable row level security;

-- ============================================================
-- Step 3: Auto-insert org_settings when org is created
-- ============================================================

create or replace function public.handle_new_org()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.org_settings (org_id)
  values (new.id)
  on conflict (org_id) do nothing;
  return new;
end;
$$;

create trigger on_org_created
  after insert on public.organizations
  for each row execute function public.handle_new_org();

-- ============================================================
-- Step 4: Helper function — is_platform_admin()
-- ============================================================

create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.persons
    where id = auth.uid()
      and role = 'admin'
  )
$$;

-- ============================================================
-- Step 5: RLS policies — organizations table (write)
-- ============================================================

-- Platform admins can see all orgs
create policy "platform admins can select all organizations"
  on public.organizations for select to authenticated
  using ((select role from public.persons where id = auth.uid()) = 'admin');

-- Platform admins can insert any org
create policy "platform admins can insert organizations"
  on public.organizations for insert to authenticated
  with check ((select role from public.persons where id = auth.uid()) = 'admin');

-- Platform admins can update any org (including archive)
create policy "platform admins can update organizations"
  on public.organizations for update to authenticated
  using ((select role from public.persons where id = auth.uid()) = 'admin')
  with check ((select role from public.persons where id = auth.uid()) = 'admin');

-- Org admins can update their own org (but cannot archive it)
create policy "org admins can update their own org"
  on public.organizations for update to authenticated
  using (public.is_org_admin(id))
  with check (public.is_org_admin(id) and archived_at is null);

-- ============================================================
-- Step 6: RLS policies — org_settings table
-- ============================================================

create policy "org members can select their org settings"
  on public.org_settings for select to authenticated
  using (
    org_id in (
      select org_id from public.org_memberships
      where person_id = auth.uid()
    )
  );

create policy "org admins can update their org settings"
  on public.org_settings for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy "platform admins have full access to org settings"
  on public.org_settings for all to authenticated
  using ((select role from public.persons where id = auth.uid()) = 'admin')
  with check ((select role from public.persons where id = auth.uid()) = 'admin');

-- ============================================================
-- Step 7: Storage — org-logos bucket + policies
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'org-logos',
  'org-logos',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

-- Public read
create policy "org logos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'org-logos');

-- Platform admins can upload any logo
create policy "platform admins can upload org logos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'org-logos'
    and (select role from public.persons where id = auth.uid()) = 'admin'
  );

-- Org admins can upload logo for their own org (path: {org_id}/{filename})
create policy "org admins can upload their org logo"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'org-logos'
    and public.is_org_admin((string_to_array(name, '/'))[1]::uuid)
  );

-- Platform admins can update any logo
create policy "platform admins can update org logos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'org-logos'
    and (select role from public.persons where id = auth.uid()) = 'admin'
  )
  with check (
    bucket_id = 'org-logos'
    and (select role from public.persons where id = auth.uid()) = 'admin'
  );

-- Org admins can update their own org logo
create policy "org admins can update their org logo"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'org-logos'
    and public.is_org_admin((string_to_array(name, '/'))[1]::uuid)
  )
  with check (
    bucket_id = 'org-logos'
    and public.is_org_admin((string_to_array(name, '/'))[1]::uuid)
  );

-- Platform admins can delete any logo
create policy "platform admins can delete org logos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'org-logos'
    and (select role from public.persons where id = auth.uid()) = 'admin'
  );

-- Org admins can delete their own org logo
create policy "org admins can delete their org logo"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'org-logos'
    and public.is_org_admin((string_to_array(name, '/'))[1]::uuid)
  );
