import { getPeriods } from "@/lib/config/periods";
import { getAvailableSalesPeriods } from "@/lib/sales/queries";
import { hasSupabaseClientEnv } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { demoSalesAsms } from "@/lib/demo-data";
import { SalesVolumeWorkspace } from "@/components/sales/sales-volume-workspace";

type Props = {
  searchParams?: Promise<{ period?: string }>;
};

export type SkuVolumeRow = {
  itemCode: string;
  itemName: string;
  totalQty: number;
  asmBreakdown: Array<{ asmId: string; asmName: string; qty: number }>;
};

export default async function SalesVolumePage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getAvailableSalesPeriods();
  const configPeriods = await getPeriods();
  const selectedPeriod = params?.period ?? periods[0]?.key ?? configPeriods[0]?.key ?? "2026-03";

  let skuRows: SkuVolumeRow[] = [];

  if (hasSupabaseClientEnv()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("kpi_item_breakdowns")
      .select("asm_id, item_code, item_name, quantity")
      .eq("month", selectedPeriod)
      .order("item_code", { ascending: true });

    if (!error && data?.length) {
      const asmNameMap = new Map(demoSalesAsms.map((a) => [a.id, a.name]));

      // Aggregate by item_code
      const byCode = new Map<string, { name: string; byAsm: Map<string, number> }>();
      for (const row of data) {
        const code = String(row.item_code).toUpperCase();
        const entry = byCode.get(code) ?? { name: row.item_name ?? code, byAsm: new Map() };
        const prev = entry.byAsm.get(row.asm_id) ?? 0;
        entry.byAsm.set(row.asm_id, prev + Number(row.quantity ?? 0));
        byCode.set(code, entry);
      }

      skuRows = Array.from(byCode.entries())
        .map(([code, entry]) => {
          const asmBreakdown = Array.from(entry.byAsm.entries())
            .map(([asmId, qty]) => ({
              asmId,
              asmName: asmNameMap.get(asmId) ?? asmId,
              qty,
            }))
            .filter((a) => a.qty !== 0)
            .sort((a, b) => b.qty - a.qty);

          return {
            itemCode: code,
            itemName: entry.name,
            totalQty: asmBreakdown.reduce((s, a) => s + a.qty, 0),
            asmBreakdown,
          };
        })
        .filter((r) => r.totalQty > 0)
        .sort((a, b) => b.totalQty - a.totalQty);
    }
  }

  return (
    <SalesVolumeWorkspace
      periods={periods}
      selectedPeriod={selectedPeriod}
      skuRows={skuRows}
    />
  );
}
