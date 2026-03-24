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

create table if not exists public.marketing_members (
  id uuid primary key default gen_random_uuid(),
  employee_code text unique,
  full_name text not null,
  role_name text not null,
  manager_name text,
  team_name text default 'Marketing Team',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_tasks (
  id uuid primary key default gen_random_uuid(),
  month_key text not null,
  week_label text,
  task_name text not null,
  priority text check (priority in ('Low', 'Medium', 'High', 'Critical')),
  description text,
  owner_member_id uuid references public.marketing_members(id) on delete set null,
  owner_name text,
  request_source text,
  status text not null default 'Planned',
  start_date date,
  due_date date,
  days_left integer,
  progress_percent numeric(5,2) not null default 0,
  report_to text,
  file_link text,
  result_note text,
  is_checked boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_task_updates (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.marketing_tasks(id) on delete cascade,
  progress_percent numeric(5,2),
  status text,
  note text,
  updated_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.marketing_kpi_definitions (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('team', 'person')),
  role_name text,
  kpi_name text not null,
  metric_type text not null,
  unit text not null,
  weight numeric(6,2) not null default 0,
  target_type text not null default 'monthly',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_kpi_results (
  id uuid primary key default gen_random_uuid(),
  month_key text not null,
  member_id uuid references public.marketing_members(id) on delete set null,
  member_name text,
  kpi_definition_id uuid not null references public.marketing_kpi_definitions(id) on delete cascade,
  target_value numeric,
  actual_value numeric,
  ratio_value numeric,
  score_value numeric,
  result_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_revenue_results (
  id uuid primary key default gen_random_uuid(),
  month_key text not null,
  owner_member_id uuid references public.marketing_members(id) on delete set null,
  owner_name text,
  channel_name text not null,
  revenue_target numeric,
  revenue_actual numeric,
  budget_target numeric,
  budget_actual numeric,
  ratio_value numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_team_results (
  id uuid primary key default gen_random_uuid(),
  month_key text unique not null,
  sales_target numeric not null default 0,
  sales_actual numeric not null default 0,
  expense_budget_target numeric not null default 0,
  expense_budget_actual numeric not null default 0,
  planned_headcount integer not null default 0,
  actual_headcount integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_tasks_month_idx on public.marketing_tasks(month_key);
create index if not exists marketing_tasks_owner_idx on public.marketing_tasks(owner_member_id);
create index if not exists marketing_kpi_results_month_idx on public.marketing_kpi_results(month_key);
create index if not exists marketing_revenue_results_month_idx on public.marketing_revenue_results(month_key);

drop trigger if exists set_marketing_members_updated_at on public.marketing_members;
create trigger set_marketing_members_updated_at
before update on public.marketing_members
for each row execute procedure public.set_updated_at();

drop trigger if exists set_marketing_tasks_updated_at on public.marketing_tasks;
create trigger set_marketing_tasks_updated_at
before update on public.marketing_tasks
for each row execute procedure public.set_updated_at();

drop trigger if exists set_marketing_kpi_definitions_updated_at on public.marketing_kpi_definitions;
create trigger set_marketing_kpi_definitions_updated_at
before update on public.marketing_kpi_definitions
for each row execute procedure public.set_updated_at();

drop trigger if exists set_marketing_kpi_results_updated_at on public.marketing_kpi_results;
create trigger set_marketing_kpi_results_updated_at
before update on public.marketing_kpi_results
for each row execute procedure public.set_updated_at();

drop trigger if exists set_marketing_revenue_results_updated_at on public.marketing_revenue_results;
create trigger set_marketing_revenue_results_updated_at
before update on public.marketing_revenue_results
for each row execute procedure public.set_updated_at();

drop trigger if exists set_marketing_team_results_updated_at on public.marketing_team_results;
create trigger set_marketing_team_results_updated_at
before update on public.marketing_team_results
for each row execute procedure public.set_updated_at();

create or replace view public.marketing_task_summary_view as
select
  month_key,
  owner_name,
  count(*) as total_tasks,
  count(*) filter (where status = 'Completed') as completed_tasks,
  count(*) filter (where status in ('Failed')) as failed_tasks,
  count(*) filter (where status not in ('Completed', 'Failed')) as active_tasks,
  avg(progress_percent) as average_progress
from public.marketing_tasks
group by month_key, owner_name;

create or replace view public.marketing_dashboard_rollup_view as
select
  r.month_key,
  r.sales_target,
  r.sales_actual,
  r.expense_budget_target,
  r.expense_budget_actual,
  r.planned_headcount,
  r.actual_headcount,
  coalesce(sum(case when t.status = 'Completed' then 1 else 0 end), 0) as completed_tasks,
  coalesce(sum(case when t.status not in ('Completed', 'Failed') then 1 else 0 end), 0) as open_tasks
from public.marketing_team_results r
left join public.marketing_tasks t on t.month_key = r.month_key
group by
  r.month_key,
  r.sales_target,
  r.sales_actual,
  r.expense_budget_target,
  r.expense_budget_actual,
  r.planned_headcount,
  r.actual_headcount;
