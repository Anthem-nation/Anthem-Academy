-- Allow unauthenticated visitors to read active, non-archived orgs
create policy "public can view active organizations"
  on public.organizations for select to anon
  using (is_active = true and archived_at is null);

-- Allow unauthenticated visitors to read active programs
create policy "public can view active programs"
  on public.programs for select to anon
  using (is_active = true);

-- Allow unauthenticated visitors to read upcoming/active cohorts
create policy "public can view upcoming and active cohorts"
  on public.cohorts for select to anon
  using (status in ('upcoming', 'active'));
