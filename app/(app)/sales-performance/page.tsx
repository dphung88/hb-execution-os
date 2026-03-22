import { SalesPerformanceHub } from "@/components/sales/sales-performance-hub";
import { getSalesScorecardsData } from "@/lib/sales/queries";

type SalesPerformancePageProps = {
  searchParams?: Promise<{
    period?: string;
  }>;
};

export default async function SalesPerformancePage({ searchParams }: SalesPerformancePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const period = resolvedSearchParams?.period;
  const { scorecards, liveCount, seededCount, periods, selectedPeriod } = await getSalesScorecardsData(period);

  return (
    <SalesPerformanceHub
      scorecards={scorecards}
      liveCount={liveCount}
      seededCount={seededCount}
      periods={periods}
      selectedPeriod={selectedPeriod}
    />
  );
}
