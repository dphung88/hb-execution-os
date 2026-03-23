import Link from "next/link";

import { saveSalesTargetRowAction } from "@/app/(app)/sales-performance/targets/actions";
import { demoSalesAsms, salesKpiProducts, salesPeriods } from "@/lib/demo-data";
import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type SalesTargetsPageProps = {
  searchParams?: Promise<{
    period?: string;
    saved?: string;
    error?: string;
  }>;
};

function getSkuSuffix(value: unknown, fallback: number) {
  const raw = String(value ?? "").toUpperCase();
  const digits = raw.replace(/^HB/i, "").replace(/\D/g, "");
  const resolved = Number(digits || fallback);

  if (Number.isNaN(resolved)) {
    return fallback;
  }

  return Math.max(1, Math.min(999, resolved));
}

function periodLabel(period: string) {
  const [year, month] = period.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
}

export default async function SalesTargetsPage({ searchParams }: SalesTargetsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedPeriod = resolvedSearchParams?.period ?? salesPeriods[salesPeriods.length - 1]?.key ?? "2026-03";
  const savedAsm = resolvedSearchParams?.saved;
  const errorState = resolvedSearchParams?.error;

  const supabase = hasSupabaseClientEnv() ? await createClient() : null;
  const [{ data: targets, error: targetsError }, { data: reviews, error: reviewsError }, { data: actuals, error: actualsError }] =
    supabase
      ? await Promise.all([
          supabase
            .from("sales_monthly_targets")
            .select("*")
            .eq("month", selectedPeriod),
          supabase
            .from("sales_manager_reviews")
            .select("asm_id, discipline_score, reporting_score, reviewed_at")
            .eq("month", selectedPeriod),
          supabase
            .from("kpi_data")
            .select("asm_id, dt_thuc_dat, kh_moi")
            .eq("month", selectedPeriod),
        ])
      : [
          { data: null, error: null },
          { data: null, error: null },
          { data: null, error: null },
        ];

  const targetsByAsm = new Map((targetsError ? [] : targets ?? []).map((row) => [row.asm_id, row]));
  const reviewsByAsm = new Map((reviewsError ? [] : reviews ?? []).map((row) => [row.asm_id, row]));
  const actualsByAsm = new Map((actualsError ? [] : actuals ?? []).map((row) => [row.asm_id, row]));

  const targetCoverage = targets?.length ?? 0;
  const reviewCoverage = reviews?.length ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">Sales Targets</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Monthly target management for the full ASM roster.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Use this page to manage revenue and KPI targets outside ERP. Sales actuals still come from ERP sync, while targets and manager review stay under your control.
            </p>
          </div>

          <form method="get" className="flex flex-col gap-3 sm:flex-row">
            <select
              name="period"
              defaultValue={selectedPeriod}
              className="h-11 min-w-[220px] rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none"
            >
              {[...salesPeriods]
                .map((period) => period.key)
                .sort((a, b) => b.localeCompare(a))
                .map((period) => (
                  <option key={period} value={period} className="text-slate-900">
                    {periodLabel(period)}
                  </option>
                ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Apply period
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Current period", value: periodLabel(selectedPeriod), note: "Editing target plan" },
          { label: "Target setup coverage", value: `${targetCoverage}/${demoSalesAsms.length}`, note: "ASM with saved targets" },
          { label: "Manager review coverage", value: `${reviewCoverage}/${demoSalesAsms.length}`, note: "ASM with saved review" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
        ))}
      </section>

      {errorState ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50/90 p-5 shadow-panel">
          <p className="text-sm font-semibold text-rose-900">Unable to save targets</p>
          <p className="mt-2 text-sm text-rose-800">
            {errorState === "missing-columns"
              ? "Supabase is missing the new SKU code columns in sales_monthly_targets, so the target row cannot be saved yet."
              : errorState === "rls-blocked"
                ? "Supabase row-level security is still blocking write access for this Sales table."
                : "The write connection is not ready yet. I can finish this by opening public write access for these two Sales tables or by adding the Supabase service key on the deployment."}
          </p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-700">Monthly target matrix</p>
            <h2 className="text-2xl font-semibold text-slate-900">Save targets row by row for the selected month</h2>
          </div>
          <Link
            href={`/sales-performance?period=${selectedPeriod}`}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            Back to KPI dashboard
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {demoSalesAsms.map((asm) => {
            const target = targetsByAsm.get(asm.id);
            const targetRow = target as Record<string, unknown> | undefined;
            const review = reviewsByAsm.get(asm.id);
            const actual = actualsByAsm.get(asm.id);
            const saved = savedAsm === asm.id;

            return (
              <form
                key={asm.id}
                action={saveSalesTargetRowAction}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
              >
                <input type="hidden" name="asm_id" value={asm.id} />
                <input type="hidden" name="period" value={selectedPeriod} />

                <div className="grid gap-4 xl:grid-cols-[220px,1fr,180px] xl:items-start">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{asm.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{asm.id}</p>
                    <p className="mt-1 text-sm text-slate-500">{asm.region}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                      Sales Revenue:{" "}
                      {actual ? `${Number(actual.dt_thuc_dat / 1000000).toFixed(2)} million VND` : "Not synced"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                      Dealers code: {actual?.kh_moi ?? "-"}
                    </p>
                    {saved ? (
                      <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Row saved
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        {
                          name: "revenue_target",
                          label: "Sales Revenue (million VND)",
                          value: target?.revenue_target ?? 500,
                        },
                        { name: "new_customers_target", label: "Dealers Code", value: target?.new_customers_target ?? 10 },
                      ].map((field) => (
                        <label key={field.name} className="block">
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{field.label}</span>
                          <input
                            type="number"
                            name={field.name}
                            defaultValue={field.value}
                            className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="grid gap-3 xl:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Key SKU</p>
                        <div className="mt-3 grid gap-3">
                          {[
                            { codeName: "key_sku_code_1", codeValue: getSkuSuffix(targetRow?.key_sku_code_1, 31), qtyName: "hb031_target", qtyValue: target?.hb031_target ?? salesKpiProducts.HB031.target },
                            { codeName: "key_sku_code_2", codeValue: getSkuSuffix(targetRow?.key_sku_code_2, 35), qtyName: "hb035_target", qtyValue: target?.hb035_target ?? salesKpiProducts.HB035.target },
                          ].map((field) => (
                            <div key={field.qtyName} className="grid gap-3 sm:grid-cols-2">
                              <label className="block">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                  Code
                                </span>
                                <div className="mt-1 flex h-11 overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-brand-400">
                                  <div className="flex w-[84px] shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
                                    HB
                                  </div>
                                  <input
                                    type="number"
                                    min="1"
                                    max="999"
                                    step="1"
                                    name={field.codeName}
                                    defaultValue={field.codeValue}
                                    className="sku-code-input h-full min-w-0 flex-1 bg-white px-4 text-left text-sm tabular-nums text-slate-900 outline-none"
                                  />
                                </div>
                              </label>
                              <label className="block">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                  Quantity
                                </span>
                                <input
                                  type="number"
                                  name={field.qtyName}
                                  defaultValue={field.qtyValue}
                                  className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Clearstock</p>
                        <div className="mt-3 grid gap-3">
                          {[
                            { codeName: "clearstock_code_1", codeValue: getSkuSuffix(targetRow?.clearstock_code_1, 6), qtyName: "hb006_target", qtyValue: target?.hb006_target ?? salesKpiProducts.HB006.target },
                            { codeName: "clearstock_code_2", codeValue: getSkuSuffix(targetRow?.clearstock_code_2, 34), qtyName: "hb034_target", qtyValue: target?.hb034_target ?? salesKpiProducts.HB034.target },
                          ].map((field) => (
                            <div key={field.qtyName} className="grid gap-3 sm:grid-cols-2">
                              <label className="block">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                  Code
                                </span>
                                <div className="mt-1 flex h-11 overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-brand-400">
                                  <div className="flex w-[84px] shrink-0 items-center justify-center border-r border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
                                    HB
                                  </div>
                                  <input
                                    type="number"
                                    min="1"
                                    max="999"
                                    step="1"
                                    name={field.codeName}
                                    defaultValue={field.codeValue}
                                    className="sku-code-input h-full min-w-0 flex-1 bg-white px-4 text-left text-sm tabular-nums text-slate-900 outline-none"
                                  />
                                </div>
                              </label>
                              <label className="block">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                  Quantity
                                </span>
                                <input
                                  type="number"
                                  name={field.qtyName}
                                  defaultValue={field.qtyValue}
                                  className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="xl:w-[180px]">
                    <button
                      type="submit"
                      className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Save targets
                    </button>
                    <Link
                      href={`/sales-performance/${asm.id}?period=${selectedPeriod}`}
                      className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                    >
                      Open ASM detail
                    </Link>
                  </div>
                </div>
              </form>
            );
          })}
        </div>
      </section>
    </div>
  );
}
