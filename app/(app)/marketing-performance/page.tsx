import { MarketingTeamHub } from "@/components/marketing/marketing-team-hub";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";

type Props = { searchParams?: Promise<{ period?: string }> };

export default async function MarketingPerformancePage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? getCurrentPeriod(periods);

  return <MarketingTeamHub periods={periods} selectedPeriod={selectedPeriod} />;
}
