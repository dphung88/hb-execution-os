alter table public.sales_monthly_targets
  add column if not exists is_probation boolean not null default false;
