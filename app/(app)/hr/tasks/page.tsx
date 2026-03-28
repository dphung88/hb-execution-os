import { HrTasksWorkspace } from "@/components/hr/hr-tasks-workspace";
import { loadHrTasks } from "@/lib/hr/tasks";
import { getPeriods, getCurrentPeriod } from "@/lib/config/periods";

type Props = { searchParams?: Promise<{ period?: string; owner?: string; status?: string; saved?: string; error?: string }> };

export default async function HrTasksPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined;
  const periods = await getPeriods();
  const selectedPeriod = params?.period ?? getCurrentPeriod(periods);
  const { tasks, source } = await loadHrTasks(selectedPeriod);

  return (
    <HrTasksWorkspace
      tasks={tasks}
      source={source}
      periods={periods}
      selectedPeriod={selectedPeriod}
      searchParams={params}
    />
  );
}
