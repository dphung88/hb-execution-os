/**
 * Sync all ASM KPI data from ERP → Supabase for a given month.
 * Usage: node scripts/sync-all-asms.mjs [YYYY-MM]
 * Default period: current month
 */

const ERP_API_KEY = "hbp_live_sk_8a3d7f1c5b9e2a6d4f0c8b1e7a3d9f2c6b4e1a8d5f0c7b9e2a6d3f1c8b4e7a";
const ERP_BASE_URL = "http://27.71.27.239:8000";
const SUPABASE_URL = "https://wauqecjjwqkrgefrxazw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "sb_secret_yEzdC0rzKlIPnwk2STEAtA_28hdXYHS";

const SUPABASE_HEADERS = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates,return=representation",
};

// All 15 ASMs — id + revenue target
const ALL_ASMS = [
  { id: "NV0001", revenueTarget: 4000 },
  { id: "NV0494", revenueTarget: 500 },
  { id: "NV0378", revenueTarget: 500 },
  { id: "NV0461", revenueTarget: 500 },
  { id: "NV0487", revenueTarget: 500 },
  { id: "NV0484", revenueTarget: 500 },
  { id: "NV0486", revenueTarget: 500 },
  { id: "NV0485", revenueTarget: 500 },
  { id: "NV0491", revenueTarget: 500 },
  { id: "NV0493", revenueTarget: 500 },
  { id: "NV0492", revenueTarget: 500 },
  { id: "NV0495", revenueTarget: 500 },
  { id: "NV0490", revenueTarget: 500 },
  { id: "NV0498", revenueTarget: 500 },
  { id: "NV0499", revenueTarget: 500 },
];

// Resolve period from CLI arg or default to current month
const arg = process.argv[2];
const now = new Date();
const period = arg ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const [year, month] = period.split("-");
const fromDate = `${period}-01`;
const lastDay = new Date(Number(year), Number(month), 0).getDate();
const toDate = `${period}-${String(lastDay).padStart(2, "0")}`;

console.log(`\n=== Syncing all ASMs for ${period} (${fromDate} → ${toDate}) ===\n`);

function quantityFor(items, code) {
  const item = items.find((e) => String(e.item_code).toUpperCase() === code);
  return Number(item?.quantity ?? 0);
}

async function syncAsm(asm) {
  const { id, revenueTarget } = asm;
  process.stdout.write(`[${id}] Fetching ERP... `);

  // 1. Call ERP
  const requestUrl = new URL("/api/asm-kpi/get_data", ERP_BASE_URL);
  requestUrl.searchParams.set("employee_code", id);
  requestUrl.searchParams.set("from_date", fromDate);
  requestUrl.searchParams.set("to_date", toDate);

  const erpRes = await fetch(requestUrl, {
    headers: { Accept: "application/json", "X-API-KEY": ERP_API_KEY },
  });

  if (!erpRes.ok) {
    console.log(`ERP ${erpRes.status} — skipped`);
    return { id, status: "erp_error", code: erpRes.status };
  }

  const erpPayload = await erpRes.json();
  const data = erpPayload.data ?? {};
  const items = Array.isArray(data.items) ? data.items : [];
  process.stdout.write(`OK (${items.length} items) → Supabase... `);

  // 2. Write sync run
  const syncRunRow = {
    employee_code: id,
    from_date: fromDate,
    to_date: toDate,
    month: period,
    request_url: requestUrl.toString(),
    status: "succeeded",
    revenue_without_vat: Number(data.revenue_without_vat ?? 0),
    revenue_with_vat: Number(data.revenue_with_vat ?? 0),
    new_customer_count: Number(data.new_customer_count ?? 0),
    items_count: items.length,
    payload: erpPayload,
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
  };

  const runRes = await fetch(
    `${SUPABASE_URL}/rest/v1/sales_kpi_sync_runs?on_conflict=employee_code,from_date,to_date`,
    { method: "POST", headers: SUPABASE_HEADERS, body: JSON.stringify(syncRunRow) }
  );
  const runPayload = await runRes.json();
  if (!runRes.ok) {
    console.log(`sync_run ${runRes.status} — skipped`);
    return { id, status: "supabase_error", step: "sync_run" };
  }

  let syncRun = Array.isArray(runPayload) ? runPayload[0] : runPayload;
  if (!syncRun?.id) {
    const lookupRes = await fetch(
      `${SUPABASE_URL}/rest/v1/sales_kpi_sync_runs?select=id&employee_code=eq.${id}&from_date=eq.${fromDate}&to_date=eq.${toDate}`,
      { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
    );
    const lookupPayload = await lookupRes.json();
    syncRun = lookupPayload[0];
  }

  if (!syncRun?.id) {
    console.log(`sync_run id missing — skipped`);
    return { id, status: "supabase_error", step: "sync_run_id" };
  }

  // 3. Write kpi_data snapshot
  const snapshotRow = {
    asm_id: id,
    month: period,
    dt_target: revenueTarget,
    dt_thuc_dat: Number(data.revenue_without_vat ?? 0),
    kh_moi: Number(data.new_customer_count ?? 0),
    hb006: quantityFor(items, "HB006"),
    hb034: quantityFor(items, "HB034"),
    hb031: quantityFor(items, "HB031"),
    hb035: quantityFor(items, "HB035"),
    noiquy: 0,
    total_kpi: 0,
    luong: 0,
    revenue_with_vat: Number(data.revenue_with_vat ?? 0),
    from_date: fromDate,
    to_date: toDate,
    source_system: "erp_api",
    source_synced_at: new Date().toISOString(),
    raw_payload: erpPayload,
    sync_run_id: syncRun.id,
    updated_at: new Date().toISOString(),
  };

  const snapRes = await fetch(
    `${SUPABASE_URL}/rest/v1/kpi_data?on_conflict=asm_id,month`,
    { method: "POST", headers: SUPABASE_HEADERS, body: JSON.stringify(snapshotRow) }
  );
  if (!snapRes.ok) {
    console.log(`kpi_data ${snapRes.status} — skipped`);
    return { id, status: "supabase_error", step: "kpi_data" };
  }

  // 4. Write item breakdowns
  await fetch(
    `${SUPABASE_URL}/rest/v1/kpi_item_breakdowns?asm_id=eq.${id}&month=eq.${period}`,
    { method: "DELETE", headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
  );

  if (items.length > 0) {
    const breakdownRows = items.map((item) => ({
      asm_id: id,
      month: period,
      from_date: fromDate,
      to_date: toDate,
      item_code: String(item.item_code).toUpperCase(),
      item_name: item.item_name ?? null,
      quantity: Number(item.quantity ?? 0),
      source: "erp_api",
      sync_run_id: syncRun.id,
      source_synced_at: new Date().toISOString(),
    }));

    const bdRes = await fetch(
      `${SUPABASE_URL}/rest/v1/kpi_item_breakdowns`,
      { method: "POST", headers: SUPABASE_HEADERS, body: JSON.stringify(breakdownRows) }
    );
    if (!bdRes.ok) {
      console.log(`breakdowns ${bdRes.status} — partial`);
      return { id, status: "partial", step: "breakdowns" };
    }
  }

  console.log(`done ✓`);
  return { id, status: "ok" };
}

// Run sequentially to avoid rate limits
const results = [];
for (const asm of ALL_ASMS) {
  const result = await syncAsm(asm);
  results.push(result);
}

console.log("\n=== Summary ===");
const ok = results.filter((r) => r.status === "ok");
const failed = results.filter((r) => r.status !== "ok");
console.log(`✓ ${ok.length}/${ALL_ASMS.length} synced successfully`);
if (failed.length > 0) {
  console.log(`✗ Failed: ${failed.map((r) => `${r.id} (${r.status})`).join(", ")}`);
}
console.log(`\nDone. Reload the app and select period ${period}.`);
