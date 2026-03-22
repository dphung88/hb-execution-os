import { notFound } from "next/navigation";

import { SalesPerformanceDetail } from "@/components/sales/sales-performance-detail";
import { getSalesAsmByIdResolved } from "@/lib/sales/queries";

type SalesPerformanceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SalesPerformanceDetailPage({ params }: SalesPerformanceDetailPageProps) {
  const { id } = await params;
  const asm = await getSalesAsmByIdResolved(id);

  if (!asm) {
    notFound();
  }

  return <SalesPerformanceDetail asm={asm} />;
}
