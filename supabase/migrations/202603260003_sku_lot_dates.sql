-- SKU lot date registry: one row per SKU with lot/expiry info
create table if not exists public.sku_lot_dates (
  code          text primary key,           -- e.g. "HB001"
  name          text,                       -- display name (optional override)
  lot_date      date,                       -- expiry / lot clear-by date
  stock_on_hand integer default 0,          -- units currently in warehouse
  weekly_sell_out integer default 0,        -- avg weekly sell-out (from warehouse data)
  updated_at    timestamptz default now()
);

-- Seed with known SKUs from stock workbook (2025-03-08 snapshot)
insert into public.sku_lot_dates (code, name, lot_date, stock_on_hand, weekly_sell_out) values
  ('HB031', 'HB CoQ10 150mg C/30V',          '2027-01-28', 15633, 2),
  ('HB035', 'HB Collagen 1,2&3 C/120V',      '2027-08-16', 4368,  18),
  ('HB006', 'Gluta White C/30V',              '2026-08-23', 11959, 89),
  ('HB034', 'HB Prenatal Support H/60V',      '2027-12-29', 13322, 6)
on conflict (code) do nothing;

alter table public.sku_lot_dates enable row level security;
create policy "Allow all" on public.sku_lot_dates for all using (true) with check (true);
