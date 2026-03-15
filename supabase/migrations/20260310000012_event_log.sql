-- Issue #10: General-purpose event_log table, log_event() helper, and wired events

-- ─── event_log table ──────────────────────────────────────────────────────────

create table public.event_log (
  id         uuid        primary key default gen_random_uuid(),
  org_id     uuid        references public.organizations(id) on delete set null,
  entity     text        not null,  -- 'organization' | 'person'
  action     text        not null,  -- 'org_created' | 'person_created' | 'role_assigned'
  actor_id   uuid        references auth.users(id) on delete set null,
  payload    jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

create index event_log_org_created_at_idx on public.event_log (org_id, created_at desc);

-- ─── RLS — append-only ────────────────────────────────────────────────────────

alter table public.event_log enable row level security;

-- No INSERT policy for 'authenticated' → direct client inserts denied
-- No UPDATE policy → updates denied
-- No DELETE policy → deletes denied
-- security definer functions bypass RLS and can INSERT freely

create policy "platform admins can select all events"
  on public.event_log for select to authenticated
  using (public.is_platform_admin());

create policy "org admins can select their org events"
  on public.event_log for select to authenticated
  using (org_id is not null and public.is_org_admin(org_id));

-- ─── log_event() helper ───────────────────────────────────────────────────────

create or replace function public.log_event(
  p_action   text,
  p_entity   text,
  p_org_id   uuid,
  p_actor_id uuid,
  p_payload  jsonb default '{}'
) returns void language plpgsql security definer as $$
begin
  insert into public.event_log (action, entity, org_id, actor_id, payload)
    values (p_action, p_entity, p_org_id, p_actor_id, p_payload);
end;
$$;

-- ─── Wire org_created → admin_create_org ─────────────────────────────────────

create or replace function public.admin_create_org(
  p_name      text,
  p_slug      text,
  p_is_active boolean
) returns uuid language plpgsql security definer as $$
declare v_id uuid;
begin
  if not exists(select 1 from public.persons where id = auth.uid() and role = 'admin') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  insert into public.organizations (name, slug, is_active)
    values (p_name, p_slug, p_is_active)
    returning id into v_id;

  perform public.log_event(
    'org_created', 'organization', v_id, auth.uid(),
    jsonb_build_object('name', p_name, 'slug', p_slug)
  );

  return v_id;
end;
$$;

-- ─── Wire person_created → handle_new_user ───────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
begin
  -- Read role from user_metadata if provided; disallow self-serving admin role
  user_role := coalesce(new.raw_user_meta_data->>'role', 'student');
  if user_role not in ('student', 'parent', 'staff') then
    user_role := 'student';
  end if;

  insert into public.persons (id, email, role)
  values (new.id, new.email, user_role);

  perform public.log_event(
    'person_created', 'person', null, new.id,
    jsonb_build_object('email', new.email, 'role', user_role)
  );

  return new;
end;
$$;

-- ─── Wire role_assigned → admin_add_member ───────────────────────────────────

create or replace function public.admin_add_member(
  p_org_id uuid,
  p_email  text,
  p_role   text
) returns uuid language plpgsql security definer as $$
declare
  v_person_id    uuid;
  v_membership_id uuid;
begin
  -- Guard: platform admin or org admin
  if not (public.is_platform_admin() or public.is_org_admin(p_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  -- Validate role
  if p_role not in ('admin', 'staff', 'student', 'parent') then
    raise exception 'Invalid role: %', p_role using errcode = '22023';
  end if;

  -- Lookup person by email
  select id into v_person_id from public.persons where email = p_email;
  if v_person_id is null then
    raise exception 'No user found with that email' using errcode = 'P0002';
  end if;

  -- Insert membership (may raise 23505 on duplicate)
  insert into public.org_memberships (org_id, person_id, role)
    values (p_org_id, v_person_id, p_role)
    returning id into v_membership_id;

  -- Audit log (existing)
  insert into public.role_change_log (org_id, person_id, changed_by, old_role, new_role)
    values (p_org_id, v_person_id, auth.uid(), null, p_role);

  -- Event log
  perform public.log_event(
    'role_assigned', 'person', p_org_id, auth.uid(),
    jsonb_build_object('person_id', v_person_id::text, 'role', p_role)
  );

  return v_membership_id;
end;
$$;
