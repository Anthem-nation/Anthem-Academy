create table public.org_memberships (
  id         uuid        primary key default gen_random_uuid(),
  org_id     uuid        not null references public.organizations(id) on delete cascade,
  person_id  uuid        not null references public.persons(id) on delete cascade,
  role       text        not null check (role in ('admin', 'staff', 'student', 'parent')),
  joined_at  timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint org_memberships_unique_member unique (org_id, person_id)
);

create trigger set_org_memberships_updated_at
  before update on public.org_memberships
  for each row execute procedure public.set_updated_at();

create index idx_org_memberships_person_id on public.org_memberships (person_id);
create index idx_org_memberships_org_id    on public.org_memberships (org_id);

-- RLS: users can only see their own membership rows
alter table public.org_memberships enable row level security;

create policy "users can select their own memberships"
  on public.org_memberships
  for select
  to authenticated
  using (person_id = auth.uid());
