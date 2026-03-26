import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { upsertSkuLotDateAction, deleteSkuLotDateAction } from "./actions";

type SkuRow = { code: string; name: string | null; lot_date: string | null; stock_on_hand: number | null; weekly_sell_out: number | null };

async function getSkuLotDates(): Promise<SkuRow[]> {
  if (!hasSupabaseAdminEnv()) return [];
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("sku_lot_dates").select("code, name, lot_date, stock_on_hand, weekly_sell_out").order("code");
    return (data ?? []) as SkuRow[];
  } catch { return []; }
}

export default async function SettingsSkusPage() {
  const skus = await getSkuLotDates();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">Settings</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">SKU Lot Dates</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Manage lot / expiry dates and warehouse stock for each SKU. This data feeds the Sales Forecast clearstock analysis automatically — no need to enter dates manually per target.
        </p>
      </section>

      {/* Current SKUs */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">SKU Registry</h2>
        <p className="mt-1 text-sm text-slate-500">
          {skus.length} SKU{skus.length !== 1 ? "s" : ""} configured. Edit any row and save.
        </p>

        {skus.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">No SKUs yet. Run the SQL migration first, then add SKUs below.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {/* Header */}
            <div className="hidden grid-cols-[80px,1fr,130px,110px,110px,80px,80px] gap-3 px-4 sm:grid">
              {["Code", "Name", "Lot Date", "Stock", "Wk Sell-out", "", ""].map((h, i) => (
                <p key={i} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{h}</p>
              ))}
            </div>

            {skus.map((sku) => (
              <div key={sku.code} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <form id={`del-${sku.code}`} action={deleteSkuLotDateAction}>
                  <input type="hidden" name="code" value={sku.code} />
                </form>
                <form
                  action={upsertSkuLotDateAction}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-[80px,1fr,130px,110px,110px,80px,80px] sm:items-center"
                >
                  <input type="hidden" name="code" value={sku.code} />
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">Code</p>
                    <p className="flex h-9 items-center font-mono text-sm font-semibold text-sky-600">{sku.code}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">Name</p>
                    <input name="name" defaultValue={sku.name ?? ""} placeholder="SKU display name" className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">Lot Date</p>
                    <input type="date" name="lot_date" defaultValue={sku.lot_date ?? ""} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">Stock on hand</p>
                    <input type="number" name="stock_on_hand" defaultValue={sku.stock_on_hand ?? 0} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">Weekly sell-out</p>
                    <input type="number" name="weekly_sell_out" defaultValue={sku.weekly_sell_out ?? 0} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
                  </div>
                  <div>
                    <button type="submit" className="h-9 w-full rounded-xl bg-sky-400 px-3 text-xs font-semibold text-slate-950 transition hover:bg-sky-300 sm:w-auto">
                      Save
                    </button>
                  </div>
                  <div>
                    <button type="submit" form={`del-${sku.code}`} className="h-9 w-full rounded-xl border border-rose-200 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 sm:w-auto">
                      Delete
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add new */}
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-900">Add SKU</h2>
        <p className="mt-1 text-sm text-slate-500">Enter the SKU code, lot expiry date, and current warehouse figures.</p>

        <form action={upsertSkuLotDateAction} className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Code</span>
              <input name="code" required placeholder="HB001" className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-mono uppercase text-slate-900 outline-none transition focus:border-sky-400" />
            </label>
            <label className="block xl:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Name</span>
              <input name="name" placeholder="HB Collagen Type 1,2&3 C/120V" className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Lot Date</span>
              <input type="date" name="lot_date" className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Stock on Hand</span>
              <input type="number" name="stock_on_hand" defaultValue={0} className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400" />
            </label>
          </div>
          <button type="submit" className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-sky-400 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
            Add SKU
          </button>
        </form>
      </section>
    </div>
  );
}
