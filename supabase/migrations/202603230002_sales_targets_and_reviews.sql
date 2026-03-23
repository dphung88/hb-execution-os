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

create table if not exists public.sales_monthly_targets (
  id uuid primary key default gen_random_uuid(),
  asm_id text not null,
  month text not null,
  revenue_target numeric not null default 0,
  new_customers_target integer not null default 0,
  hb006_target numeric not null default 229,
  hb034_target numeric not null default 161,
  hb031_target numeric not null default 243,
  hb035_target numeric not null default 203,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (asm_id, month)
);

create table if not exists public.sales_manager_reviews (
  id uuid primary key default gen_random_uuid(),
  asm_id text not null,
  month text not null,
  discipline_score integer not null default 0 check (discipline_score between 0 and 5),
  reporting_score integer not null default 0 check (reporting_score between 0 and 5),
  manager_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (asm_id, month)
);

create index if not exists sales_monthly_targets_month_idx on public.sales_monthly_targets(month);
create index if not exists sales_manager_reviews_month_idx on public.sales_manager_reviews(month);

drop trigger if exists set_sales_monthly_targets_updated_at on public.sales_monthly_targets;
create trigger set_sales_monthly_targets_updated_at
before update on public.sales_monthly_targets
for each row execute procedure public.set_updated_at();

drop trigger if exists set_sales_manager_reviews_updated_at on public.sales_manager_reviews;
create trigger set_sales_manager_reviews_updated_at
before update on public.sales_manager_reviews
for each row execute procedure public.set_updated_at();

alter table public.sales_monthly_targets enable row level security;
alter table public.sales_manager_reviews enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sales_monthly_targets' and policyname = 'sales_monthly_targets_select_authenticated'
  ) then
    create policy "sales_monthly_targets_select_authenticated"
      on public.sales_monthly_targets
      for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sales_manager_reviews' and policyname = 'sales_manager_reviews_select_authenticated'
  ) then
    create policy "sales_manager_reviews_select_authenticated"
      on public.sales_manager_reviews
      for select
      to authenticated
      using (true);
  end if;
end $$;
