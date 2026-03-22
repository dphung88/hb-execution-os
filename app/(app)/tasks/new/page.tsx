import Link from "next/link";

import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { getViewerContext } from "@/lib/tasks/queries";

export default async function NewTaskPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const viewer = await getViewerContext();
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/tasks" className="text-sm font-medium text-brand-700">
          Back to tasks
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Create task</h1>
        <p className="mt-2 text-sm text-slate-500">
          Add a new execution item for your team.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      {viewer.user ? (
        <TaskForm />
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 shadow-panel">
          <h2 className="text-xl font-semibold text-slate-900">Create task is locked in preview mode</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            The public view is open for browsing only. Sign in with your Supabase account to create
            and manage live tasks.
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button>Go to login</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
