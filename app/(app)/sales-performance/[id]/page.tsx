import { notFound } from "next/navigation";

import { SalesPerformanceDetail } from "@/components/sales/sales-performance-detail";
import { getSalesAsmById } from "@/lib/sales/scorecards";

type SalesPerformanceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SalesPerformanceDetailPage({ params }: SalesPerformanceDetailPageProps) {
  const { id } = await params;
  const asm = getSalesAsmById(id);

  if (!asm) {
    notFound();
  }

  return <SalesPerformanceDetail asm={asm} />;
}
