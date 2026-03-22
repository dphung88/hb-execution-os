import { Mic, NotebookTabs } from "lucide-react";

import { demoMeetingInsight } from "@/lib/demo-data";

export function MeetingIntelligence() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-sky-300">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
              Meeting Intelligence
            </p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight">{demoMeetingInsight.title}</h1>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <p className="text-sm font-medium text-brand-700">Transcript summary</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{demoMeetingInsight.duration}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{demoMeetingInsight.summary}</p>

          <div className="mt-6 space-y-4">
            {demoMeetingInsight.transcriptMoments.map((moment) => (
              <div key={moment.quote} className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {moment.speaker}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{moment.quote}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <NotebookTabs className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Action extraction</p>
              <h2 className="text-2xl font-semibold text-slate-900">Meeting to tasks</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {demoMeetingInsight.actionItems.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
