import { SalesPerformanceHub } from "@/components/sales/sales-performance-hub";
import { getSalesScorecardsData } from "@/lib/sales/queries";

export default async function SalesPerformancePage() {
  const { scorecards, liveCount, seededCount } = await getSalesScorecardsData();

  return <SalesPerformanceHub scorecards={scorecards} liveCount={liveCount} seededCount={seededCount} />;
}
