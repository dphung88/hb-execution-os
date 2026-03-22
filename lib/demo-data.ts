import type { TaskWithOwner } from "@/types/database";

export const demoStats = [
  { label: "Strategic priorities", value: "12", note: "+3 this week" },
  { label: "Execution on track", value: "87%", note: "Across Marketing and Sales" },
  { label: "Critical blockers", value: "2", note: "Needs executive intervention" },
  { label: "CEO briefing queue", value: "5", note: "3 ready for review today" }
];

export const demoTasks: TaskWithOwner[] = [
  {
    id: "demo-launch-plan",
    title: "Approve Q2 integrated launch plan",
    description:
      "Finalize media allocation, regional rollout timing, and executive talking points before Monday review.",
    status: "in_progress",
    priority: "critical",
    due_date: "2026-03-24",
    owner_user_id: "demo-owner-1",
    created_by: "demo-owner-1",
    created_at: "2026-03-20T08:00:00.000Z",
    updated_at: "2026-03-22T09:00:00.000Z",
    owner_name: "Minh Pham",
    owner_email: "minh@example.com"
  },
  {
    id: "demo-pipeline-cleanup",
    title: "Clean stalled enterprise pipeline",
    description:
      "Review 14 stuck deals, identify executive unblockers, and reset close dates for the weekly forecast.",
    status: "blocked",
    priority: "high",
    due_date: "2026-03-25",
    owner_user_id: "demo-owner-2",
    created_by: "demo-owner-2",
    created_at: "2026-03-19T06:30:00.000Z",
    updated_at: "2026-03-22T10:10:00.000Z",
    owner_name: "Thu Nguyen",
    owner_email: "thu@example.com"
  },
  {
    id: "demo-board-pack",
    title: "Prepare weekly CEO board packet",
    description:
      "Consolidate marketing wins, sales gaps, operational risks, and KPI commentary into a concise briefing deck.",
    status: "todo",
    priority: "critical",
    due_date: "2026-03-23",
    owner_user_id: "demo-owner-3",
    created_by: "demo-owner-3",
    created_at: "2026-03-21T03:20:00.000Z",
    updated_at: "2026-03-22T11:15:00.000Z",
    owner_name: "Lan Ho",
    owner_email: "lan@example.com"
  },
  {
    id: "demo-kpi-recovery",
    title: "Recover CAC variance in paid growth",
    description:
      "Identify campaign overspend drivers and propose a 14-day recovery plan for the COO dashboard.",
    status: "in_progress",
    priority: "high",
    due_date: "2026-03-27",
    owner_user_id: "demo-owner-4",
    created_by: "demo-owner-4",
    created_at: "2026-03-18T02:40:00.000Z",
    updated_at: "2026-03-22T12:00:00.000Z",
    owner_name: "Quang Tran",
    owner_email: "quang@example.com"
  }
];

export const demoSignals = [
  {
    label: "Marketing",
    value: "Launch readiness 91%",
    detail: "Creative, landing pages, and outbound assets are aligned for the April push."
  },
  {
    label: "Sales",
    value: "Forecast confidence 74%",
    detail: "Two enterprise deals need executive support before the Friday call."
  },
  {
    label: "CEO Office",
    value: "3 briefs awaiting approval",
    detail: "Board packet, regional update, and risk memo are staged for review."
  }
];

export const demoTimeline = [
  {
    time: "08:00",
    title: "Daily executive brief generated",
    detail: "Summary of blockers, KPI movement, and follow-ups sent to the VP inbox."
  },
  {
    time: "10:30",
    title: "Sales escalation created",
    detail: "Enterprise procurement issue tagged for leadership review."
  },
  {
    time: "14:00",
    title: "CEO presentation packet updated",
    detail: "Go-to-market talking points refreshed with this morning's pipeline changes."
  }
];

export const demoKpis = [
  {
    name: "Pipeline coverage",
    value: "3.4x",
    target: "Target 3.0x",
    status: "Ahead",
    trend: [52, 58, 61, 66, 73, 80, 84]
  },
  {
    name: "Marketing CAC",
    value: "$182",
    target: "Target <$175",
    status: "Watch",
    trend: [70, 68, 65, 63, 60, 58, 55]
  },
  {
    name: "CEO brief SLA",
    value: "92%",
    target: "Target 90%",
    status: "Healthy",
    trend: [40, 50, 56, 61, 72, 80, 92]
  }
];

export const demoExecutiveBrief = {
  title: "Monday CEO Brief",
  readiness: "Ready for review",
  summary:
    "Revenue momentum remains positive, but two enterprise approvals and paid CAC drift need executive attention before the board prep window closes.",
  bullets: [
    "Marketing launch readiness has reached 91% with landing pages, creative, and outbound assets aligned.",
    "Sales forecast confidence is still below target because two large deals are blocked in procurement.",
    "Board packet draft is on track, but KPI commentary needs final input from Operations by 16:00."
  ]
};

export const demoNotifications = [
  {
    title: "Critical task at risk",
    detail: "Board packet approval is due tomorrow and still missing Finance commentary.",
    tone: "critical"
  },
  {
    title: "New executive summary ready",
    detail: "Regional pipeline review has been converted into a CEO-ready summary.",
    tone: "info"
  },
  {
    title: "KPI moved to watch state",
    detail: "Paid CAC exceeded threshold for the third day in a row.",
    tone: "warning"
  }
];

export const demoStreams = [
  {
    team: "Marketing",
    headline: "Launch room locked for Q2 wave",
    metric: "91% ready",
    body: "Messaging, ad sets, and landing pages are aligned. Remaining gap is regional legal approval."
  },
  {
    team: "Sales",
    headline: "Enterprise forecast needs intervention",
    metric: "2 deals at risk",
    body: "Procurement friction is the main blocker. Leadership call suggested before Thursday."
  },
  {
    team: "CEO Office",
    headline: "Board packet approaching final state",
    metric: "3 briefs queued",
    body: "Weekly narrative is coherent; the final risk memo and KPI commentary are still pending."
  }
];
