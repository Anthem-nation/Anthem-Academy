-- Anthem Academy — Development Seed Data
-- Run via: supabase db reset
-- All UUIDs are hardcoded so the script is fully idempotent.
-- Passwords for all test users: TestPassword123!

-- ─────────────────────────────────────────
-- 1. auth.users  (Supabase internal table)
-- ─────────────────────────────────────────
insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
) values
  (
    '00000000-0000-0000-0000-000000000001',
    'admin@anthem.test',
    crypt('TestPassword123!', gen_salt('bf')),
    now(),
    '{"role": "admin"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'staff@anthem.test',
    crypt('TestPassword123!', gen_salt('bf')),
    now(),
    '{"role": "staff"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'student@anthem.test',
    crypt('TestPassword123!', gen_salt('bf')),
    now(),
    '{"role": "student"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  )
on conflict (id) do nothing;

-- ─────────────────────────────────────────
-- 2. organizations
-- ─────────────────────────────────────────
insert into public.organizations (id, name, slug, is_active) values
  ('00000000-0000-0000-0000-000000000010', 'Anthem Academy',    'anthem-academy',    true),
  ('00000000-0000-0000-0000-000000000011', 'Harmony Institute', 'harmony-institute', true)
on conflict (id) do nothing;

-- ─────────────────────────────────────────
-- 3. persons
-- handle_new_user() fires on the auth.users inserts above and creates persons
-- rows with role='student' for every user (including admin — the trigger blocks
-- self-served admin). We must DO UPDATE to correct the role and set other fields.
-- ─────────────────────────────────────────
insert into public.persons (id, email, role, org_id, full_name) values
  (
    '00000000-0000-0000-0000-000000000001',
    'admin@anthem.test',
    'admin',
    '00000000-0000-0000-0000-000000000010',
    'Alex Admin'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'staff@anthem.test',
    'staff',
    '00000000-0000-0000-0000-000000000010',
    'Sam Staff'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'student@anthem.test',
    'student',
    '00000000-0000-0000-0000-000000000010',
    'Stella Student'
  )
on conflict (id) do update set
  role      = excluded.role,
  org_id    = excluded.org_id,
  full_name = excluded.full_name;

-- ─────────────────────────────────────────
-- 4. roles  (canonical rows; also seeded in migration 3)
-- ─────────────────────────────────────────
insert into public.roles (name, label, description, sort_order) values
  ('admin',   'Administrator', 'Full platform access; manages orgs and users.',     1),
  ('staff',   'Staff',         'Instructor or coordinator within an organization.',  2),
  ('student', 'Student',       'Enrolled learner.',                                 3),
  ('parent',  'Parent',        'Guardian linked to one or more student accounts.',   4)
on conflict (name) do nothing;

-- ─────────────────────────────────────────
-- 5. org_memberships
-- ─────────────────────────────────────────
insert into public.org_memberships (id, org_id, person_id, role) values
  -- Anthem Academy members
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'admin'),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', 'staff'),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000003', 'student'),
  -- Admin is also in Harmony Institute
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'admin')
on conflict (id) do nothing;

-- ─────────────────────────────────────────
-- 6. programs
-- ─────────────────────────────────────────
insert into public.programs (id, org_id, name, description, subject, min_age, max_age, is_active) values
  (
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000010',
    'Grade 3 Mathematics',
    'Foundational arithmetic and problem solving for 8–9 year olds.',
    'Mathematics',
    8, 9,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000010',
    'Advanced Music Theory',
    'Harmony, counterpoint, and composition for advanced students.',
    'Music',
    14, null,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000032',
    '00000000-0000-0000-0000-000000000011',
    'Beginner Piano',
    'Introduction to piano technique and basic music reading.',
    'Music',
    6, 12,
    true
  )
on conflict (id) do nothing;

-- ─────────────────────────────────────────
-- 7. cohorts
-- ─────────────────────────────────────────
insert into public.cohorts (id, program_id, org_id, name, start_date, end_date, capacity, status) values
  (
    '00000000-0000-0000-0000-000000000040',
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000010',
    'Grade 3 Math — Spring 2026 Section A',
    '2026-03-16', '2026-06-15',
    20, 'upcoming'
  ),
  (
    '00000000-0000-0000-0000-000000000041',
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000010',
    'Grade 3 Math — Spring 2026 Section B',
    '2026-03-16', '2026-06-15',
    20, 'upcoming'
  ),
  (
    '00000000-0000-0000-0000-000000000042',
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000010',
    'Advanced Music Theory — Spring 2026',
    '2026-03-16', '2026-06-15',
    15, 'upcoming'
  )
on conflict (id) do nothing;

-- ─────────────────────────────────────────
-- 8. sessions  (times in UTC)
-- ─────────────────────────────────────────
insert into public.sessions (id, cohort_id, program_id, org_id, title, starts_at, ends_at, location, status) values
  (
    '00000000-0000-0000-0000-000000000050',
    '00000000-0000-0000-0000-000000000040',
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000010',
    'Grade 3 Math Section A — Week 1',
    '2026-03-16 14:00:00+00', '2026-03-16 15:00:00+00',
    'Room 101',
    'scheduled'
  ),
  (
    '00000000-0000-0000-0000-000000000051',
    '00000000-0000-0000-0000-000000000040',
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000010',
    'Grade 3 Math Section A — Week 2',
    '2026-03-23 14:00:00+00', '2026-03-23 15:00:00+00',
    'Room 101',
    'scheduled'
  ),
  (
    '00000000-0000-0000-0000-000000000052',
    '00000000-0000-0000-0000-000000000041',
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000010',
    'Grade 3 Math Section B — Week 1',
    '2026-03-17 16:00:00+00', '2026-03-17 17:00:00+00',
    'Room 102',
    'scheduled'
  ),
  (
    '00000000-0000-0000-0000-000000000053',
    '00000000-0000-0000-0000-000000000042',
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000010',
    'Advanced Music Theory — Week 1',
    '2026-03-18 18:00:00+00', '2026-03-18 19:30:00+00',
    'Music Hall A',
    'scheduled'
  )
on conflict (id) do nothing;
