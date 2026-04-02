-- ============================================================
-- Sales Tasks table
-- Tracks operational tasks for the Sales team (Director, RSM, KAM, ASM, Admin)
-- ============================================================

create table if not exists public.sales_tasks (
  id               uuid primary key default gen_random_uuid(),
  month_key        text        not null,          -- "YYYY-MM"
  task_name        text        not null,
  owner_name       text,
  request_source   text,
  status           text        not null default 'Planned',
  priority         text        not null default 'Medium',
  due_date         date,
  result_note      text,
  progress_percent integer     not null default 0 check (progress_percent between 0 and 100),
  file_link        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sales_tasks_updated_at on public.sales_tasks;
create trigger sales_tasks_updated_at
  before update on public.sales_tasks
  for each row execute function public.set_updated_at();

-- Indexes
create index if not exists sales_tasks_month_key_idx on public.sales_tasks (month_key);
create index if not exists sales_tasks_owner_idx     on public.sales_tasks (owner_name);
create index if not exists sales_tasks_status_idx    on public.sales_tasks (status);

-- RLS
alter table public.sales_tasks enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'sales_tasks' and policyname = 'Allow anon select sales_tasks'
  ) then
    create policy "Allow anon select sales_tasks"
      on public.sales_tasks for select to anon using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'sales_tasks' and policyname = 'Allow authenticated all sales_tasks'
  ) then
    create policy "Allow authenticated all sales_tasks"
      on public.sales_tasks for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Grants
grant select, insert, update, delete on public.sales_tasks to anon;
grant select, insert, update, delete on public.sales_tasks to authenticated;
