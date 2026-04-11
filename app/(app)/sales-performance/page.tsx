import { SalesPerformanceHub } from "@/components/sales/sales-performance-hub";
import { getSalesScorecardsData } from "@/lib/sales/queries";

type SalesPerformancePageProps = {
  searchParams?: Promise<{
    period?: string;
    sync?: string;
    synced?: string;
    failed?: string;
    message?: string;
  }>;
};

export default async function SalesPerformancePage({ searchParams }: SalesPerformancePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const period = resolvedSearchParams?.period;
  const sync = resolvedSearchParams?.sync;
  const synced = resolvedSearchParams?.synced;
  const failed = resolvedSearchParams?.failed;
  const message = resolvedSearchParams?.message;
  const { scorecards, liveCount, periods, selectedPeriod, probationMap } = await getSalesScorecardsData(period);

  const syncMessage =
    sync === "success"
      ? message ?? `Sync completed: ${synced ?? 0} ASM succeeded, ${failed ?? 0} failed.`
      : sync === "error"
        ? message ?? "ERP sync failed."
        : sync === "missing-period"
          ? "Please choose a month before syncing."
          : undefined;

  return (
    <SalesPerformanceHub
      scorecards={scorecards}
      liveCount={liveCount}
      periods={periods}
      selectedPeriod={selectedPeriod}
      syncStatus={sync}
      syncMessage={syncMessage}
      probationMap={probationMap}
    />
  );
}
