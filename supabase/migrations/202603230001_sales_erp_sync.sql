create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.sales_kpi_sync_runs (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null,
  from_date date not null,
  to_date date not null,
  month text not null,
  request_url text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  revenue_without_vat numeric,
  revenue_with_vat numeric,
  new_customer_count integer,
  items_count integer,
  payload jsonb,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (employee_code, from_date, to_date)
);

create table if not exists public.kpi_item_breakdowns (
  id uuid primary key default gen_random_uuid(),
  asm_id text not null,
  month text not null,
  from_date date not null,
  to_date date not null,
  item_code text not null,
  item_name text,
  quantity numeric not null default 0,
  source text not null default 'erp_api' check (source in ('erp_api', 'manual')),
  sync_run_id uuid references public.sales_kpi_sync_runs(id) on delete set null,
  source_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (asm_id, month, item_code, from_date, to_date)
);

alter table if exists public.kpi_data
  add column if not exists from_date date,
  add column if not exists to_date date,
  add column if not exists revenue_with_vat numeric,
  add column if not exists source_synced_at timestamptz,
  add column if not exists sync_run_id uuid references public.sales_kpi_sync_runs(id) on delete set null,
  add column if not exists source_system text default 'erp_api',
  add column if not exists raw_payload jsonb;

create index if not exists sales_kpi_sync_runs_employee_code_idx on public.sales_kpi_sync_runs(employee_code);
create index if not exists sales_kpi_sync_runs_month_idx on public.sales_kpi_sync_runs(month);
create index if not exists kpi_item_breakdowns_asm_month_idx on public.kpi_item_breakdowns(asm_id, month);
create index if not exists kpi_item_breakdowns_item_code_idx on public.kpi_item_breakdowns(item_code);

drop trigger if exists set_kpi_item_breakdowns_updated_at on public.kpi_item_breakdowns;
create trigger set_kpi_item_breakdowns_updated_at
before update on public.kpi_item_breakdowns
for each row execute procedure public.set_updated_at();

alter table public.sales_kpi_sync_runs enable row level security;
alter table public.kpi_item_breakdowns enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sales_kpi_sync_runs' and policyname = 'sales_kpi_sync_runs_select_authenticated'
  ) then
    create policy "sales_kpi_sync_runs_select_authenticated"
      on public.sales_kpi_sync_runs
      for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'kpi_item_breakdowns' and policyname = 'kpi_item_breakdowns_select_authenticated'
  ) then
    create policy "kpi_item_breakdowns_select_authenticated"
      on public.kpi_item_breakdowns
      for select
      to authenticated
      using (true);
  end if;
end $$;
