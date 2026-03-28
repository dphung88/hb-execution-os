import { FinanceTasksWorkspace } from "@/components/finance/finance-tasks-workspace";
import { loadFinanceTasks } from "@/lib/finance/tasks";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";

type Props = { searchParams?: Promise<{ period?: string; owner?: string; status?: string; saved?: string; error?: string }> };

export default async function FinanceTasksPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? getCurrentPeriod(periods);
  const { tasks, source } = await loadFinanceTasks(selectedPeriod);

  return (
    <FinanceTasksWorkspace
      tasks={tasks}
      source={source}
      periods={periods}
      selectedPeriod={selectedPeriod}
      searchParams={params}
    />
  );
}
