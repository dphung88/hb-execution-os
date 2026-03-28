import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";
import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams?: Promise<{ period?: string }> };

type AssetRow = {
  id: string;
  category: string;
  item: string;
  value: number | null;
  notes: string | null;
};

type AssetSection = {
  label: string;
  key: string;
  color: string;
  items: string[];
};

const ASSET_STRUCTURE: AssetSection[] = [
  {
    label: "Fixed Assets (Tài sản cố định)",
    key: "fixed",
    color: "text-sky-700",
    items: [
      "Machinery & Equipment",
      "Vehicles & Transport",
      "Furniture & Fixtures",
      "Leasehold Improvements",
      "Land & Buildings",
    ],
  },
  {
    label: "Current Assets (Tài sản ngắn hạn)",
    key: "current",
    color: "text-emerald-700",
    items: [
      "Cash & Bank Balances",
      "Accounts Receivable (AR)",
      "Inventory (Stock on Hand)",
      "Prepaid Expenses",
      "Short-term Investments",
    ],
  },
  {
    label: "Intangible Assets (Tài sản vô hình)",
    key: "intangible",
    color: "text-violet-700",
    items: [
      "Licenses & Permits",
      "Software & Technology",
      "Brand & Intellectual Property",
      "Goodwill",
    ],
  },
  {
    label: "Liabilities (Nợ phải trả)",
    key: "liability",
    color: "text-rose-700",
    items: [
      "Short-term Bank Loans",
      "Accounts Payable (AP)",
      "Tax Payable",
      "Long-term Debt",
      "Other Liabilities",
    ],
  },
];

async function loadAssets(period: string): Promise<AssetRow[]> {
  if (!hasSupabaseClientEnv()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("finance_assets")
      .select("id, category, item, value, notes")
      .eq("period", period);
    return (data ?? []) as AssetRow[];
  } catch { return []; }
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return n.toLocaleString("en-US");
}

export default async function FinanceAssetsPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? getCurrentPeriod(periods);
  const periodLabel = periods.find((p) => p.key === selectedPeriod)?.label ?? selectedPeriod;

  const assets = await loadAssets(selectedPeriod);

  // Build lookup: category → item → value
  const lookup: Record<string, Record<string, AssetRow>> = {};
  for (const row of assets) {
    if (!lookup[row.category]) lookup[row.category] = {};
    lookup[row.category][row.item] = row;
  }

  // Totals
  const totalFixed    = ASSET_STRUCTURE.find(s => s.key === "fixed")?.items.reduce((s, i) => s + (lookup["fixed"]?.[i]?.value ?? 0), 0) ?? 0;
  const totalCurrent  = ASSET_STRUCTURE.find(s => s.key === "current")?.items.reduce((s, i) => s + (lookup["current"]?.[i]?.value ?? 0), 0) ?? 0;
  const totalIntang   = ASSET_STRUCTURE.find(s => s.key === "intangible")?.items.reduce((s, i) => s + (lookup["intangible"]?.[i]?.value ?? 0), 0) ?? 0;
  const totalLiab     = ASSET_STRUCTURE.find(s => s.key === "liability")?.items.reduce((s, i) => s + (lookup["liability"]?.[i]?.value ?? 0), 0) ?? 0;
  const totalAssets   = totalFixed + totalCurrent + totalIntang;
  const netAssets     = totalAssets - totalLiab;
  const hasData       = assets.length > 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">Finance</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Asset Breakdown — {periodLabel}
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Fixed assets, current assets, intangibles, and liabilities — net position overview.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <form method="get" className="flex items-center gap-2">
              <select name="period" defaultValue={selectedPeriod}
                className="h-10 cursor-pointer rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none">
                {periods.map((p) => <option key={p.key} value={p.key} className="text-slate-900">{p.label}</option>)}
              </select>
              <button type="submit" className="h-10 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-300">Apply</button>
            </form>
            <Link href="/finance"
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" /> Finance Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total Assets</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{hasData ? `${fmt(totalAssets)} ₫` : "—"}</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total Liabilities</p>
          <p className="mt-3 text-2xl font-semibold text-rose-600">{hasData ? `${fmt(totalLiab)} ₫` : "—"}</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Net Assets</p>
          <p className={`mt-3 text-2xl font-semibold ${netAssets >= 0 ? "text-sky-600" : "text-rose-600"}`}>
            {hasData ? `${fmt(netAssets)} ₫` : "—"}
          </p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-panel">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Current Assets</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-600">{hasData ? `${fmt(totalCurrent)} ₫` : "—"}</p>
        </div>
      </div>

      {/* Asset table */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Asset &amp; Liability Breakdown</h2>
        <p className="mt-1 text-sm text-slate-500">
          {hasData
            ? `${assets.length} line items loaded for ${periodLabel}.`
            : "Structure ready — populate via finance_assets table in Supabase."}
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Item</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Value (₫)</th>
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 pl-6">Notes</th>
              </tr>
            </thead>
            <tbody>
              {ASSET_STRUCTURE.map(({ label, key, color, items }) => {
                const sectionTotal = items.reduce((s, i) => s + (lookup[key]?.[i]?.value ?? 0), 0);
                return (
                  <React.Fragment key={key}>
                    {/* Section header */}
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td colSpan={3} className={`px-2 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${color}`}>
                        {label}
                      </td>
                    </tr>
                    {items.map((item) => {
                      const row = lookup[key]?.[item];
                      return (
                        <tr key={item} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-2.5 pl-4 text-slate-700">{item}</td>
                          <td className="py-2.5 text-right font-medium text-slate-800">
                            {row?.value != null ? fmt(row.value) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-2.5 pl-6 text-slate-400 text-xs">{row?.notes ?? ""}</td>
                        </tr>
                      );
                    })}
                    {/* Section subtotal */}
                    <tr className="bg-slate-50/50">
                      <td className="py-2 pl-4 text-[11px] font-semibold text-slate-500">Subtotal</td>
                      <td className={`py-2 text-right text-sm font-semibold ${color}`}>
                        {hasData ? fmt(sectionTotal) : "—"}
                      </td>
                      <td />
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* Net position */}
              <tr className="border-t-2 border-slate-300 bg-slate-100">
                <td className="py-3 pl-2 font-bold text-slate-900">Net Assets (Equity)</td>
                <td className={`py-3 text-right text-base font-bold ${netAssets >= 0 ? "text-sky-700" : "text-rose-700"}`}>
                  {hasData ? fmt(netAssets) : "—"}
                </td>
                <td className="py-3 pl-6 text-xs text-slate-400">Total Assets − Total Liabilities</td>
              </tr>
            </tbody>
          </table>
        </div>

        {!hasData && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
            <p className="font-medium text-slate-700">How to populate</p>
            <p className="mt-1">Run the SQL migration to create the <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">finance_assets</code> table, then insert rows with <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">period, category, item, value</code>.</p>
          </div>
        )}
      </section>
    </div>
  );
}
