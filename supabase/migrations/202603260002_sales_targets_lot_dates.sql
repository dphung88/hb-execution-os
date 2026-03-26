-- Add lot date columns to sales_monthly_targets for Key SKU and Clearstock items
alter table public.sales_monthly_targets
  add column if not exists key_sku_lot_date_1 date,
  add column if not exists key_sku_lot_date_2 date,
  add column if not exists clearstock_lot_date_1 date,
  add column if not exists clearstock_lot_date_2 date;
