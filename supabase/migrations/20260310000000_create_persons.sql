-- Create persons table for user profile and role storage
create table public.persons (
  id         uuid        primary key references auth.users(id) on delete cascade,
  email      text        not null,
  role       text        not null default 'student'
                         check (role in ('admin', 'staff', 'student', 'parent')),
  org_id     uuid,
  full_name  text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.persons enable row level security;

-- Users can only read their own row
create policy "users can select their own row"
  on public.persons
  for select
  using (id = auth.uid());

-- Trigger function: auto-insert persons row when a new auth.users row is created
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

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
