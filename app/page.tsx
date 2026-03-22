import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  ChartNoAxesCombined,
  ClipboardCheck,
  ScanSearch,
  Sparkles
} from "lucide-react";

import { PreviewDashboard } from "@/components/preview/preview-dashboard";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: ClipboardCheck,
    title: "Execution management",
    description:
      "Turn team priorities into owned tasks, deadlines, and executive follow-through."
  },
  {
    icon: ScanSearch,
    title: "Document intelligence",
    description:
      "Prepare the platform for scanned files, AI summaries, and CEO-ready brief workflows."
  },
  {
    icon: BellRing,
    title: "Leadership alerts",
    description:
      "Surface the right escalation at the right time inside the app and, later, via WhatsApp."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel md:px-10 md:py-12">
          <div className="grid gap-10 xl:grid-cols-[1fr,0.72fr] xl:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-300">
                HB Execution OS
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
                The operating system for a VP running Marketing, Sales, and CEO support.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                See priorities, manage execution, prepare leadership briefings, and drive
                weekly momentum from one place instead of spreading it across chat, slides,
                and disconnected trackers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/preview">
                  <Button className="gap-2">
                    View product preview
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary">Open secure workspace</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm font-medium text-sky-300">Executive outcomes</p>
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-4xl font-semibold">1 view</p>
                  <p className="mt-2 text-sm text-slate-300">
                    For tasks, blockers, KPI movement, and CEO prep.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <ChartNoAxesCombined className="h-5 w-5 text-sky-300" />
                    <p className="mt-3 text-2xl font-semibold">87%</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                      execution on track
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <Sparkles className="h-5 w-5 text-sky-300" />
                    <p className="mt-3 text-2xl font-semibold">5</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                      briefs ready
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel"
            >
              <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-slate-900">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
            </div>
          ))}
        </section>

        <PreviewDashboard />
      </div>
    </main>
  );
}
