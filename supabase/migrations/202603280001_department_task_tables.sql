-- ============================================================
-- Department task tables — Finance, HR, Medical, IT, Supply Chain
-- All share the same schema; keyed by month_key (any period format)
-- ============================================================

-- ── Finance Tasks ──────────────────────────────────────────
create table if not exists public.finance_tasks (
  id               uuid primary key default gen_random_uuid(),
  month_key        text not null,
  task_name        text not null,
  owner_name       text not null default '',
  request_source   text not null default '',
  priority         text not null default 'Medium',
  status           text not null default 'Planned',
  due_date         date,
  result_note      text not null default '',
  progress_percent integer not null default 0,
  file_link        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.finance_tasks enable row level security;
create policy "Allow all" on public.finance_tasks for all using (true) with check (true);
create index if not exists finance_tasks_month_key_idx on public.finance_tasks (month_key);

-- ── HR Tasks ───────────────────────────────────────────────
create table if not exists public.hr_tasks (
  id               uuid primary key default gen_random_uuid(),
  month_key        text not null,
  task_name        text not null,
  owner_name       text not null default '',
  request_source   text not null default '',
  priority         text not null default 'Medium',
  status           text not null default 'Planned',
  due_date         date,
  result_note      text not null default '',
  progress_percent integer not null default 0,
  file_link        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.hr_tasks enable row level security;
create policy "Allow all" on public.hr_tasks for all using (true) with check (true);
create index if not exists hr_tasks_month_key_idx on public.hr_tasks (month_key);

-- ── Medical Tasks ──────────────────────────────────────────
create table if not exists public.medical_tasks (
  id               uuid primary key default gen_random_uuid(),
  month_key        text not null,
  task_name        text not null,
  owner_name       text not null default '',
  request_source   text not null default '',
  priority         text not null default 'Medium',
  status           text not null default 'Planned',
  due_date         date,
  result_note      text not null default '',
  progress_percent integer not null default 0,
  file_link        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.medical_tasks enable row level security;
create policy "Allow all" on public.medical_tasks for all using (true) with check (true);
create index if not exists medical_tasks_month_key_idx on public.medical_tasks (month_key);

-- ── IT Tasks ───────────────────────────────────────────────
create table if not exists public.it_tasks (
  id               uuid primary key default gen_random_uuid(),
  month_key        text not null,
  task_name        text not null,
  owner_name       text not null default '',
  request_source   text not null default '',
  priority         text not null default 'Medium',
  status           text not null default 'Planned',
  due_date         date,
  result_note      text not null default '',
  progress_percent integer not null default 0,
  file_link        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.it_tasks enable row level security;
create policy "Allow all" on public.it_tasks for all using (true) with check (true);
create index if not exists it_tasks_month_key_idx on public.it_tasks (month_key);

-- ── Supply Chain Tasks ─────────────────────────────────────
create table if not exists public.sc_tasks (
  id               uuid primary key default gen_random_uuid(),
  month_key        text not null,
  task_name        text not null,
  owner_name       text not null default '',
  request_source   text not null default '',
  priority         text not null default 'Medium',
  status           text not null default 'Planned',
  due_date         date,
  result_note      text not null default '',
  progress_percent integer not null default 0,
  file_link        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.sc_tasks enable row level security;
create policy "Allow all" on public.sc_tasks for all using (true) with check (true);
create index if not exists sc_tasks_month_key_idx on public.sc_tasks (month_key);

-- ============================================================
-- Finance Assets — for Asset Breakdown page (/finance/assets)
-- ============================================================
create table if not exists public.finance_assets (
  id         uuid primary key default gen_random_uuid(),
  period     text not null,
  category   text not null,  -- 'fixed' | 'current' | 'intangible' | 'liability'
  item       text not null,
  value      numeric,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period, category, item)
);

alter table public.finance_assets enable row level security;
create policy "Allow all" on public.finance_assets for all using (true) with check (true);
create index if not exists finance_assets_period_idx on public.finance_assets (period);

-- ============================================================
-- unit_cost column for SC inventory value calculation
-- ============================================================
alter table public.sku_lot_dates
  add column if not exists unit_cost numeric;
