alter table public.sales_manager_reviews
  add column if not exists is_probation boolean not null default false;
