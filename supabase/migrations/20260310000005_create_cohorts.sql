create table public.cohorts (
  id          uuid        primary key default gen_random_uuid(),
  program_id  uuid        not null references public.programs(id) on delete cascade,
  org_id      uuid        not null references public.organizations(id) on delete cascade,
  name        text        not null,
  start_date  date,
  end_date    date,
  capacity    integer,
  status      text        not null default 'upcoming'
                          check (status in ('upcoming', 'active', 'completed', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint cohorts_date_order_valid
    check (start_date is null or end_date is null or start_date <= end_date),
  constraint cohorts_capacity_positive
    check (capacity is null or capacity > 0)
);

create trigger set_cohorts_updated_at
  before update on public.cohorts
  for each row execute procedure public.set_updated_at();

create index idx_cohorts_program_id on public.cohorts (program_id);
create index idx_cohorts_org_id     on public.cohorts (org_id);
create index idx_cohorts_status     on public.cohorts (status);

-- RLS: any authenticated user can read cohorts
alter table public.cohorts enable row level security;

create policy "authenticated users can select cohorts"
  on public.cohorts
  for select
  to authenticated
  using (true);
