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

create table if not exists public.marketing_manual_inputs (
  id uuid primary key default gen_random_uuid(),
  month_key text not null,
  role_id text not null,
  metric_id text not null,
  target_value numeric not null default 0,
  actual_value numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (month_key, role_id, metric_id)
);

create table if not exists public.marketing_role_results (
  id uuid primary key default gen_random_uuid(),
  month_key text not null,
  role_id text not null,
  role_name text not null,
  workbook_score numeric not null default 0,
  execution_score numeric not null default 0,
  total_score numeric not null default 0,
  payout_base numeric not null default 0,
  payout_percent numeric not null default 0,
  payout_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (month_key, role_id)
);

create index if not exists marketing_manual_inputs_month_idx
on public.marketing_manual_inputs(month_key);

create index if not exists marketing_role_results_month_idx
on public.marketing_role_results(month_key);

drop trigger if exists set_marketing_manual_inputs_updated_at on public.marketing_manual_inputs;
create trigger set_marketing_manual_inputs_updated_at
before update on public.marketing_manual_inputs
for each row execute procedure public.set_updated_at();

drop trigger if exists set_marketing_role_results_updated_at on public.marketing_role_results;
create trigger set_marketing_role_results_updated_at
before update on public.marketing_role_results
for each row execute procedure public.set_updated_at();

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.marketing_manual_inputs to anon, authenticated;
grant select, insert, update on public.marketing_role_results to anon, authenticated;

alter table public.marketing_manual_inputs disable row level security;
alter table public.marketing_role_results disable row level security;
