-- sessions table
-- program_id and org_id are denormalized here to avoid double-joins on the
-- most-frequently-queried entity (list of upcoming sessions).
create table public.sessions (
  id          uuid        primary key default gen_random_uuid(),
  cohort_id   uuid        not null references public.cohorts(id) on delete cascade,
  program_id  uuid        not null references public.programs(id) on delete cascade,
  org_id      uuid        not null references public.organizations(id) on delete cascade,
  title       text        not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  location    text,
  notes       text,
  status      text        not null default 'scheduled'
                          check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint sessions_time_order_valid
    check (starts_at < ends_at)
);

create trigger set_sessions_updated_at
  before update on public.sessions
  for each row execute procedure public.set_updated_at();

create index idx_sessions_cohort_id  on public.sessions (cohort_id);
create index idx_sessions_org_id     on public.sessions (org_id);
create index idx_sessions_starts_at  on public.sessions (starts_at);
create index idx_sessions_program_id on public.sessions (program_id);

-- RLS: any authenticated user can read sessions
alter table public.sessions enable row level security;

create policy "authenticated users can select sessions"
  on public.sessions
  for select
  to authenticated
  using (true);
