-- SKU lot date registry: one row per SKU with lot/expiry info
create table if not exists public.sku_lot_dates (
  code          text primary key,           -- e.g. "HB001"
  name          text,                       -- display name (optional override)
  lot_date      date,                       -- expiry / lot clear-by date
  stock_on_hand integer default 0,          -- units currently in warehouse
  weekly_sell_out integer default 0,        -- avg weekly sell-out (from warehouse data)
  updated_at    timestamptz default now()
);

-- Seed with inventory data (snapshot 2026-03-27)
insert into public.sku_lot_dates (code, lot_date, stock_on_hand) values
  ('HB001', '2027-08-16', 2367),
  ('HB002', '2027-04-25', 0),
  ('HB003', '2027-04-25', 1),
  ('HB004', '2028-05-14', 1720),
  ('HB005', '2028-05-14', 5070),
  ('HB006', '2026-08-23', 7999),
  ('HB007', '2027-11-09', 6345),
  ('HB009', '2028-03-09', 21574),
  ('HB010', '2027-11-12', 0),
  ('HB011', '2028-03-09', 3462),
  ('HB015', '2028-01-27', 10275),
  ('HB018', '2027-12-01', 558),
  ('HB024', '2027-10-27', 2548),
  ('HB025', '2027-10-27', 0),
  ('HB030', '2027-08-27', 7958),
  ('HB031', '2027-01-28', 13607),
  ('HB033', '2026-07-23', 25),
  ('HB034', '2027-12-29', 5618),
  ('HB035', '2028-02-19', 11777),
  ('HB036', '2028-02-19', 11060),
  ('HB037', '2028-02-17', 11106),
  ('HB038', '2028-02-17', 3679),
  ('HB039', '2027-12-29', 7673)
on conflict (code) do update set
  lot_date      = excluded.lot_date,
  stock_on_hand = excluded.stock_on_hand,
  updated_at    = now();

alter table public.sku_lot_dates enable row level security;
create policy "Allow all" on public.sku_lot_dates for all using (true) with check (true);
