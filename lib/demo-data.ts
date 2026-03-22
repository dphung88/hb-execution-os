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
