-- Reusable trigger function: sets updated_at to now() on every row update
-- CREATE OR REPLACE is idempotent; this function is reused by all subsequent migrations
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- organizations table
create table public.organizations (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  slug       text        not null unique,
  logo_url   text,
  is_active  boolean     not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organizations_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute procedure public.set_updated_at();

-- Add FK from persons.org_id → organizations.id
-- The column already exists (created in migration 0); we add the constraint now.
alter table public.persons
  add constraint persons_org_id_fkey
  foreign key (org_id) references public.organizations(id) on delete set null;

-- Add updated_at to persons (column was deferred until now)
alter table public.persons
  add column if not exists updated_at timestamptz not null default now();

create trigger set_persons_updated_at
  before update on public.persons
  for each row execute procedure public.set_updated_at();

create index idx_persons_org_id on public.persons (org_id);

-- RLS: authenticated users can see all organizations
alter table public.organizations enable row level security;

create policy "authenticated users can select organizations"
  on public.organizations
  for select
  to authenticated
  using (true);
