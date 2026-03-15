-- Issue #8: Programs, Cohorts, Sessions — Admin CRUD RPCs

-- ─── admin_create_program ─────────────────────────────────────────────────────

create or replace function public.admin_create_program(
  p_org_id      uuid,
  p_name        text,
  p_description text,
  p_subject     text,
  p_min_age     integer,
  p_max_age     integer,
  p_is_active   boolean
) returns uuid language plpgsql security definer as $$
declare
  v_id uuid;
begin
  -- Guard: platform admin or org admin
  if not (public.is_platform_admin() or public.is_org_admin(p_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  -- Validate age range
  if p_min_age is not null and p_max_age is not null and p_min_age > p_max_age then
    raise exception 'Minimum age must be less than or equal to maximum age' using errcode = '22023';
  end if;

  -- Insert (23505 bubbles up on duplicate org_id+name)
  insert into public.programs (org_id, name, description, subject, min_age, max_age, is_active)
    values (p_org_id, p_name, p_description, p_subject, p_min_age, p_max_age, p_is_active)
    returning id into v_id;

  return v_id;
end;
$$;

-- ─── admin_update_program ─────────────────────────────────────────────────────

create or replace function public.admin_update_program(
  p_id          uuid,
  p_name        text,
  p_description text,
  p_subject     text,
  p_min_age     integer,
  p_max_age     integer,
  p_is_active   boolean
) returns void language plpgsql security definer as $$
declare
  v_org_id uuid;
begin
  -- Fetch program
  select org_id into v_org_id from public.programs where id = p_id;
  if not found then
    raise exception 'Program not found' using errcode = 'P0002';
  end if;

  -- Guard
  if not (public.is_platform_admin() or public.is_org_admin(v_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  -- Validate age range
  if p_min_age is not null and p_max_age is not null and p_min_age > p_max_age then
    raise exception 'Minimum age must be less than or equal to maximum age' using errcode = '22023';
  end if;

  update public.programs
    set name        = p_name,
        description = p_description,
        subject     = p_subject,
        min_age     = p_min_age,
        max_age     = p_max_age,
        is_active   = p_is_active,
        updated_at  = now()
    where id = p_id;
end;
$$;

-- ─── admin_delete_program ─────────────────────────────────────────────────────

create or replace function public.admin_delete_program(
  p_id uuid
) returns void language plpgsql security definer as $$
declare
  v_org_id uuid;
begin
  select org_id into v_org_id from public.programs where id = p_id;
  if not found then
    raise exception 'Program not found' using errcode = 'P0002';
  end if;

  if not (public.is_platform_admin() or public.is_org_admin(v_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  delete from public.programs where id = p_id;
end;
$$;

-- ─── admin_create_cohort ──────────────────────────────────────────────────────

create or replace function public.admin_create_cohort(
  p_org_id     uuid,
  p_program_id uuid,
  p_name       text,
  p_start_date date,
  p_end_date   date,
  p_capacity   integer,
  p_status     text
) returns uuid language plpgsql security definer as $$
declare
  v_id uuid;
begin
  -- Guard
  if not (public.is_platform_admin() or public.is_org_admin(p_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  -- Validate status
  if p_status not in ('upcoming', 'active', 'completed', 'cancelled') then
    raise exception 'Invalid status: %', p_status using errcode = '22023';
  end if;

  -- Validate capacity
  if p_capacity is not null and p_capacity <= 0 then
    raise exception 'Capacity must be greater than zero' using errcode = '22023';
  end if;

  -- Validate dates
  if p_start_date is not null and p_end_date is not null and p_start_date > p_end_date then
    raise exception 'Start date must be before or equal to end date' using errcode = '22023';
  end if;

  insert into public.cohorts (org_id, program_id, name, start_date, end_date, capacity, status)
    values (p_org_id, p_program_id, p_name, p_start_date, p_end_date, p_capacity, p_status)
    returning id into v_id;

  return v_id;
end;
$$;

-- ─── admin_update_cohort ──────────────────────────────────────────────────────

create or replace function public.admin_update_cohort(
  p_id         uuid,
  p_name       text,
  p_start_date date,
  p_end_date   date,
  p_capacity   integer,
  p_status     text
) returns void language plpgsql security definer as $$
declare
  v_org_id uuid;
begin
  select org_id into v_org_id from public.cohorts where id = p_id;
  if not found then
    raise exception 'Cohort not found' using errcode = 'P0002';
  end if;

  if not (public.is_platform_admin() or public.is_org_admin(v_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  -- Validate status
  if p_status not in ('upcoming', 'active', 'completed', 'cancelled') then
    raise exception 'Invalid status: %', p_status using errcode = '22023';
  end if;

  -- Validate capacity
  if p_capacity is not null and p_capacity <= 0 then
    raise exception 'Capacity must be greater than zero' using errcode = '22023';
  end if;

  -- Validate dates
  if p_start_date is not null and p_end_date is not null and p_start_date > p_end_date then
    raise exception 'Start date must be before or equal to end date' using errcode = '22023';
  end if;

  update public.cohorts
    set name       = p_name,
        start_date = p_start_date,
        end_date   = p_end_date,
        capacity   = p_capacity,
        status     = p_status,
        updated_at = now()
    where id = p_id;
end;
$$;

-- ─── admin_delete_cohort ──────────────────────────────────────────────────────

create or replace function public.admin_delete_cohort(
  p_id uuid
) returns void language plpgsql security definer as $$
declare
  v_org_id uuid;
begin
  select org_id into v_org_id from public.cohorts where id = p_id;
  if not found then
    raise exception 'Cohort not found' using errcode = 'P0002';
  end if;

  if not (public.is_platform_admin() or public.is_org_admin(v_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  delete from public.cohorts where id = p_id;
end;
$$;

-- ─── admin_create_session ─────────────────────────────────────────────────────

create or replace function public.admin_create_session(
  p_cohort_id  uuid,
  p_program_id uuid,
  p_org_id     uuid,
  p_title      text,
  p_starts_at  timestamptz,
  p_ends_at    timestamptz,
  p_location   text,
  p_notes      text
) returns uuid language plpgsql security definer as $$
declare
  v_id uuid;
begin
  -- Guard
  if not (public.is_platform_admin() or public.is_org_admin(p_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  -- Validate times
  if p_starts_at >= p_ends_at then
    raise exception 'End time must be after start time' using errcode = '22023';
  end if;

  insert into public.sessions (cohort_id, program_id, org_id, title, starts_at, ends_at, location, notes)
    values (p_cohort_id, p_program_id, p_org_id, p_title, p_starts_at, p_ends_at, p_location, p_notes)
    returning id into v_id;

  return v_id;
end;
$$;

-- ─── admin_update_session ─────────────────────────────────────────────────────

create or replace function public.admin_update_session(
  p_id        uuid,
  p_title     text,
  p_starts_at timestamptz,
  p_ends_at   timestamptz,
  p_location  text,
  p_notes     text,
  p_status    text
) returns void language plpgsql security definer as $$
declare
  v_org_id uuid;
begin
  select org_id into v_org_id from public.sessions where id = p_id;
  if not found then
    raise exception 'Session not found' using errcode = 'P0002';
  end if;

  if not (public.is_platform_admin() or public.is_org_admin(v_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  -- Validate times
  if p_starts_at >= p_ends_at then
    raise exception 'End time must be after start time' using errcode = '22023';
  end if;

  -- Validate status
  if p_status not in ('scheduled', 'in_progress', 'completed', 'cancelled') then
    raise exception 'Invalid status: %', p_status using errcode = '22023';
  end if;

  update public.sessions
    set title      = p_title,
        starts_at  = p_starts_at,
        ends_at    = p_ends_at,
        location   = p_location,
        notes      = p_notes,
        status     = p_status,
        updated_at = now()
    where id = p_id;
end;
$$;

-- ─── admin_delete_session ─────────────────────────────────────────────────────

create or replace function public.admin_delete_session(
  p_id uuid
) returns void language plpgsql security definer as $$
declare
  v_org_id uuid;
begin
  select org_id into v_org_id from public.sessions where id = p_id;
  if not found then
    raise exception 'Session not found' using errcode = 'P0002';
  end if;

  if not (public.is_platform_admin() or public.is_org_admin(v_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  delete from public.sessions where id = p_id;
end;
$$;
