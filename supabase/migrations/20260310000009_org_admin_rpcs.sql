-- Issue #6 follow-up: security definer RPC functions for org admin operations
-- These bypass RLS (which has auth.uid() issues in WITH CHECK context) while
-- still enforcing admin-only access inside the function body.

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
  return v_id;
end;
$$;

create or replace function public.admin_update_org(
  p_id        uuid,
  p_name      text,
  p_slug      text,
  p_is_active boolean
) returns void language plpgsql security definer as $$
begin
  if not exists(select 1 from public.persons where id = auth.uid() and role = 'admin') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  update public.organizations set name = p_name, slug = p_slug, is_active = p_is_active
    where id = p_id;
end;
$$;

create or replace function public.admin_update_org_logo(
  p_id       uuid,
  p_logo_url text
) returns void language plpgsql security definer as $$
begin
  if not exists(select 1 from public.persons where id = auth.uid() and role = 'admin') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  update public.organizations set logo_url = p_logo_url where id = p_id;
end;
$$;

create or replace function public.admin_archive_org(
  p_id uuid
) returns void language plpgsql security definer as $$
begin
  if not exists(select 1 from public.persons where id = auth.uid() and role = 'admin') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  update public.organizations set archived_at = now() where id = p_id and archived_at is null;
end;
$$;

create or replace function public.admin_unarchive_org(
  p_id uuid
) returns void language plpgsql security definer as $$
begin
  if not exists(select 1 from public.persons where id = auth.uid() and role = 'admin') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  update public.organizations set archived_at = null where id = p_id;
end;
$$;

create or replace function public.admin_update_org_settings(
  p_org_id            uuid,
  p_timezone          text,
  p_enrollment_fields jsonb
) returns void language plpgsql security definer as $$
begin
  if not exists(select 1 from public.persons where id = auth.uid() and role = 'admin') then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  update public.org_settings
    set timezone = p_timezone, enrollment_fields = p_enrollment_fields
    where org_id = p_org_id;
end;
$$;
