import { SalesTasksWorkspace } from "@/components/sales/sales-tasks-workspace";
import { loadSalesTasks } from "@/lib/sales/tasks";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";

type Props = {
  searchParams?: Promise<{
    period?: string;
    owner?: string;
    status?: string;
    saved?: string;
    error?: string;
  }>;
};

export default async function SalesTasksPage({ searchParams }: Props) {
  const params        = searchParams ? await searchParams : undefined;
  const periods       = await getPeriods();
  const selectedPeriod = params?.period ?? getCurrentPeriod(periods);
  const { tasks, source } = await loadSalesTasks(selectedPeriod);

  return (
    <SalesTasksWorkspace
      tasks={tasks}
      source={source}
      periods={periods}
      selectedPeriod={selectedPeriod}
      searchParams={params}
    />
  );
}
