create table public.roles (
  name        text        primary key,
  label       text        not null,
  description text,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_roles_updated_at
  before update on public.roles
  for each row execute procedure public.set_updated_at();

-- Seed canonical roles in migration so every environment (prod, staging, local)
-- always has them, regardless of whether seed.sql is run.
insert into public.roles (name, label, description, sort_order) values
  ('admin',   'Administrator', 'Full platform access; manages orgs and users.',      1),
  ('staff',   'Staff',         'Instructor or coordinator within an organization.',   2),
  ('student', 'Student',       'Enrolled learner.',                                  3),
  ('parent',  'Parent',        'Guardian linked to one or more student accounts.',    4)
on conflict (name) do update set
  label       = excluded.label,
  description = excluded.description,
  sort_order  = excluded.sort_order,
  updated_at  = now();

-- RLS: any authenticated user can read roles
alter table public.roles enable row level security;

create policy "authenticated users can select roles"
  on public.roles
  for select
  to authenticated
  using (true);
