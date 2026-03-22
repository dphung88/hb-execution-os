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

export const demoDepartmentBoards = [
  {
    name: "Marketing",
    health: "Strong",
    owner: "Lan Ho",
    highlight: "Launch readiness is 91% with execution concentrated on regional approvals.",
    items: [
      "Creative and landing page system approved",
      "Paid CAC drift flagged for daily review",
      "Regional legal sign-off pending"
    ]
  },
  {
    name: "Sales",
    health: "Watch",
    owner: "Thu Nguyen",
    highlight: "Forecast is healthy overall, but two enterprise deals still need executive unblockers.",
    items: [
      "2 enterprise deals in procurement delay",
      "Pipeline coverage above target",
      "Weekly forecast confidence below COO threshold"
    ]
  },
  {
    name: "CEO Office",
    health: "Active",
    owner: "Minh Pham",
    highlight: "Board packet, regional update, and KPI narrative are all moving toward CEO-ready state.",
    items: [
      "3 briefs staged for review",
      "Risk memo needs final finance comment",
      "Monday board packet draft nearly complete"
    ]
  }
];

export const demoMeetingInsight = {
  title: "Weekly Revenue Sync",
  duration: "48 min recording",
  summary:
    "The team aligned on Q2 launch timing, identified two sales blockers, and agreed to escalate CAC correction actions by tomorrow morning.",
  transcriptMoments: [
    {
      speaker: "VP",
      quote: "We need procurement unblockers before Friday or the forecast slips."
    },
    {
      speaker: "Marketing Lead",
      quote: "Paid CAC is improving, but not fast enough to hit the board threshold."
    },
    {
      speaker: "CEO Office",
      quote: "I need the final risk framing by 4 PM for the packet."
    }
  ],
  actionItems: [
    "Escalate enterprise procurement issue to leadership",
    "Draft 14-day CAC recovery actions",
    "Finalize board packet risk section by 16:00"
  ]
};

export const demoNotificationFeed = [
  {
    group: "Urgent",
    items: [
      "Board packet approval overdue by 6 hours",
      "Enterprise deal blocker escalated to VP",
      "CAC threshold breached for the third consecutive day"
    ]
  },
  {
    group: "Today",
    items: [
      "Daily executive brief generated at 08:00",
      "Meeting transcript summarized into action items",
      "Regional update brief moved to review state"
    ]
  }
];

export const demoSalesAsms = [
  {
    id: "ASM-HCM-01",
    name: "Nguyen Thanh Ha",
    region: "Ho Chi Minh City",
    manager: "Tran Thi Mai",
    revenueTarget: 520,
    revenueActual: 468,
    newCustomersTarget: 10,
    newCustomersActual: 8,
    keySkuTarget: 50,
    hb031: 61,
    hb035: 54,
    clearstockTarget: 80,
    hb006: 72,
    hb034: 68,
    disciplineScore: 5,
    reportingScore: 4,
    managerNote: "Strong field execution. Needs tighter follow-up on Prenatal clearstock conversion."
  },
  {
    id: "ASM-DN-02",
    name: "Le Minh Quan",
    region: "Da Nang",
    manager: "Tran Thi Mai",
    revenueTarget: 480,
    revenueActual: 402,
    newCustomersTarget: 10,
    newCustomersActual: 6,
    keySkuTarget: 50,
    hb031: 47,
    hb035: 51,
    clearstockTarget: 80,
    hb006: 61,
    hb034: 55,
    disciplineScore: 3,
    reportingScore: 3,
    managerNote: "Commercially stable, but weekly reporting quality is inconsistent."
  },
  {
    id: "ASM-HN-03",
    name: "Pham Gia Linh",
    region: "Ha Noi",
    manager: "Do Huu Duc",
    revenueTarget: 560,
    revenueActual: 538,
    newCustomersTarget: 10,
    newCustomersActual: 11,
    keySkuTarget: 50,
    hb031: 58,
    hb035: 62,
    clearstockTarget: 80,
    hb006: 81,
    hb034: 78,
    disciplineScore: 5,
    reportingScore: 5,
    managerNote: "Top performer this cycle. Candidate for best-practice replication across the region."
  }
];

export const salesScoringRules = [
  {
    name: "3.1 Revenue achievement",
    description: "ERP provides target vs actual revenue. Score is tiered by achievement percentage.",
    score: "65 pts",
    source: "ERP API"
  },
  {
    name: "3.2 New customers",
    description: "Pulled from ERP/CRM sales activity and mapped to ASM by period.",
    score: "15 pts",
    source: "ERP API"
  },
  {
    name: "3.3 Key SKU sell-out",
    description: "Requires both key SKUs to reach at least 50 percent of target.",
    score: "5 pts",
    source: "ERP API"
  },
  {
    name: "3.4 Clearstock",
    description: "Evaluated on ERP sell-out/clearstock movement against threshold.",
    score: "10 pts",
    source: "ERP API"
  },
  {
    name: "3.5 Discipline and reporting",
    description: "Manager enters soft KPI results after weekly review and compliance check.",
    score: "5 + manager review",
    source: "Manager input"
  }
];

export const demoErpPipeline = [
  {
    step: "ERP pulls commercial data",
    detail: "Revenue, SKU, customer, and stock movement are fetched by ASM and period."
  },
  {
    step: "Scorecard engine normalizes data",
    detail: "Each metric is mapped into KPI scorecard items with targets, actuals, and calculation snapshots."
  },
  {
    step: "Manager reviews soft KPIs",
    detail: "The manager adds discipline, reporting quality, and context notes before finalization."
  },
  {
    step: "Dashboard publishes payout view",
    detail: "VP sees total score, payout estimate, underperformers, and review completion in one screen."
  }
];
