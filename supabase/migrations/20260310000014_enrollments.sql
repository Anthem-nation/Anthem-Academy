-- ─── 1. enrollments table ───────────────────────────────────────────────────
create table public.enrollments (
  id              uuid        primary key default gen_random_uuid(),
  cohort_id       uuid        not null references public.cohorts(id)       on delete cascade,
  org_id          uuid        not null references public.organizations(id) on delete cascade,
  person_id       uuid        not null references public.persons(id)       on delete cascade,
  enrollment_data jsonb       not null default '{}',
  status          text        not null default 'pending'
                              check (status in ('pending', 'active', 'dropped', 'completed')),
  enrolled_at     timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint enrollments_unique_per_cohort unique (cohort_id, person_id)
);

create index enrollments_person_id_idx  on public.enrollments (person_id);
create index enrollments_cohort_id_idx  on public.enrollments (cohort_id);
create index enrollments_org_id_idx     on public.enrollments (org_id);

alter table public.enrollments enable row level security;

-- Students see their own enrollments
create policy "students can view their own enrollments"
  on public.enrollments for select to authenticated
  using (person_id = auth.uid());

-- Org admins see all enrollments in their org
create policy "org admins can view enrollments in their org"
  on public.enrollments for select to authenticated
  using (public.is_org_admin(org_id));

-- ─── 2. anon SELECT on org_settings (for enrollment form field rendering) ───
create policy "public can view org settings"
  on public.org_settings for select to anon
  using (true);

-- ─── 3. Update handle_new_user trigger to persist full_name from metadata ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'student');
  if user_role not in ('student', 'parent', 'staff') then
    user_role := 'student';
  end if;
  insert into public.persons (id, email, role, full_name)
  values (new.id, new.email, user_role,
          nullif(trim(new.raw_user_meta_data->>'full_name'), ''));
  return new;
end;
$$;

-- ─── 4. submit_enrollment RPC ───────────────────────────────────────────────
create or replace function public.submit_enrollment(
  p_cohort_id       uuid,
  p_person_id       uuid,
  p_enrollment_data jsonb default '{}'
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment_id uuid;
  v_org_id        uuid;
begin
  select org_id into v_org_id
  from public.cohorts
  where id = p_cohort_id and status in ('upcoming', 'active');

  if v_org_id is null then
    raise exception 'Cohort not found or not open for enrollment'
      using errcode = 'P0002';
  end if;

  insert into public.enrollments (cohort_id, org_id, person_id, enrollment_data, status)
  values (p_cohort_id, v_org_id, p_person_id, p_enrollment_data, 'pending')
  returning id into v_enrollment_id;

  perform public.log_event(
    'enrollment_created', 'enrollment',
    v_org_id, p_person_id,
    jsonb_build_object('enrollment_id', v_enrollment_id, 'cohort_id', p_cohort_id)
  );

  return v_enrollment_id;
end;
$$;

grant execute on function public.submit_enrollment to anon, authenticated;
