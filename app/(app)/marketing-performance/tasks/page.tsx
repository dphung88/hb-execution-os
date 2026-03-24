import { MarketingTasksWorkspace } from "@/components/marketing/marketing-tasks-workspace";

type MarketingTasksPageProps = {
  searchParams?: Promise<{
    owner?: string;
    status?: string;
    requester?: string;
  }>;
};

export default async function MarketingTasksPage({ searchParams }: MarketingTasksPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return <MarketingTasksWorkspace searchParams={resolvedSearchParams} />;
}
