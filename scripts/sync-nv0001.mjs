const ERP_API_KEY = "hbp_live_sk_8a3d7f1c5b9e2a6d4f0c8b1e7a3d9f2c6b4e1a8d5f0c7b9e2a6d3f1c8b4e7a";
const ERP_BASE_URL = "http://27.71.27.239:8000";
const SUPABASE_URL = "https://wauqecjjwqkrgefrxazw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "sb_secret_yEzdC0rzKlIPnwk2STEAtA_28hdXYHS";
const employeeCode = "NV0001";
const period = "2026-03";
const fromDate = "2026-03-01";
const toDate = "2026-03-31";

const requestUrl = new URL("/api/asm-kpi/get_data", ERP_BASE_URL);
requestUrl.searchParams.set("employee_code", employeeCode);
requestUrl.searchParams.set("from_date", fromDate);
requestUrl.searchParams.set("to_date", toDate);

const erpResponse = await fetch(requestUrl, {
  headers: {
    Accept: "application/json",
    "X-API-KEY": ERP_API_KEY,
  },
});

const erpPayload = await erpResponse.json();
console.log("ERP status:", erpResponse.status);
console.log(JSON.stringify(erpPayload, null, 2).slice(0, 1500));

if (!erpResponse.ok) {
  process.exit(1);
}

const data = erpPayload.data ?? {};
const items = Array.isArray(data.items) ? data.items : [];

function quantityFor(code) {
  const item = items.find((entry) => String(entry.item_code).toUpperCase() === code);
  return Number(item?.quantity ?? 0);
}

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const syncRunRow = {
  employee_code: employeeCode,
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

const runResponse = await fetch(
  `${SUPABASE_URL}/rest/v1/sales_kpi_sync_runs?on_conflict=employee_code,from_date,to_date`,
  {
    method: "POST",
    headers,
    body: JSON.stringify(syncRunRow),
  }
);
const runPayload = await runResponse.json();
console.log("SYNC RUN status:", runResponse.status, JSON.stringify(runPayload).slice(0, 500));

if (!runResponse.ok) {
  process.exit(1);
}

let syncRun = Array.isArray(runPayload) ? runPayload[0] : runPayload;

if (!syncRun?.id) {
  const lookupResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/sales_kpi_sync_runs?select=id&employee_code=eq.${employeeCode}&from_date=eq.${fromDate}&to_date=eq.${toDate}`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  const lookupPayload = await lookupResponse.json();
  syncRun = lookupPayload[0];
}

if (!syncRun?.id) {
  throw new Error("Unable to resolve sync run id.");
}

const snapshotRow = {
  asm_id: employeeCode,
  month: period,
  dt_target: 4000,
  dt_thuc_dat: Number(data.revenue_without_vat ?? 0),
  kh_moi: Number(data.new_customer_count ?? 0),
  hb006: quantityFor("HB006"),
  hb034: quantityFor("HB034"),
  hb031: quantityFor("HB031"),
  hb035: quantityFor("HB035"),
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

const snapshotResponse = await fetch(`${SUPABASE_URL}/rest/v1/kpi_data?on_conflict=asm_id,month`, {
  method: "POST",
  headers,
  body: JSON.stringify(snapshotRow),
});
const snapshotPayload = await snapshotResponse.json();
console.log("SNAPSHOT status:", snapshotResponse.status, JSON.stringify(snapshotPayload).slice(0, 500));

if (!snapshotResponse.ok) {
  process.exit(1);
}

await fetch(`${SUPABASE_URL}/rest/v1/kpi_item_breakdowns?asm_id=eq.${employeeCode}&month=eq.${period}`, {
  method: "DELETE",
  headers: {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  },
});

if (items.length > 0) {
  const breakdownRows = items.map((item) => ({
    asm_id: employeeCode,
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

  const breakdownResponse = await fetch(`${SUPABASE_URL}/rest/v1/kpi_item_breakdowns`, {
    method: "POST",
    headers,
    body: JSON.stringify(breakdownRows),
  });
  const breakdownPayload = await breakdownResponse.json();
  console.log(
    "BREAKDOWN status:",
    breakdownResponse.status,
    JSON.stringify(breakdownPayload).slice(0, 500)
  );

  if (!breakdownResponse.ok) {
    process.exit(1);
  }
}

console.log("Done syncing NV0001 for March 2026.");
