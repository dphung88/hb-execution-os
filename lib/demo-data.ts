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

export const salesPeriods = [
  { label: "Apr 15 - May 14", key: "2026-04" },
  { label: "May 15 - Jun 14", key: "2026-05" }
] as const;

export const salesKpiProducts = {
  HB006: {
    code: "HB006",
    name: "Gluta White C/30V",
    target: 229,
    minPct: 0.8,
    category: "clearstock",
    hsd: "23/08/2026"
  },
  HB034: {
    code: "HB034",
    name: "HB Prenatal Support H/60V",
    target: 161,
    minPct: 0.8,
    category: "clearstock",
    hsd: "29/12/2027"
  },
  HB031: {
    code: "HB031",
    name: "HB CoQ10 150mg C/30V",
    target: 243,
    minPct: 0.5,
    category: "key",
    hsd: "28/01/2027"
  },
  HB035: {
    code: "HB035",
    name: "HB Collagen 1,2&3 C/120V",
    target: 203,
    minPct: 0.5,
    category: "key",
    hsd: "16/08/2027"
  }
} as const;

export const demoSalesAsms = [
  {
    id: "NV0494",
    name: "Ma Van Nam",
    region: "Phu Tho - Thai Nguyen - Vinh Phuc",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 510,
    newCustomersTarget: 10,
    newCustomersActual: 11,
    hb031: 132,
    hb035: 111,
    hb006: 205,
    hb034: 149,
    disciplineScore: 5,
    reportingScore: 5,
    managerNote: "Performance on track across the northern cluster. Reporting is timely and exception handling is clean."
  },
  {
    id: "NV0378",
    name: "Hoang Duc Khanh",
    region: "Hue - Da Nang - Quang Binh",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 452,
    newCustomersTarget: 10,
    newCustomersActual: 8,
    hb031: 125,
    hb035: 110,
    hb006: 189,
    hb034: 120,
    disciplineScore: 3,
    reportingScore: 3,
    managerNote: "Revenue is healthy, but clearstock on Prenatal still needs tighter field follow-through."
  },
  {
    id: "NV0461",
    name: "Pham Van Loc",
    region: "Can Tho - Hau Giang - Soc Trang",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 476,
    newCustomersTarget: 10,
    newCustomersActual: 7,
    hb031: 140,
    hb035: 118,
    hb006: 181,
    hb034: 141,
    disciplineScore: 5,
    reportingScore: 4,
    managerNote: "Southern territory is stable. Customer acquisition met threshold and team discipline is strong."
  },
  {
    id: "NV0487",
    name: "Nguyen Trong Dong",
    region: "Nghe An - Ha Tinh - Thanh Hoa",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 395,
    newCustomersTarget: 10,
    newCustomersActual: 5,
    hb031: 114,
    hb035: 94,
    hb006: 176,
    hb034: 130,
    disciplineScore: 3,
    reportingScore: 3,
    managerNote: "Coverage is acceptable, but Collagen sell-out is below the key-SKU threshold this cycle."
  },
  {
    id: "NV0484",
    name: "Tran Van Trieu",
    region: "An Giang - Dong Thap - Kien Giang",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 438,
    newCustomersTarget: 10,
    newCustomersActual: 6,
    hb031: 121,
    hb035: 104,
    hb006: 183,
    hb034: 138,
    disciplineScore: 5,
    reportingScore: 4,
    managerNote: "Execution is balanced, though the region still needs one more push on new-customer conversion."
  },
  {
    id: "NV0486",
    name: "Pham Huu Chat",
    region: "Ha Noi",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 548,
    newCustomersTarget: 10,
    newCustomersActual: 12,
    hb031: 156,
    hb035: 128,
    hb006: 210,
    hb034: 150,
    disciplineScore: 5,
    reportingScore: 5,
    managerNote: "One of the strongest ASM scorecards this cycle. All operating thresholds are comfortably above plan."
  },
  {
    id: "NV0485",
    name: "Nguyen Minh Hoang",
    region: "Gia Lai - Binh Dinh - Phu Yen",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 362,
    newCustomersTarget: 10,
    newCustomersActual: 4,
    hb031: 102,
    hb035: 88,
    hb006: 150,
    hb034: 119,
    disciplineScore: 3,
    reportingScore: 2,
    managerNote: "Region is under pressure. Revenue and key-SKU execution both need a focused recovery plan."
  },
  {
    id: "NV0491",
    name: "Doan Nang Duan",
    region: "Hai Phong - Quang Ninh - Hai Duong",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 488,
    newCustomersTarget: 10,
    newCustomersActual: 9,
    hb031: 137,
    hb035: 113,
    hb006: 196,
    hb034: 146,
    disciplineScore: 5,
    reportingScore: 4,
    managerNote: "Very solid cycle. This ASM is close to a full-mark operating profile and only missed one customer milestone."
  },
  {
    id: "NV0493",
    name: "Nguyen Hong Vinh",
    region: "Ha Noi",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 420,
    newCustomersTarget: 10,
    newCustomersActual: 7,
    hb031: 119,
    hb035: 102,
    hb006: 187,
    hb034: 136,
    disciplineScore: 5,
    reportingScore: 4,
    managerNote: "Healthy operating rhythm. Revenue is slightly behind, but the field indicators are stable."
  },
  {
    id: "NV0492",
    name: "Do Quy Phuong",
    region: "Ha Noi - Bac Ninh",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 505,
    newCustomersTarget: 10,
    newCustomersActual: 10,
    hb031: 133,
    hb035: 107,
    hb006: 193,
    hb034: 140,
    disciplineScore: 5,
    reportingScore: 5,
    managerNote: "Good conversion discipline and very dependable reporting. A strong example for the cluster."
  },
  {
    id: "NV0495",
    name: "Nguyen Bao Thanh Nha",
    region: "TP. Ho Chi Minh",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 470,
    newCustomersTarget: 10,
    newCustomersActual: 8,
    hb031: 128,
    hb035: 109,
    hb006: 184,
    hb034: 133,
    disciplineScore: 5,
    reportingScore: 4,
    managerNote: "Good commercial pace in HCMC, with one remaining gap around Prenatal clearstock."
  },
  {
    id: "NV0490",
    name: "Tran Thi Van",
    region: "TP. Ho Chi Minh",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 384,
    newCustomersTarget: 10,
    newCustomersActual: 5,
    hb031: 116,
    hb035: 90,
    hb006: 173,
    hb034: 126,
    disciplineScore: 3,
    reportingScore: 3,
    managerNote: "Needs recovery attention across revenue and Collagen execution. Reporting has improved but is not yet consistent."
  },
  {
    id: "NV0498",
    name: "Tran Van Trinh",
    region: "Bac Ninh - Bac Giang - Lang Son",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 446,
    newCustomersTarget: 10,
    newCustomersActual: 7,
    hb031: 124,
    hb035: 103,
    hb006: 182,
    hb034: 142,
    disciplineScore: 5,
    reportingScore: 4,
    managerNote: "Execution is trending well. This ASM should be able to close the cycle above 80 points with limited support."
  },
  {
    id: "NV0499",
    name: "Nguyen Dinh Huan",
    region: "Hai Phong - Hai Duong - Ninh Binh",
    manager: "Tran Thi Thanh Trang",
    periodKey: "2026-05",
    revenueTarget: 500,
    revenueActual: 533,
    newCustomersTarget: 10,
    newCustomersActual: 12,
    hb031: 149,
    hb035: 121,
    hb006: 214,
    hb034: 153,
    disciplineScore: 5,
    reportingScore: 5,
    managerNote: "Top-tier cycle. Revenue, customer growth, and both SKU clusters are all materially above the threshold."
  }
];

export const salesScoringRules = [
  {
    name: "3.1 Revenue achievement",
    description: "ERP provides target vs actual revenue. Scoring follows the real ladder: 100%=65, 90%=62, 80%=55, 70%=49, 60%=39, 50%=33.",
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
    description: "Requires both key SKUs to reach at least 50 percent of target: HB031=243 and HB035=203.",
    score: "5 pts",
    source: "ERP API"
  },
  {
    name: "3.4 Clearstock",
    description: "Evaluated on ERP sell-out/clearstock movement against threshold: HB006=229 and HB034=161, with 80 percent needed.",
    score: "10 pts",
    source: "ERP API"
  },
  {
    name: "3.5 Discipline and reporting",
    description: "Manager enters the discipline KPI and qualitative reporting review after the weekly check-in.",
    score: "5 pts + notes",
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
