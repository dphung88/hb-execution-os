import Link from "next/link";

import { MobileSalesTargetsSelector } from "@/components/sales/mobile-sales-targets-selector";
import {
  saveSalesTargetDefaultsAction,
  saveSalesTargetRowAction,
} from "@/app/(app)/sales-performance/targets/actions";
import { demoSalesAsms, salesKpiProducts } from "@/lib/demo-data";
import { getPeriods } from "@/lib/config/periods";
import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type SalesTargetsPageProps = {
  searchParams?: Promise<{
    period?: string;
    saved?: string;
    error?: string;
    asm?: string;
  }>;
};


export default async function SalesTargetsPage({ searchParams }: SalesTargetsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const configPeriods = await getPeriods();
  const selectedPeriod = resolvedSearchParams?.period ?? configPeriods[0]?.key ?? "2026-03";
  const savedAsm = resolvedSearchParams?.saved;
  const errorState = resolvedSearchParams?.error;
  const selectedAsm = resolvedSearchParams?.asm ?? demoSalesAsms[0]?.id;

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
  const bulkSaved = savedAsm === "all";
  const baselineTarget = {
    revenueTarget: 500,
    newCustomersTarget: 10,
    keySkuCode1: "HB031",
    keySkuCode2: "HB035",
    clearstockCode1: "HB006",
    clearstockCode2: "HB034",
    hb031Target: salesKpiProducts.HB031.target,
    hb035Target: salesKpiProducts.HB035.target,
    hb006Target: salesKpiProducts.HB006.target,
    hb034Target: salesKpiProducts.HB034.target,
  };
  const mobileRows = demoSalesAsms.map((asm) => {
    const target = targetsByAsm.get(asm.id);
    const targetRow = target as Record<string, unknown> | undefined;
    const actual = actualsByAsm.get(asm.id);

    return {
      id: asm.id,
      name: asm.name,
      region: asm.region,
      saved: savedAsm === asm.id,
      target: {
        revenue_target: target?.revenue_target ?? 500,
        new_customers_target: target?.new_customers_target ?? 10,
        key_sku_code_1: String(targetRow?.key_sku_code_1 ?? "HB031"),
        key_sku_code_2: String(targetRow?.key_sku_code_2 ?? "HB035"),
        clearstock_code_1: String(targetRow?.clearstock_code_1 ?? "HB006"),
        clearstock_code_2: String(targetRow?.clearstock_code_2 ?? "HB034"),
        hb031_target: target?.hb031_target ?? salesKpiProducts.HB031.target,
        hb035_target: target?.hb035_target ?? salesKpiProducts.HB035.target,
        hb006_target: target?.hb006_target ?? salesKpiProducts.HB006.target,
        hb034_target: target?.hb034_target ?? salesKpiProducts.HB034.target,
      },
    };
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">Sales Targets</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">Monthly target management for the full ASM roster.</h1>
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
              {[...configPeriods]
                .sort((a, b) => b.key.localeCompare(a.key))
                .map((period) => (
                  <option key={period.key} value={period.key} className="text-slate-900">
                    {period.label}
                  </option>
                ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Apply Period
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Current period", value: configPeriods.find((p) => p.key === selectedPeriod)?.label ?? selectedPeriod, note: "Editing target plan" },
          { label: "Target setup coverage", value: `${targetCoverage}/${demoSalesAsms.length}`, note: "ASM with saved targets" },
          { label: "Manager review coverage", value: `${reviewCoverage}/${demoSalesAsms.length}`, note: "ASM with saved review" },
        ].map((card, i) => {
          const pal = [
            { card: "border-sky-100 bg-sky-50", label: "text-sky-600" },
            { card: "border-violet-100 bg-violet-50", label: "text-violet-600" },
            { card: "border-emerald-100 bg-emerald-50", label: "text-emerald-600" },
          ][i] ?? { card: "border-white/70 bg-white/85", label: "text-slate-400" };
          return (
          <div key={card.label} className={`rounded-3xl border p-6 shadow-panel ${pal.card}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${pal.label}`}>{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.note}</p>
          </div>
          );
        })}
      </section>

      {bulkSaved ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-panel">
          <p className="text-sm font-semibold text-emerald-900">Baseline targets applied</p>
          <p className="mt-2 text-sm text-emerald-800">
            The selected month now has one shared target setup across the full ASM roster. Use the row-level forms below only for exceptions.
          </p>
        </section>
      ) : null}

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
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">BULK TARGET SETUP</p>
          <h2 className="text-2xl font-semibold text-slate-900">Apply One Baseline Target Setup To All ASM</h2>
          <p className="text-sm leading-6 text-slate-500">
            Use this once per month when the core Sales Target, Dealers Code, Key SKU, and Clearstock targets are mostly identical. Then adjust only the exceptional ASM rows below.
          </p>
        </div>

        <form action={saveSalesTargetDefaultsAction} className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <input type="hidden" name="period" value={selectedPeriod} />

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  name: "revenue_target",
                  label: "Sales Target",
                  value: baselineTarget.revenueTarget,
                  note: "Unit: million VND",
                },
                {
                  name: "new_customers_target",
                  label: "Dealers Code",
                  value: baselineTarget.newCustomersTarget,
                },
              ].map((field) => (
                <label key={field.name} className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{field.label}</span>
                  <input
                    type="number"
                    name={field.name}
                    defaultValue={field.value}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                  />
                  {"note" in field ? <span className="mt-2 block text-xs text-slate-500">{field.note}</span> : null}
                </label>
              ))}
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">Key SKU</p>
                <div className="mt-3 grid gap-3">
                  {[
                    {
                      codeName: "key_sku_code_1",
                      codeValue: baselineTarget.keySkuCode1,
                      qtyName: "hb031_target",
                      qtyValue: baselineTarget.hb031Target,
                    },
                    {
                      codeName: "key_sku_code_2",
                      codeValue: baselineTarget.keySkuCode2,
                      qtyName: "hb035_target",
                      qtyValue: baselineTarget.hb035Target,
                    },
                  ].map((field) => (
                    <div key={field.qtyName} className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Code</span>
                        <input
                          type="text"
                          name={field.codeName}
                          defaultValue={field.codeValue}
                          className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-900 outline-none transition focus:border-brand-400"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Quantity</span>
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

              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">Clearstock</p>
                <div className="mt-3 grid gap-3">
                  {[
                    {
                      codeName: "clearstock_code_1",
                      codeValue: baselineTarget.clearstockCode1,
                      qtyName: "hb006_target",
                      qtyValue: baselineTarget.hb006Target,
                    },
                    {
                      codeName: "clearstock_code_2",
                      codeValue: baselineTarget.clearstockCode2,
                      qtyName: "hb034_target",
                      qtyValue: baselineTarget.hb034Target,
                    },
                  ].map((field) => (
                    <div key={field.qtyName} className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Code</span>
                        <input
                          type="text"
                          name={field.codeName}
                          defaultValue={field.codeValue}
                          className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-900 outline-none transition focus:border-brand-400"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Quantity</span>
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

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Apply to all ASM
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">MONTHLY TARGET MATRIX</p>
            <h2 className="text-2xl font-semibold text-slate-900">Adjust Target Rows Only For Exceptions</h2>
          </div>
          <Link
            href={`/sales-performance?period=${selectedPeriod}`}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            Back to KPI Dashboard
          </Link>
        </div>

        <MobileSalesTargetsSelector
          asms={mobileRows}
          selectedPeriod={selectedPeriod}
          initialAsmId={selectedAsm}
          saveAction={saveSalesTargetRowAction}
        />

        <div className="mt-6 hidden space-y-4 md:block">
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
                    <p className="text-base font-semibold text-slate-900">{asm.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{asm.id}</p>
                    <p className="mt-1 text-sm text-slate-500">{asm.region}</p>
                    {saved ? (
                      <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Row saved
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          name: "revenue_target",
                          label: "Sales Target",
                          value: target?.revenue_target ?? 500,
                          note: "Unit: million VND",
                        },
                        { name: "new_customers_target", label: "Dealers Code", value: target?.new_customers_target ?? 10 },
                      ].map((field) => (
                        <label key={field.name} className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{field.label}</span>
                          <input
                            type="number"
                            name={field.name}
                            defaultValue={field.value}
                            className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
                          />
                          {"note" in field ? (
                            <span className="mt-2 block text-xs text-slate-500">{field.note}</span>
                          ) : null}
                        </label>
                      ))}
                    </div>

                    <div className="grid gap-3 xl:grid-cols-2">
                      <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">Key SKU</p>
                        <div className="mt-3 grid gap-3">
                          {[
                            { codeName: "key_sku_code_1", codeValue: String(targetRow?.key_sku_code_1 ?? "HB031"), qtyName: "hb031_target", qtyValue: target?.hb031_target ?? salesKpiProducts.HB031.target },
                            { codeName: "key_sku_code_2", codeValue: String(targetRow?.key_sku_code_2 ?? "HB035"), qtyName: "hb035_target", qtyValue: target?.hb035_target ?? salesKpiProducts.HB035.target },
                          ].map((field) => (
                            <div key={field.qtyName} className="grid grid-cols-2 gap-2">
                              <label className="block">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                  Code
                                </span>
                                <input
                                  type="text"
                                  name={field.codeName}
                                  defaultValue={field.codeValue}
                                  className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-900 outline-none transition focus:border-brand-400"
                                />
                              </label>
                              <label className="block">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
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

                      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">Clearstock</p>
                        <div className="mt-3 grid gap-3">
                          {[
                            { codeName: "clearstock_code_1", codeValue: String(targetRow?.clearstock_code_1 ?? "HB006"), qtyName: "hb006_target", qtyValue: target?.hb006_target ?? salesKpiProducts.HB006.target },
                            { codeName: "clearstock_code_2", codeValue: String(targetRow?.clearstock_code_2 ?? "HB034"), qtyName: "hb034_target", qtyValue: target?.hb034_target ?? salesKpiProducts.HB034.target },
                          ].map((field) => (
                            <div key={field.qtyName} className="grid grid-cols-2 gap-2">
                              <label className="block">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                  Code
                                </span>
                                <input
                                  type="text"
                                  name={field.codeName}
                                  defaultValue={field.codeValue}
                                  className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-900 outline-none transition focus:border-brand-400"
                                />
                              </label>
                              <label className="block">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
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
