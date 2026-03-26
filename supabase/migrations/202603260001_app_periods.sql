-- App-level period configuration stored in Supabase
-- Replaces the cookie/file approach so periods persist across devices and deployments

create table if not exists public.app_periods (
  key        text primary key,          -- e.g. "2026-03"
  label      text not null,             -- e.g. "March 2026"
  start_date date not null,             -- e.g. 2026-03-01
  end_date   date not null,             -- e.g. 2026-03-31
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed with default periods
insert into public.app_periods (key, label, start_date, end_date)
values
  ('2026-03', 'March 2026', '2026-03-01', '2026-03-31'),
  ('2026-04', 'April 2026', '2026-04-01', '2026-04-30'),
  ('2026-05', 'May 2026',   '2026-05-01', '2026-05-31')
on conflict (key) do nothing;

-- Allow read/write for anon and authenticated users (internal tool)
alter table public.app_periods enable row level security;

create policy "Allow all for authenticated" on public.app_periods
  for all using (true) with check (true);
