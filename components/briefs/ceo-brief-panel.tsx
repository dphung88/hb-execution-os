import { FileStack, Sparkles } from "lucide-react";

import { demoExecutiveBrief } from "@/lib/demo-data";

export function CeoBriefPanel() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-sky-300">
            <FileStack className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">
              CEO Brief
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-4xl">{demoExecutiveBrief.title}</h1>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Executive narrative</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{demoExecutiveBrief.readiness}</h2>

          <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
            <p className="text-base leading-7 text-slate-200">{demoExecutiveBrief.summary}</p>
            <div className="mt-5 space-y-3">
              {demoExecutiveBrief.bullets.map((bullet) => (
                <div key={bullet} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-fuchsia-100 p-3 text-fuchsia-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Presentation notes</p>
              <h2 className="text-2xl font-semibold text-slate-900">Ready To Speak From</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
            <p>Use this screen as the final leadership handoff layer before presenting to the CEO.</p>
            <p>It condenses multi-team context into a one-minute operating narrative and a small set of executive asks.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
