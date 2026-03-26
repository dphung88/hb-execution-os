create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  leader_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.departments (code, name)
values
  ('sales', 'Sales'),
  ('marketing', 'Marketing'),
  ('it', 'IT'),
  ('hr', 'HR'),
  ('finance', 'Finance'),
  ('supply_chain', 'Supply Chain'),
  ('medical', 'Medical')
on conflict (code) do nothing;

alter table public.profiles
  add column if not exists department_id uuid references public.departments(id) on delete set null,
  add column if not exists title text,
  add column if not exists is_department_lead boolean not null default false;

alter table public.tasks
  add column if not exists department_id uuid references public.departments(id) on delete set null,
  add column if not exists goal_id uuid,
  add column if not exists initiative_id uuid,
  add column if not exists progress_percent numeric(5,2) not null default 0,
  add column if not exists health_status text not null default 'green',
  add column if not exists blocker_status text not null default 'none',
  add column if not exists needs_leadership_support boolean not null default false,
  add column if not exists last_update_note text,
  add column if not exists completed_at timestamptz;

alter table public.tasks
  drop constraint if exists tasks_health_status_check,
  add constraint tasks_health_status_check
    check (health_status in ('green', 'yellow', 'red'));

alter table public.tasks
  drop constraint if exists tasks_blocker_status_check,
  add constraint tasks_blocker_status_check
    check (blocker_status in ('none', 'at_risk', 'blocked'));

create table if not exists public.department_goals (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  title text not null,
  description text,
  period_type text not null check (period_type in ('monthly', 'quarterly', 'annual')),
  period_label text not null,
  owner_user_id uuid references public.profiles(id) on delete set null,
  target_date date,
  progress_percent numeric(5,2) not null default 0,
  health_status text not null default 'green' check (health_status in ('green', 'yellow', 'red')),
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.initiatives (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  goal_id uuid references public.department_goals(id) on delete set null,
  title text not null,
  description text,
  owner_user_id uuid references public.profiles(id) on delete set null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  start_date date,
  target_date date,
  progress_percent numeric(5,2) not null default 0,
  health_status text not null default 'green' check (health_status in ('green', 'yellow', 'red')),
  status text not null default 'planned' check (status in ('planned', 'active', 'blocked', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tasks_goal_id_fkey'
  ) then
    alter table public.tasks
      add constraint tasks_goal_id_fkey
        foreign key (goal_id) references public.department_goals(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tasks_initiative_id_fkey'
  ) then
    alter table public.tasks
      add constraint tasks_initiative_id_fkey
        foreign key (initiative_id) references public.initiatives(id) on delete set null;
  end if;
end $$;

create table if not exists public.task_updates (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null check (status in ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),
  progress_percent numeric(5,2) not null default 0,
  health_status text not null default 'green' check (health_status in ('green', 'yellow', 'red')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.task_dependencies (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.tasks(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (task_id, depends_on_task_id),
  check (task_id <> depends_on_task_id)
);

create table if not exists public.department_weekly_updates (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  week_start date not null,
  submitted_by uuid references public.profiles(id) on delete set null,
  overall_health_status text not null default 'green' check (overall_health_status in ('green', 'yellow', 'red')),
  summary text,
  progress_percent numeric(5,2) not null default 0,
  support_needed text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department_id, week_start)
);

create table if not exists public.department_weekly_update_items (
  id uuid primary key default gen_random_uuid(),
  weekly_update_id uuid not null references public.department_weekly_updates(id) on delete cascade,
  item_type text not null check (item_type in ('accomplishment', 'blocker', 'risk', 'next_step')),
  content text not null,
  priority text check (priority in ('low', 'medium', 'high', 'critical')),
  created_at timestamptz not null default now()
);

create table if not exists public.blockers (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  goal_id uuid references public.department_goals(id) on delete set null,
  initiative_id uuid references public.initiatives(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  title text not null,
  description text,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'watching', 'resolved', 'closed')),
  owner_user_id uuid references public.profiles(id) on delete set null,
  needs_vp_attention boolean not null default false,
  needs_ceo_attention boolean not null default false,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.escalations (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.blockers(id) on delete cascade,
  escalated_to text not null check (escalated_to in ('department_lead', 'vp', 'ceo')),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'acknowledged', 'resolved')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.kpi_definitions (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  goal_id uuid references public.department_goals(id) on delete set null,
  initiative_id uuid references public.initiatives(id) on delete set null,
  name text not null,
  description text,
  unit text,
  comparison_type text not null check (comparison_type in ('greater_is_better', 'lower_is_better', 'range')),
  target_value numeric,
  min_target_value numeric,
  max_target_value numeric,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  data_source text not null default 'manual' check (data_source in ('manual', 'erp_upload', 'erp_sync')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kpi_entries (
  id uuid primary key default gen_random_uuid(),
  kpi_definition_id uuid not null references public.kpi_definitions(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  actual_value numeric not null,
  status text not null check (status in ('green', 'yellow', 'red')),
  variance_note text,
  entered_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('erp_sales', 'erp_sku', 'erp_finance', 'manual_upload')),
  file_name text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'processed', 'failed')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.import_rows_staging (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.imports(id) on delete cascade,
  raw_data jsonb not null,
  mapped_status text not null default 'pending' check (mapped_status in ('pending', 'mapped', 'error')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.sales_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null,
  department_id uuid references public.departments(id) on delete set null,
  revenue numeric not null default 0,
  orders_count integer,
  gross_margin numeric,
  source_import_id uuid references public.imports(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (metric_date, department_id, source_import_id)
);

create table if not exists public.sku_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null,
  sku_code text not null,
  sku_name text,
  revenue numeric not null default 0,
  quantity_sold numeric,
  department_id uuid references public.departments(id) on delete set null,
  source_import_id uuid references public.imports(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (metric_date, sku_code, source_import_id)
);

create table if not exists public.executive_briefs (
  id uuid primary key default gen_random_uuid(),
  brief_category text not null default 'weekly' check (brief_category in ('weekly', 'risk', 'performance', 'ceo_prep', 'board')),
  brief_type text not null default 'custom',
  title text not null,
  department_id uuid references public.departments(id) on delete set null,
  goal_id uuid references public.department_goals(id) on delete set null,
  initiative_id uuid references public.initiatives(id) on delete set null,
  source_type text,
  source_id uuid,
  content_markdown text,
  summary_1min text,
  health_status text check (health_status in ('green', 'yellow', 'red')),
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'sent')),
  prepared_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  type text not null,
  title text not null,
  body text,
  channel text not null default 'in_app' check (channel in ('in_app', 'whatsapp', 'both')),
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  priority text,
  entity_type text,
  entity_id uuid,
  requires_action boolean not null default false,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  channel text not null check (channel in ('in_app', 'whatsapp')),
  status text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'failed')),
  provider_message_id text,
  error_message text,
  attempt_count integer not null default 0,
  sent_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists profiles_department_id_idx on public.profiles(department_id);
create index if not exists tasks_department_id_idx on public.tasks(department_id);
create index if not exists tasks_goal_id_idx on public.tasks(goal_id);
create index if not exists tasks_initiative_id_idx on public.tasks(initiative_id);
create index if not exists tasks_health_status_idx on public.tasks(health_status);
create index if not exists department_goals_department_id_idx on public.department_goals(department_id);
create index if not exists initiatives_department_id_idx on public.initiatives(department_id);
create index if not exists blockers_department_id_idx on public.blockers(department_id);
create index if not exists blockers_status_idx on public.blockers(status);
create index if not exists kpi_definitions_department_id_idx on public.kpi_definitions(department_id);
create index if not exists kpi_entries_department_id_idx on public.kpi_entries(department_id);
create index if not exists imports_source_type_idx on public.imports(source_type);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_department_id_idx on public.notifications(department_id);

drop trigger if exists set_departments_updated_at on public.departments;
create trigger set_departments_updated_at
before update on public.departments
for each row execute procedure public.set_updated_at();

drop trigger if exists set_department_goals_updated_at on public.department_goals;
create trigger set_department_goals_updated_at
before update on public.department_goals
for each row execute procedure public.set_updated_at();

drop trigger if exists set_initiatives_updated_at on public.initiatives;
create trigger set_initiatives_updated_at
before update on public.initiatives
for each row execute procedure public.set_updated_at();

drop trigger if exists set_department_weekly_updates_updated_at on public.department_weekly_updates;
create trigger set_department_weekly_updates_updated_at
before update on public.department_weekly_updates
for each row execute procedure public.set_updated_at();

drop trigger if exists set_kpi_definitions_updated_at on public.kpi_definitions;
create trigger set_kpi_definitions_updated_at
before update on public.kpi_definitions
for each row execute procedure public.set_updated_at();

drop trigger if exists set_executive_briefs_updated_at on public.executive_briefs;
create trigger set_executive_briefs_updated_at
before update on public.executive_briefs
for each row execute procedure public.set_updated_at();

drop trigger if exists set_notification_deliveries_updated_at on public.notification_deliveries;
create trigger set_notification_deliveries_updated_at
before update on public.notification_deliveries
for each row execute procedure public.set_updated_at();

alter table public.departments enable row level security;
alter table public.department_goals enable row level security;
alter table public.initiatives enable row level security;
alter table public.task_updates enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.department_weekly_updates enable row level security;
alter table public.department_weekly_update_items enable row level security;
alter table public.blockers enable row level security;
alter table public.escalations enable row level security;
alter table public.kpi_definitions enable row level security;
alter table public.kpi_entries enable row level security;
alter table public.imports enable row level security;
alter table public.import_rows_staging enable row level security;
alter table public.sales_metrics_daily enable row level security;
alter table public.sku_metrics_daily enable row level security;
alter table public.executive_briefs enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_deliveries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'departments' and policyname = 'departments_select_authenticated'
  ) then
    create policy "departments_select_authenticated" on public.departments for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'department_goals' and policyname = 'department_goals_select_authenticated'
  ) then
    create policy "department_goals_select_authenticated" on public.department_goals for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'initiatives' and policyname = 'initiatives_select_authenticated'
  ) then
    create policy "initiatives_select_authenticated" on public.initiatives for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'task_updates' and policyname = 'task_updates_select_authenticated'
  ) then
    create policy "task_updates_select_authenticated" on public.task_updates for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'department_weekly_updates' and policyname = 'department_weekly_updates_select_authenticated'
  ) then
    create policy "department_weekly_updates_select_authenticated" on public.department_weekly_updates for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'department_weekly_update_items' and policyname = 'department_weekly_update_items_select_authenticated'
  ) then
    create policy "department_weekly_update_items_select_authenticated" on public.department_weekly_update_items for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'blockers' and policyname = 'blockers_select_authenticated'
  ) then
    create policy "blockers_select_authenticated" on public.blockers for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'escalations' and policyname = 'escalations_select_authenticated'
  ) then
    create policy "escalations_select_authenticated" on public.escalations for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'kpi_definitions' and policyname = 'kpi_definitions_select_authenticated'
  ) then
    create policy "kpi_definitions_select_authenticated" on public.kpi_definitions for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'kpi_entries' and policyname = 'kpi_entries_select_authenticated'
  ) then
    create policy "kpi_entries_select_authenticated" on public.kpi_entries for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'imports' and policyname = 'imports_select_authenticated'
  ) then
    create policy "imports_select_authenticated" on public.imports for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'import_rows_staging' and policyname = 'import_rows_staging_select_authenticated'
  ) then
    create policy "import_rows_staging_select_authenticated" on public.import_rows_staging for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sales_metrics_daily' and policyname = 'sales_metrics_daily_select_authenticated'
  ) then
    create policy "sales_metrics_daily_select_authenticated" on public.sales_metrics_daily for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sku_metrics_daily' and policyname = 'sku_metrics_daily_select_authenticated'
  ) then
    create policy "sku_metrics_daily_select_authenticated" on public.sku_metrics_daily for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'executive_briefs' and policyname = 'executive_briefs_select_authenticated'
  ) then
    create policy "executive_briefs_select_authenticated" on public.executive_briefs for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_select_authenticated'
  ) then
    create policy "notifications_select_authenticated" on public.notifications for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'notification_deliveries' and policyname = 'notification_deliveries_select_authenticated'
  ) then
    create policy "notification_deliveries_select_authenticated" on public.notification_deliveries for select to authenticated using (true);
  end if;
end $$;

create or replace view public.department_health_view
with (security_invoker = true) as
select
  d.id,
  d.code,
  d.name,
  d.status,
  count(distinct t.id) filter (where t.status <> 'done') as open_tasks,
  count(distinct t.id) filter (where t.due_date < current_date and t.status <> 'done') as overdue_tasks,
  count(distinct t.id) filter (where t.priority = 'critical' and t.status <> 'done') as critical_tasks,
  count(distinct b.id) filter (where b.status in ('open', 'watching')) as open_blockers,
  count(distinct i.id) filter (where i.status in ('planned', 'active', 'blocked')) as active_initiatives,
  count(distinct k.id) filter (where k.status = 'red') as red_kpis,
  max(w.week_start) as latest_weekly_update
from public.departments d
left join public.tasks t on t.department_id = d.id
left join public.blockers b on b.department_id = d.id
left join public.initiatives i on i.department_id = d.id
left join public.kpi_entries k on k.department_id = d.id
left join public.department_weekly_updates w on w.department_id = d.id
group by d.id, d.code, d.name, d.status;

create or replace view public.executive_rollup_view
with (security_invoker = true) as
select
  d.id as department_id,
  d.code as department_code,
  d.name as department_name,
  dh.open_tasks,
  dh.overdue_tasks,
  dh.critical_tasks,
  dh.open_blockers,
  dh.active_initiatives,
  dh.red_kpis,
  dh.latest_weekly_update,
  count(distinct g.id) filter (where g.health_status = 'red') as red_goals,
  count(distinct i.id) filter (where i.health_status = 'red') as red_initiatives,
  count(distinct b.id) filter (where b.needs_vp_attention) as vp_escalations,
  count(distinct b.id) filter (where b.needs_ceo_attention) as ceo_escalations
from public.departments d
left join public.department_health_view dh on dh.id = d.id
left join public.department_goals g on g.department_id = d.id
left join public.initiatives i on i.department_id = d.id
left join public.blockers b on b.department_id = d.id
group by
  d.id,
  d.code,
  d.name,
  dh.open_tasks,
  dh.overdue_tasks,
  dh.critical_tasks,
  dh.open_blockers,
  dh.active_initiatives,
  dh.red_kpis,
  dh.latest_weekly_update;

grant select on public.department_health_view to authenticated;
grant select on public.executive_rollup_view to authenticated;
