import Link from "next/link";
import { ArrowLeft, BarChart3, Package } from "lucide-react";
import type { SkuVolumeRow } from "@/app/(app)/sales-performance/volume/page";
import type { SalesPeriodOption } from "@/lib/sales/queries";

type Props = {
  periods: SalesPeriodOption[];
  selectedPeriod: string;
  skuRows: SkuVolumeRow[];
};

export function SalesVolumeWorkspace({ periods, selectedPeriod, skuRows }: Props) {
  const totalUnits = skuRows.reduce((s, r) => s + r.totalQty, 0);
  const topSku = skuRows[0];
  const uniqueProducts = skuRows.length;

  const heroLabelClass = "text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={heroLabelClass}>Sales Team</p>
          <Link
            href={`/sales-performance?period=${selectedPeriod}`}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/15"
          >
            <ArrowLeft className="h-3 w-3" />
            Sales Dashboard
          </Link>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
          Portfolio Sales Volume
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Full SKU sell-out breakdown by product and ASM for the selected period.
        </p>

        {/* Period selector */}
        <form method="get" className="mt-5 flex items-center gap-2">
          <select
            name="period"
            defaultValue={selectedPeriod}
            className="h-11 rounded-2xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none transition focus:border-sky-300 cursor-pointer"
          >
            {periods.map((p) => (
              <option key={p.key} value={p.key} className="text-slate-900">
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-11 rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Apply
          </button>
        </form>

        {/* Summary stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Units Sold", value: totalUnits.toLocaleString("en-US") },
            { label: "Unique Products", value: uniqueProducts.toString() },
            { label: "Top SKU", value: topSku ? `${topSku.itemCode} · ${topSku.totalQty.toLocaleString()} u` : "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/10 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SKU volume table */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">SKU Breakdown</p>
            <h2 className="text-2xl font-semibold text-slate-900">All Products Ranked by Volume</h2>
          </div>
        </div>

        {skuRows.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-slate-200 px-6 py-14 text-center">
            <Package className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-base font-semibold text-slate-900">No sales data for this period.</p>
            <p className="mt-1 text-sm text-slate-500">Sync ERP data from the Sales Dashboard first.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {skuRows.map((sku, idx) => {
              const maxQty = skuRows[0]?.totalQty ?? 1;
              const barPct = Math.round((sku.totalQty / maxQty) * 100);

              return (
                <div
                  key={sku.itemCode}
                  className="rounded-2xl border border-slate-100 bg-white p-4"
                >
                  {/* Header row */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-sky-600">{sku.itemCode}</span>
                        <span className="ml-2 text-sm text-slate-700">{sku.itemName}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                      {sku.totalQty.toLocaleString("en-US")} units
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-sky-400 transition-all"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>

                  {/* ASM breakdown — collapsed on small screens */}
                  {sku.asmBreakdown.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sku.asmBreakdown.map((a) => (
                        <span
                          key={a.asmId}
                          className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                        >
                          {a.asmName}: <span className="font-semibold text-slate-900">{a.qty.toLocaleString()}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
