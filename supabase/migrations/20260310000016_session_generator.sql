create or replace function public.admin_generate_sessions(
  p_cohort_id  uuid,
  p_program_id uuid,
  p_org_id     uuid,
  p_sessions   jsonb   -- [{title, starts_at, ends_at, location}]
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not (public.is_platform_admin() or public.is_org_admin(p_org_id)) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.cohorts
    where id = p_cohort_id and org_id = p_org_id and program_id = p_program_id
  ) then
    raise exception 'Cohort not found' using errcode = 'P0002';
  end if;

  -- Idempotent: clear existing scheduled sessions before regenerating
  delete from public.sessions
  where cohort_id = p_cohort_id and status = 'scheduled';

  insert into public.sessions (cohort_id, program_id, org_id, title, starts_at, ends_at, location, notes)
  select
    p_cohort_id,
    p_program_id,
    p_org_id,
    (s->>'title')::text,
    (s->>'starts_at')::timestamptz,
    (s->>'ends_at')::timestamptz,
    nullif((s->>'location')::text, ''),
    null
  from jsonb_array_elements(p_sessions) as s;

  get diagnostics v_count = row_count;

  perform public.log_event(
    'sessions_generated', 'cohort',
    p_org_id, auth.uid(),
    jsonb_build_object('cohort_id', p_cohort_id, 'session_count', v_count)
  );

  return v_count;
end;
$$;

grant execute on function public.admin_generate_sessions to authenticated;
