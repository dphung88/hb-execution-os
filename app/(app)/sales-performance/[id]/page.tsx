import { notFound } from "next/navigation";

import { SalesPerformanceDetail } from "@/components/sales/sales-performance-detail";
import { getSalesAsmByIdResolved, getSalesManagementFormData } from "@/lib/sales/queries";

type SalesPerformanceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    period?: string;
    saved?: string;
    error?: string;
  }>;
};

export default async function SalesPerformanceDetailPage({
  params,
  searchParams,
}: SalesPerformanceDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const period = resolvedSearchParams?.period;
  const saved = resolvedSearchParams?.saved;
  const error = resolvedSearchParams?.error;
  const asm = await getSalesAsmByIdResolved(id, period);

  if (!asm) {
    notFound();
  }

  const management = await getSalesManagementFormData(id, period ?? asm.periodKey);

  return (
    <SalesPerformanceDetail
      asm={asm}
      selectedPeriod={period ?? asm.periodKey}
      canEdit
      target={management.target}
      review={management.review}
      saveStatus={saved}
      errorStatus={error}
    />
  );
}
