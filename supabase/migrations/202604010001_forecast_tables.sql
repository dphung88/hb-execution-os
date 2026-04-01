-- ============================================================
-- Forecast Tables + Summary View
-- ============================================================

-- 1. forecast_config
--    Planning assumptions per SKU / province / channel / period
-- ============================================================
CREATE TABLE IF NOT EXISTS forecast_config (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period          text NOT NULL,          -- '2026-04'
  province        text NOT NULL,          -- 'TP. Ho Chi Minh'
  channel         text NOT NULL,          -- 'OTC' | 'ETC' | 'Online'
  sku             text NOT NULL,          -- 'HB001'
  universe        int,                    -- #1  Total potential outlets
  frequency       numeric,                -- #5  F: orders/outlet/month
  upo             numeric,                -- #6  UPO: units per order
  growth_factor   numeric DEFAULT 1.0,    -- #8  G (1.10 = +10%)
  promo_uplift    numeric DEFAULT 1.0,    -- #9  P (1.15 = +15%)
  ramp_m1         numeric DEFAULT 0.4,    -- #10 Ramp Month 1
  ramp_m2         numeric DEFAULT 0.7,    -- #10 Ramp Month 2
  ramp_m3         numeric DEFAULT 1.0,    -- #10 Ramp Month 3
  asp             numeric,                -- #12 Average Selling Price (VND)
  discount_pct    numeric DEFAULT 0,      -- #13 Discount rate (0–1)
  baseline_qty    int,                    -- #14 Break-even units
  cogs            numeric,                -- #38 Cost of Goods Sold (VND)
  target_revenue  numeric,                -- #30 Revenue target (VND)
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 2. forecast_pipeline
--    New outlet listings planned per period
-- ============================================================
CREATE TABLE IF NOT EXISTS forecast_pipeline (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period        text NOT NULL,
  province      text,
  channel       text,
  sku           text,
  new_listings  int,                      -- #20 Planned new outlets
  stage         text,                     -- #21 Qualify/Develop/Propose/Close
  prob          numeric,                  -- #22 Closing probability (0–1)
  on_shelf_rate numeric DEFAULT 0.9,      -- #23 On-shelf success rate (0–1)
  ar_expected   numeric,                  -- #24 Expected AR for new outlets
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- 3. forecast_actuals
--    Monthly ERP data (invoice-based)
-- ============================================================
CREATE TABLE IF NOT EXISTS forecast_actuals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period             text NOT NULL,
  province           text,
  channel            text,
  sku                text,
  listed_outlets     int,                 -- #2  Outlets with open code
  ordering_outlets   int,                 -- #3  Outlets that placed orders
  volume_sold        numeric,             -- #43 Units sold (outflow)
  revenue_actual     numeric,             -- #31 Actual revenue (VND)
  promo_sell         numeric,             -- #27 Promo volume (units/day)
  baseline_sold      int,                 -- #15 Units sold towards break-even
  risk_inventory     int,                 -- #17 At-risk stock (batch/expiry)
  risk_sold          int,                 -- #18 At-risk stock already sold
  opening_inventory  int,                 -- #41 Stock at period start
  inflow             int,                 -- #42 New stock purchased
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- 4. forecast_seasonality
--    Historical seasonal factors (updated annually)
-- ============================================================
CREATE TABLE IF NOT EXISTS forecast_seasonality (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_num     int NOT NULL CHECK (month_num BETWEEN 1 AND 12),
  channel       text,
  sku           text,
  season_factor numeric DEFAULT 1.0,      -- #7  S (1.05 = peak +5%)
  created_at    timestamptz DEFAULT now()
);

-- Seed default seasonality (all 1.0 — override per SKU/channel as needed)
INSERT INTO forecast_seasonality (month_num, season_factor)
SELECT generate_series(1, 12), 1.0
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. forecast_summary VIEW
--    Calculates all 45 forecast fields automatically
-- ============================================================
CREATE OR REPLACE VIEW forecast_summary AS
SELECT
  a.period,
  a.province,
  a.channel,
  a.sku,

  -- ── Outlet Effectiveness ────────────────────────────────
  -- #1 Universe
  c.universe,

  -- #2 ND% = Listed ÷ Universe
  CASE WHEN c.universe > 0
    THEN ROUND(a.listed_outlets::numeric / c.universe * 100, 1)
    ELSE NULL
  END AS nd_pct,

  -- #3 AR% = Ordering ÷ Listed
  CASE WHEN a.listed_outlets > 0
    THEN ROUND(a.ordering_outlets::numeric / a.listed_outlets * 100, 1)
    ELSE NULL
  END AS ar_pct,

  -- #4 ΔND = (New Listings ÷ Universe) × Prob × On-shelf
  CASE WHEN c.universe > 0
    THEN ROUND(
      (COALESCE(p.new_listings, 0)::numeric / c.universe)
      * COALESCE(p.prob, 0)
      * COALESCE(p.on_shelf_rate, 0.9)
      * 100, 2)
    ELSE NULL
  END AS delta_nd_pct,

  -- ── Velocity ────────────────────────────────────────────
  -- #11 Velocity_expected = F × UPO × S × G × P × Ramp
  ROUND(
    COALESCE(c.frequency, 0)
    * COALESCE(c.upo, 0)
    * COALESCE(s.season_factor, 1)
    * COALESCE(c.growth_factor, 1)
    * COALESCE(c.promo_uplift, 1)
    * COALESCE(c.ramp_m3, 1),   -- use M3 (steady-state) for existing outlets
  2) AS velocity_expected,

  -- ── Price & Discount ────────────────────────────────────
  c.asp,
  c.discount_pct,

  -- Net price after discount
  ROUND(c.asp * (1 - COALESCE(c.discount_pct, 0)), 0) AS net_price,

  -- ── Baseline & Risk ─────────────────────────────────────
  -- #14 Baseline qty
  c.baseline_qty,

  -- #15 Baseline sold
  a.baseline_sold,

  -- #16 Baseline remaining = Baseline qty – Baseline sold
  COALESCE(c.baseline_qty, 0) - COALESCE(a.baseline_sold, 0) AS baseline_remaining,

  -- #17 Risk inventory
  a.risk_inventory,

  -- #18 Risk sold
  a.risk_sold,

  -- #19 Risk remaining = Risk inventory – Risk sold
  COALESCE(a.risk_inventory, 0) - COALESCE(a.risk_sold, 0) AS risk_remaining,

  -- ── Pipeline ────────────────────────────────────────────
  -- #20 New Listings
  p.new_listings,

  -- #21 Stage
  p.stage,

  -- #25 ΔVolume = Universe × ΔND × AR_expected × Velocity_expected
  ROUND(
    COALESCE(c.universe, 0)
    * (COALESCE(p.new_listings, 0)::numeric / NULLIF(c.universe, 0))
    * COALESCE(p.prob, 0)
    * COALESCE(p.on_shelf_rate, 0.9)
    * COALESCE(p.ar_expected, 0)
    * COALESCE(c.frequency, 0) * COALESCE(c.upo, 0)
    * COALESCE(s.season_factor, 1) * COALESCE(c.growth_factor, 1) * COALESCE(c.promo_uplift, 1),
  0) AS delta_volume,

  -- #26 ΔRevenue = ΔVolume × ASP × (1 – Discount)
  ROUND(
    COALESCE(c.universe, 0)
    * (COALESCE(p.new_listings, 0)::numeric / NULLIF(c.universe, 0))
    * COALESCE(p.prob, 0)
    * COALESCE(p.on_shelf_rate, 0.9)
    * COALESCE(p.ar_expected, 0)
    * COALESCE(c.frequency, 0) * COALESCE(c.upo, 0)
    * COALESCE(s.season_factor, 1) * COALESCE(c.growth_factor, 1) * COALESCE(c.promo_uplift, 1)
    * COALESCE(c.asp, 0) * (1 - COALESCE(c.discount_pct, 0)),
  0) AS delta_revenue,

  -- ── Target & KPI ────────────────────────────────────────
  -- #30 Target
  c.target_revenue,

  -- #31 Revenue Actual
  a.revenue_actual,

  -- #32 Revenue Forecast = Actual + ΔRevenue
  ROUND(
    COALESCE(a.revenue_actual, 0)
    + COALESCE(c.universe, 0)
      * (COALESCE(p.new_listings, 0)::numeric / NULLIF(c.universe, 0))
      * COALESCE(p.prob, 0) * COALESCE(p.on_shelf_rate, 0.9)
      * COALESCE(p.ar_expected, 0)
      * COALESCE(c.frequency, 0) * COALESCE(c.upo, 0)
      * COALESCE(s.season_factor, 1) * COALESCE(c.growth_factor, 1) * COALESCE(c.promo_uplift, 1)
      * COALESCE(c.asp, 0) * (1 - COALESCE(c.discount_pct, 0)),
  0) AS revenue_forecast,

  -- #33 % Target Achievement = Revenue Forecast ÷ Target
  CASE WHEN c.target_revenue > 0
    THEN ROUND(
      (COALESCE(a.revenue_actual, 0)
      + COALESCE(c.universe, 0)
        * (COALESCE(p.new_listings, 0)::numeric / NULLIF(c.universe, 0))
        * COALESCE(p.prob, 0) * COALESCE(p.on_shelf_rate, 0.9)
        * COALESCE(p.ar_expected, 0)
        * COALESCE(c.frequency, 0) * COALESCE(c.upo, 0)
        * COALESCE(s.season_factor, 1) * COALESCE(c.growth_factor, 1) * COALESCE(c.promo_uplift, 1)
        * COALESCE(c.asp, 0) * (1 - COALESCE(c.discount_pct, 0))
      ) / c.target_revenue * 100, 1)
    ELSE NULL
  END AS pct_target,

  -- #34 GAP % vs Baseline
  CASE WHEN c.baseline_qty > 0 AND c.asp > 0
    THEN ROUND(
      (COALESCE(a.revenue_actual, 0)
      / NULLIF(c.baseline_qty::numeric * c.asp * (1 - COALESCE(c.discount_pct,0)), 0)
      - 1) * 100, 1)
    ELSE NULL
  END AS gap_vs_baseline_pct,

  -- ── Gross Margin ────────────────────────────────────────
  -- #39 GM% = (Net Price – COGS) ÷ Net Price
  CASE WHEN c.asp > 0 AND c.cogs IS NOT NULL
    THEN ROUND(
      (c.asp * (1 - COALESCE(c.discount_pct, 0)) - c.cogs)
      / NULLIF(c.asp * (1 - COALESCE(c.discount_pct, 0)), 0) * 100, 1)
    ELSE NULL
  END AS gm_pct,

  -- #40 GM Value = (Net Price – COGS) × Volume
  CASE WHEN c.asp > 0 AND c.cogs IS NOT NULL AND a.volume_sold IS NOT NULL
    THEN ROUND(
      (c.asp * (1 - COALESCE(c.discount_pct, 0)) - c.cogs) * a.volume_sold, 0)
    ELSE NULL
  END AS gm_value,

  -- ── Inventory ───────────────────────────────────────────
  -- #41 Opening inventory
  a.opening_inventory,

  -- #42 Inflow
  a.inflow,

  -- #43 Volume sold (outflow)
  a.volume_sold,

  -- #44 Closing Inventory = Opening + Inflow – Outflow
  COALESCE(a.opening_inventory, 0) + COALESCE(a.inflow, 0) - COALESCE(a.volume_sold, 0)
    AS closing_inventory,

  -- #45 DOI = Closing ÷ Avg Daily Sales
  CASE WHEN a.volume_sold > 0
    THEN ROUND(
      (COALESCE(a.opening_inventory, 0) + COALESCE(a.inflow, 0) - COALESCE(a.volume_sold, 0))
      / (a.volume_sold / 30.0), 1)
    ELSE NULL
  END AS doi,

  -- ── Promotion ───────────────────────────────────────────
  a.promo_sell,

  -- #28 Forecast Sell/Day
  CASE WHEN c.frequency IS NOT NULL AND c.upo IS NOT NULL
    THEN ROUND(
      c.frequency * c.upo
      * COALESCE(a.listed_outlets, COALESCE(c.universe, 0) * 0.75)
      * COALESCE(s.season_factor, 1) * COALESCE(c.growth_factor, 1) * COALESCE(c.promo_uplift, 1)
      / 30.0, 1)
    ELSE NULL
  END AS forecast_sell_day,

  -- #29 Forecast Sell/Month
  CASE WHEN c.frequency IS NOT NULL AND c.upo IS NOT NULL
    THEN ROUND(
      c.frequency * c.upo
      * COALESCE(a.listed_outlets, COALESCE(c.universe, 0) * 0.75)
      * COALESCE(s.season_factor, 1) * COALESCE(c.growth_factor, 1) * COALESCE(c.promo_uplift, 1),
    0)
    ELSE NULL
  END AS forecast_sell_month

FROM forecast_actuals a
LEFT JOIN forecast_config c
  ON c.period = a.period
  AND c.province = a.province
  AND c.channel = a.channel
  AND c.sku = a.sku
LEFT JOIN forecast_pipeline p
  ON p.period = a.period
  AND p.province = a.province
  AND p.channel = a.channel
  AND p.sku = a.sku
LEFT JOIN forecast_seasonality s
  ON s.month_num = EXTRACT(MONTH FROM TO_DATE(a.period, 'YYYY-MM'))
  AND (s.sku = a.sku OR s.sku IS NULL)
  AND (s.channel = a.channel OR s.channel IS NULL);

-- ============================================================
-- Row Level Security (read for anon, write via service role)
-- ============================================================
ALTER TABLE forecast_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_pipeline    ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_actuals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_seasonality ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_service" ON forecast_config      FOR ALL USING (true);
CREATE POLICY "allow_all_service" ON forecast_pipeline    FOR ALL USING (true);
CREATE POLICY "allow_all_service" ON forecast_actuals     FOR ALL USING (true);
CREATE POLICY "allow_all_service" ON forecast_seasonality FOR ALL USING (true);

-- Grant read access to anon/authenticated
GRANT SELECT ON forecast_config      TO anon, authenticated;
GRANT SELECT ON forecast_pipeline    TO anon, authenticated;
GRANT SELECT ON forecast_actuals     TO anon, authenticated;
GRANT SELECT ON forecast_seasonality TO anon, authenticated;
GRANT SELECT ON forecast_summary     TO anon, authenticated;
