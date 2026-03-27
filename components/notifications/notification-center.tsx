import { BellRing, ShieldAlert } from "lucide-react";

import { demoNotificationFeed, demoNotifications } from "@/lib/demo-data";

export function NotificationCenter() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-sky-300">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">
              Notification Center
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-4xl">Leadership alerts and follow-up stream</h1>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Priority stack</p>
              <h2 className="text-2xl font-semibold text-slate-900">Needs Attention Now</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {demoNotifications.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    {item.tone}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-panel">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Operational feed</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Inbox By Urgency</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {demoNotificationFeed.map((group) => (
              <div key={group.group} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {group.group}
                </p>
                <div className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
