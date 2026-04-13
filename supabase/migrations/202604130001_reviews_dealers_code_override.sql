-- Allow managers to manually override the ERP dealers code count
-- when an ASM opened accounts close to month-end (not yet synced from ERP)
alter table public.sales_manager_reviews
  add column if not exists dealers_code_override integer;
