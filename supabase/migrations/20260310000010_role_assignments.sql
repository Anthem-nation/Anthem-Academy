-- Issue #7: Role assignments, audit log, and JWT claims hook

-- ─── role_change_log table ────────────────────────────────────────────────────

create table public.role_change_log (
  id         uuid        primary key default gen_random_uuid(),
  org_id     uuid        not null references public.organizations(id) on delete cascade,
  person_id  uuid        not null references public.persons(id) on delete cascade,
  changed_by uuid        not null references auth.users(id),
  old_role   text,
  new_role   text,
  changed_at timestamptz not null default now()
);

alter table public.role_change_log enable row level security;

create policy "platform admins can select all role change logs"
  on public.role_change_log for select to authenticated
  using ((select role from public.persons where id = auth.uid()) = 'admin');

create policy "org admins can select role change logs for their org"
  on public.role_change_log for select to authenticated
  using (public.is_org_admin(org_id));

-- ─── admin_add_member ─────────────────────────────────────────────────────────

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

  -- Audit log
  insert into public.role_change_log (org_id, person_id, changed_by, old_role, new_role)
    values (p_org_id, v_person_id, auth.uid(), null, p_role);

  return v_membership_id;
end;
$$;

-- ─── admin_update_member_role ─────────────────────────────────────────────────

create or replace function public.admin_update_member_role(
  p_membership_id uuid,
  p_new_role      text
) returns void language plpgsql security definer as $$
declare
  v_org_id    uuid;
  v_person_id uuid;
  v_old_role  text;
begin
  -- Fetch membership
  select org_id, person_id, role
    into v_org_id, v_person_id, v_old_role
    from public.org_memberships
    where id = p_membership_id;

  if not found then
    raise exception 'Membership not found' using errcode = 'P0002';
  end if;

  -- Guard: platform admin or org admin
  if not (public.is_platform_admin() or public.is_org_admin(v_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  -- Validate role
  if p_new_role not in ('admin', 'staff', 'student', 'parent') then
    raise exception 'Invalid role: %', p_new_role using errcode = '22023';
  end if;

  -- No-op if role unchanged
  if v_old_role = p_new_role then
    return;
  end if;

  -- Update membership
  update public.org_memberships set role = p_new_role where id = p_membership_id;

  -- Audit log
  insert into public.role_change_log (org_id, person_id, changed_by, old_role, new_role)
    values (v_org_id, v_person_id, auth.uid(), v_old_role, p_new_role);
end;
$$;

-- ─── admin_remove_member ──────────────────────────────────────────────────────

create or replace function public.admin_remove_member(
  p_membership_id uuid
) returns void language plpgsql security definer as $$
declare
  v_org_id    uuid;
  v_person_id uuid;
  v_old_role  text;
begin
  -- Fetch membership
  select org_id, person_id, role
    into v_org_id, v_person_id, v_old_role
    from public.org_memberships
    where id = p_membership_id;

  if not found then
    raise exception 'Membership not found' using errcode = 'P0002';
  end if;

  -- Guard: platform admin or org admin
  if not (public.is_platform_admin() or public.is_org_admin(v_org_id)) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  -- Delete membership
  delete from public.org_memberships where id = p_membership_id;

  -- Audit log
  insert into public.role_change_log (org_id, person_id, changed_by, old_role, new_role)
    values (v_org_id, v_person_id, auth.uid(), v_old_role, null);
end;
$$;

-- ─── Custom JWT claims hook ───────────────────────────────────────────────────

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql security definer stable as $$
declare
  v_user_id   uuid := (event->>'user_id')::uuid;
  v_org_roles jsonb;
  v_claims    jsonb := event->'claims';
begin
  select coalesce(jsonb_agg(
    jsonb_build_object('org_id', org_id::text, 'role', role) order by joined_at
  ), '[]') into v_org_roles
  from public.org_memberships where person_id = v_user_id;

  v_claims := jsonb_set(v_claims, '{app_metadata}',
    coalesce(v_claims->'app_metadata', '{}') ||
    jsonb_build_object('org_roles', v_org_roles));
  return jsonb_set(event, '{claims}', v_claims);
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
