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
  const { scorecards, selectedPeriod, periods } = await getSalesScorecardsData(period);
  const forecast = await getSalesForecastData(scorecards, selectedPeriod, periods);

  return <SalesForecastWorkspace forecast={forecast} />;
}
