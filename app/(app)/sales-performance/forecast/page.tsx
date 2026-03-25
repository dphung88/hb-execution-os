import { SalesForecastWorkspace } from "@/components/sales/sales-forecast-workspace";
import { getSalesForecastData } from "@/lib/sales/forecast";
import { getSalesScorecardsData } from "@/lib/sales/queries";

type SalesForecastPageProps = {
  searchParams?: Promise<{
    period?: string;
  }>;
};

export default async function SalesForecastPage({ searchParams }: SalesForecastPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const period = resolvedSearchParams?.period;
  const { scorecards, selectedPeriod } = await getSalesScorecardsData(period);
  const forecast = getSalesForecastData(scorecards, selectedPeriod);

  return <SalesForecastWorkspace forecast={forecast} />;
}
