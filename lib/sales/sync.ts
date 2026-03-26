import { demoSalesAsms } from "@/lib/demo-data";
import { getPeriods } from "@/lib/config/periods";
import { normalizeErpAsmKpiResponse, type ErpAsmKpiApiResponse } from "@/lib/sales/erp-contract";
import { createAdminClient } from "@/lib/supabase/admin";

type SyncMonthSummary = {
  period: string;
  syncedCount: number;
  failedCount: number;
  fromDate: string;
  toDate: string;
  firstError?: string;
};

/** Fallback: derive calendar-month range from YYYY-MM */
function calendarMonthRange(period: string) {
  const [yearValue, monthValue] = period.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  if (!year || !month || month < 1 || month > 12) {
    throw new Error(`Invalid period "${period}". Expected format YYYY-MM.`);
  }
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to   = new Date(Date.UTC(year, month, 0));
  return { fromDate: from.toISOString().slice(0, 10), toDate: to.toISOString().slice(0, 10) };
}

/** Resolve date range: use configured period startDate/endDate if available, else calendar fallback */
async function resolveDateRange(period: string): Promise<{ fromDate: string; toDate: string }> {
  try {
    const periods = await getPeriods();
    const config = periods.find((p) => p.key === period);
    if (config?.startDate && config?.endDate) {
      return { fromDate: config.startDate, toDate: config.endDate };
    }
  } catch { /* fall through */ }
  return calendarMonthRange(period);
}

async function fetchAsmKpi(employeeCode: string, period: string, fromDate: string, toDate: string) {
  const baseUrl = process.env.ERP_ASM_KPI_BASE_URL;
  const apiKey = process.env.ERP_ASM_KPI_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Missing ERP sync environment variables (ERP_ASM_KPI_BASE_URL / ERP_ASM_KPI_API_KEY).");
  }

  const requestUrl = new URL("/api/asm-kpi/get_data", baseUrl);
  requestUrl.searchParams.set("employee_code", employeeCode);
  requestUrl.searchParams.set("from_date", fromDate);
  requestUrl.searchParams.set("to_date", toDate);

  const response = await fetch(requestUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-API-KEY": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ERP request failed for ${employeeCode}: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as ErpAsmKpiApiResponse;

  return {
    requestUrl: requestUrl.toString(),
    payload,
  };
}

async function upsertSyncRun(
  employeeCode: string,
  period: string,
  fromDate: string,
  toDate: string,
  requestUrl: string,
  status: "running" | "succeeded" | "failed",
  payload?: unknown,
  errorMessage?: string
) {
  const admin = createAdminClient();

  const row = {
    employee_code: employeeCode,
    from_date: fromDate,
    to_date: toDate,
    month: period,
    request_url: requestUrl,
    status,
    payload: payload ?? null,
    error_message: errorMessage ?? null,
    started_at: status === "running" ? new Date().toISOString() : null,
    finished_at: status === "succeeded" || status === "failed" ? new Date().toISOString() : null,
  };

  const { data, error } = await admin
    .from("sales_kpi_sync_runs")
    .upsert(row, { onConflict: "employee_code,from_date,to_date" })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to upsert sync log for ${employeeCode}: ${error.message}`);
  }

  return data.id as string;
}

async function writeAsmSnapshot(employeeCode: string, period: string, fromDate: string, toDate: string) {
  const admin = createAdminClient();
  const { requestUrl, payload } = await fetchAsmKpi(employeeCode, period, fromDate, toDate);
  const syncRunId = await upsertSyncRun(employeeCode, period, fromDate, toDate, requestUrl, "running");

  try {
    const normalized = normalizeErpAsmKpiResponse(payload);

    const snapshotRow = {
      asm_id: normalized.snapshot.asm_id,
      month: normalized.snapshot.month,
      dt_target: 500,
      dt_thuc_dat: normalized.snapshot.dt_thuc_dat,
      kh_moi: normalized.snapshot.kh_moi,
      hb006: normalized.snapshot.hb006,
      hb034: normalized.snapshot.hb034,
      hb031: normalized.snapshot.hb031,
      hb035: normalized.snapshot.hb035,
      revenue_with_vat: normalized.snapshot.revenue_with_vat,
      from_date: normalized.snapshot.from_date,
      to_date: normalized.snapshot.to_date,
      source_system: normalized.snapshot.source_system,
      source_synced_at: normalized.snapshot.source_synced_at,
      raw_payload: normalized.snapshot.raw_payload,
      sync_run_id: syncRunId,
      updated_at: new Date().toISOString(),
    };

    const { data: existingRow, error: existingError } = await admin
      .from("kpi_data")
      .select("id")
      .eq("asm_id", employeeCode)
      .eq("month", period)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Unable to check existing KPI row for ${employeeCode}: ${existingError.message}`);
    }

    if (existingRow?.id) {
      const { error: updateError } = await admin
        .from("kpi_data")
        .update(snapshotRow)
        .eq("id", existingRow.id);

      if (updateError) {
        throw new Error(`Unable to update KPI row for ${employeeCode}: ${updateError.message}`);
      }
    } else {
      const { error: insertError } = await admin.from("kpi_data").insert({
        ...snapshotRow,
        noiquy: 0,
        total_kpi: 0,
        luong: 0,
      });

      if (insertError) {
        throw new Error(`Unable to insert KPI row for ${employeeCode}: ${insertError.message}`);
      }
    }

    const { error: deleteBreakdownError } = await admin
      .from("kpi_item_breakdowns")
      .delete()
      .eq("asm_id", employeeCode)
      .eq("month", period);

    if (deleteBreakdownError) {
      throw new Error(`Unable to clear item breakdowns for ${employeeCode}: ${deleteBreakdownError.message}`);
    }

    if (normalized.itemBreakdowns.length > 0) {
      const { error: insertBreakdownError } = await admin
        .from("kpi_item_breakdowns")
        .insert(
          normalized.itemBreakdowns.map((item) => ({
            ...item,
            sync_run_id: syncRunId,
          }))
        );

      if (insertBreakdownError) {
        throw new Error(`Unable to insert item breakdowns for ${employeeCode}: ${insertBreakdownError.message}`);
      }
    }

    const { error: finalizeError } = await admin
      .from("sales_kpi_sync_runs")
      .update({
        status: "succeeded",
        payload: payload,
        revenue_without_vat: normalized.snapshot.dt_thuc_dat,
        revenue_with_vat: normalized.snapshot.revenue_with_vat,
        new_customer_count: normalized.snapshot.kh_moi,
        items_count: normalized.itemBreakdowns.length,
        finished_at: new Date().toISOString(),
      })
      .eq("id", syncRunId);

    if (finalizeError) {
      throw new Error(`Unable to finalize sync log for ${employeeCode}: ${finalizeError.message}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";

    await admin
      .from("sales_kpi_sync_runs")
      .update({
        status: "failed",
        payload: payload,
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", syncRunId);

    throw error;
  }
}

export async function syncAllAsmsInMonth(period: string): Promise<SyncMonthSummary> {
  // Resolve configured date range (honours custom startDate/endDate set in Period Management)
  const { fromDate, toDate } = await resolveDateRange(period);
  console.log(`[sync] period=${period} fromDate=${fromDate} toDate=${toDate}`);

  let syncedCount = 0;
  let failedCount = 0;
  let firstError: string | undefined;

  for (const asm of demoSalesAsms) {
    try {
      await writeAsmSnapshot(asm.id, period, fromDate, toDate);
      syncedCount += 1;
    } catch (error) {
      failedCount += 1;
      const msg = error instanceof Error ? error.message : String(error);
      if (!firstError) firstError = msg;
      console.error(`Sales KPI sync failed for ${asm.id}:`, msg);
    }
  }

  return { period, syncedCount, failedCount, fromDate, toDate, firstError };
}
