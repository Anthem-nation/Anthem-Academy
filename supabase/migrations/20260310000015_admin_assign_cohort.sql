-- ─── 1. RLS: org admins can UPDATE enrollments in their org ─────────────────
create policy "org admins can update enrollments in their org"
  on public.enrollments for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

-- ─── 2. admin_assign_cohort RPC ─────────────────────────────────────────────
create or replace function public.admin_assign_cohort(
  p_enrollment_id uuid,
  p_cohort_id     uuid,
  p_org_id        uuid
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity   int;
  v_seat_count int;
  v_cohort_org uuid;
begin
  -- Verify caller is org admin
  if not public.is_org_admin(p_org_id) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  -- Validate cohort belongs to org and is open
  select capacity, org_id into v_capacity, v_cohort_org
  from public.cohorts
  where id = p_cohort_id
    and org_id = p_org_id
    and status in ('upcoming', 'active');

  if v_cohort_org is null then
    raise exception 'Cohort not found or not open for enrollment'
      using errcode = 'P0002';
  end if;

  -- Enforce capacity (exclude current enrollment from seat count)
  if v_capacity is not null then
    select count(*) into v_seat_count
    from public.enrollments
    where cohort_id = p_cohort_id
      and status in ('pending', 'active')
      and id <> p_enrollment_id;

    if v_seat_count >= v_capacity then
      raise exception 'Cohort is at full capacity'
        using errcode = 'P0003';
    end if;
  end if;

  -- Assign cohort + activate enrollment
  update public.enrollments
  set cohort_id  = p_cohort_id,
      status     = 'active',
      updated_at = now()
  where id     = p_enrollment_id
    and org_id = p_org_id;

  if not found then
    raise exception 'Enrollment not found' using errcode = 'P0002';
  end if;

  -- Emit domain event (notification hook for V2 email)
  perform public.log_event(
    'enrollment_activated', 'enrollment',
    p_org_id, auth.uid(),
    jsonb_build_object(
      'enrollment_id', p_enrollment_id,
      'cohort_id', p_cohort_id
    )
  );

  return p_enrollment_id;
end;
$$;

grant execute on function public.admin_assign_cohort to authenticated;
