-- Manual overrides for Key SKU and Clearstock actual quantities
-- Used when ASM submitted stock orders close to month-end, not yet synced from ERP
alter table public.sales_manager_reviews
  add column if not exists key_sku_actual_override_1 integer,
  add column if not exists key_sku_actual_override_2 integer,
  add column if not exists clearstock_actual_override_1 integer,
  add column if not exists clearstock_actual_override_2 integer;
