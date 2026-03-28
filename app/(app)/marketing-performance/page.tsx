import { MarketingTeamHub } from "@/components/marketing/marketing-team-hub";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";
import { getChannelPerformance } from "@/lib/marketing/channel-performance";

type Props = { searchParams?: Promise<{ period?: string }> };

export default async function MarketingPerformancePage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? getCurrentPeriod(periods);
  const { rows: channelRows, source: channelSource } = await getChannelPerformance(selectedPeriod);

  return (
    <MarketingTeamHub
      periods={periods}
      selectedPeriod={selectedPeriod}
      channelRows={channelRows}
      channelSource={channelSource}
    />
  );
}
