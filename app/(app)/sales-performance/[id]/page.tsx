import { notFound } from "next/navigation";

import { SalesPerformanceDetail } from "@/components/sales/sales-performance-detail";
import { getSalesAsmByIdResolved } from "@/lib/sales/queries";

type SalesPerformanceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    period?: string;
  }>;
};

export default async function SalesPerformanceDetailPage({
  params,
  searchParams,
}: SalesPerformanceDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const period = resolvedSearchParams?.period;
  const asm = await getSalesAsmByIdResolved(id, period);

  if (!asm) {
    notFound();
  }

  return <SalesPerformanceDetail asm={asm} selectedPeriod={period ?? asm.periodKey} />;
}
