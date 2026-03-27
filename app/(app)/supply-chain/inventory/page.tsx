import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPeriods } from "@/lib/config/periods";
import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams?: Promise<{ period?: string }> };

async function loadSkuInventory() {
  if (!hasSupabaseClientEnv()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("sku_lot_dates")
      .select("code, name, stock_on_hand, lot_date")
      .order("code", { ascending: true });
    return data ?? [];
  } catch { return []; }
}

function coverageBadge(days: number | null) {
  if (days === null) return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">No date</span>;
  if (days <= 0)  return <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">Expired</span>;
  if (days <= 30) return <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">{days}d left</span>;
  if (days <= 90) return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">{days}d left</span>;
  return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">{days}d left</span>;
}

export default async function ScInventoryPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? periods[0]?.key ?? "";
  const periodLabel = periods.find((p) => p.key === selectedPeriod)?.label ?? selectedPeriod;

  const skus = await loadSkuInventory();
  const today = new Date();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">Supply Chain</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
              Inventory Overview — {periodLabel}
            </h1>
            <p className="mt-3 text-sm text-slate-400">Stock on hand, lot dates, and coverage days per SKU.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <form method="get" className="flex items-center gap-2">
              <select name="period" defaultValue={selectedPeriod}
                className="h-10 cursor-pointer rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none">
                {periods.map((p) => <option key={p.key} value={p.key} className="text-slate-900">{p.label}</option>)}
              </select>
              <button type="submit" className="h-10 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-300">Apply</button>
            </form>
            <Link href="/supply-chain"
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" /> SC Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">SKU Stock Summary</h2>
        <p className="mt-1 text-sm text-slate-500">
          {skus.length > 0
            ? `${skus.length} SKUs loaded from lot date registry.`
            : "Pulling from sku_lot_dates table — connect Supabase to populate."}
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Code</th>
                <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Product Name</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Stock on Hand</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Lot Date</th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {skus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                    No SKU data — configure Supabase or add rows via Settings → SKU Lot Dates.
                  </td>
                </tr>
              ) : skus.map((sku) => {
                const daysLeft = sku.lot_date
                  ? Math.floor((new Date(sku.lot_date).getTime() - today.getTime()) / 86400000)
                  : null;
                return (
                  <tr key={sku.code} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5 font-mono text-xs text-slate-600">{sku.code}</td>
                    <td className="py-2.5 font-medium text-slate-800">{sku.name || sku.code}</td>
                    <td className="py-2.5 text-right text-slate-700">{sku.stock_on_hand?.toLocaleString() ?? "—"}</td>
                    <td className="py-2.5 text-right text-slate-500">{sku.lot_date ? sku.lot_date.slice(0, 10) : "—"}</td>
                    <td className="py-2.5 text-right">{coverageBadge(daysLeft)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
