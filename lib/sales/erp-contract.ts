export type ErpAsmKpiItem = {
  item_code: string;
  item_name: string;
  quantity: number;
};

export type ErpAsmKpiPayload = {
  employee_code: string;
  from_date: string;
  to_date: string;
  revenue_without_vat: number;
  revenue_with_vat: number;
  new_customer_count: number;
  items: ErpAsmKpiItem[];
};

export type ErpAsmKpiApiResponse = {
  success: boolean;
  data: ErpAsmKpiPayload;
};

export type SalesKpiSnapshotRecord = {
  asm_id: string;
  month: string;
  from_date: string;
  to_date: string;
  dt_thuc_dat: number;
  revenue_with_vat: number;
  kh_moi: number;
  hb006: number;
  hb034: number;
  hb031: number;
  hb035: number;
  source_system: "erp_api";
  source_synced_at: string;
  raw_payload: ErpAsmKpiPayload;
};

export type SalesKpiBreakdownRecord = {
  asm_id: string;
  month: string;
  from_date: string;
  to_date: string;
  item_code: string;
  item_name: string;
  quantity: number;
  source: "erp_api";
  source_synced_at: string;
};

const KPI_ITEM_CODES = ["HB006", "HB034", "HB031", "HB035"] as const;

function sumQuantityByCode(items: ErpAsmKpiItem[], itemCode: string) {
  return items
    .filter((item) => item.item_code.toUpperCase() === itemCode)
    .reduce((total, item) => total + Number(item.quantity || 0), 0);
}

function monthLabelFromDate(dateValue: string) {
  return dateValue.slice(0, 7);
}

export function normalizeErpAsmKpiResponse(response: ErpAsmKpiApiResponse) {
  if (!response.success) {
    throw new Error("ERP ASM KPI response returned success=false.");
  }

  const syncedAt = new Date().toISOString();
  const { data } = response;

  const snapshot: SalesKpiSnapshotRecord = {
    asm_id: data.employee_code,
    month: monthLabelFromDate(data.from_date),
    from_date: data.from_date,
    to_date: data.to_date,
    dt_thuc_dat: Number(data.revenue_without_vat || 0),
    revenue_with_vat: Number(data.revenue_with_vat || 0),
    kh_moi: Number(data.new_customer_count || 0),
    hb006: sumQuantityByCode(data.items, KPI_ITEM_CODES[0]),
    hb034: sumQuantityByCode(data.items, KPI_ITEM_CODES[1]),
    hb031: sumQuantityByCode(data.items, KPI_ITEM_CODES[2]),
    hb035: sumQuantityByCode(data.items, KPI_ITEM_CODES[3]),
    source_system: "erp_api",
    source_synced_at: syncedAt,
    raw_payload: data,
  };

  const itemBreakdowns: SalesKpiBreakdownRecord[] = data.items.map((item) => ({
    asm_id: data.employee_code,
    month: snapshot.month,
    from_date: data.from_date,
    to_date: data.to_date,
    item_code: item.item_code,
    item_name: item.item_name,
    quantity: Number(item.quantity || 0),
    source: "erp_api",
    source_synced_at: syncedAt,
  }));

  return {
    snapshot,
    itemBreakdowns,
  };
}
