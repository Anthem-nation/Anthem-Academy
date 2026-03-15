create table public.programs (
  id          uuid        primary key default gen_random_uuid(),
  org_id      uuid        not null references public.organizations(id) on delete cascade,
  name        text        not null,
  description text,
  subject     text,
  min_age     integer,
  max_age     integer,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint programs_unique_name_per_org unique (org_id, name),
  constraint programs_age_range_valid
    check (min_age is null or max_age is null or min_age <= max_age)
);

create trigger set_programs_updated_at
  before update on public.programs
  for each row execute procedure public.set_updated_at();

create index idx_programs_org_id on public.programs (org_id);

-- RLS: any authenticated user can read programs
alter table public.programs enable row level security;

create policy "authenticated users can select programs"
  on public.programs
  for select
  to authenticated
  using (true);
