export type MarketingKpiMetricTemplate = {
  id: string;
  name: string;
  target: number;
  unit: string;
  scoreType:
    | "digital_revenue_50"
    | "ten_point_50_90"
    | "five_point_content_output"
    | "five_point_content_quality"
    | "five_point_ad_content"
    | "five_point_project_60_80_100"
    | "graphic_fifteen"
    | "sales_ten";
  maxScore: number;
};

export type MarketingKpiSectionTemplate = {
  id: string;
  name: string;
  weightLabel: string;
  metrics: MarketingKpiMetricTemplate[];
};

export type MarketingRoleTemplate = {
  id: string;
  role: string;
  owner: string;
  payoutBase: number;
  sections: MarketingKpiSectionTemplate[];
};

export type MarketingManualInputs = Record<string, { target: number; actual: number }>;

function ratio(actual: number, target: number) {
  if (!target) return 0;
  return actual / target;
}

function asPercent(actual: number, target: number) {
  return ratio(actual, target) * 100;
}

export function computeMarketingMetricScore(
  scoreType: MarketingKpiMetricTemplate["scoreType"],
  actual: number,
  target: number,
) {
  const percent = asPercent(actual, target);

  switch (scoreType) {
    case "digital_revenue_50":
      if (percent < 50) return 0;
      if (percent <= 59) return 30;
      if (percent <= 69) return 35;
      if (percent <= 79) return 40;
      if (percent <= 89) return 45;
      if (percent < 100) return 45;
      return 50;
    case "ten_point_50_90":
      if (percent < 50) return 0;
      if (percent < 90) return 5;
      return 10;
    case "five_point_content_output":
      if (percent < 50) return 0;
      if (percent < 79) return 1;
      if (percent < 95) return 3;
      return 5;
    case "five_point_content_quality":
      if (percent < 50) return 0;
      if (percent < 69) return 1;
      if (percent < 90) return 3;
      return 5;
    case "five_point_ad_content":
      if (percent < 15) return 0;
      if (percent < 24) return 1;
      if (percent < 40) return 3;
      return 5;
    case "five_point_project_60_80_100":
      if (percent < 60) return 1;
      if (percent < 100) return percent >= 80 ? 3 : 1;
      return 5;
    case "graphic_fifteen":
      if (percent < 50) return 0;
      if (percent <= 59) return 3;
      if (percent <= 69) return 5;
      if (percent <= 89) return 10;
      return 15;
    case "sales_ten":
      if (percent < 50) return 0;
      if (percent <= 59) return 1;
      if (percent <= 69) return 3;
      if (percent <= 79) return 5;
      if (percent <= 89) return 9;
      if (percent < 100) return 9;
      return 10;
    default:
      return 0;
  }
}

function cloneSections(sections: MarketingKpiSectionTemplate[]): MarketingKpiSectionTemplate[] {
  return sections.map((section) => ({
    ...section,
    metrics: section.metrics.map((metric) => ({ ...metric })),
  }));
}

export const marketingRoleTemplates: MarketingRoleTemplate[] = [
  {
    id: "digital",
    role: "Digital Marketer",
    owner: "Digital Marketer",
    payoutBase: 21900000,
    sections: [
      {
        id: "digital-revenue",
        name: "A. Online Revenue",
        weightLabel: "50%",
        metrics: [
          { id: "online_revenue", name: "Online Revenue", target: 124605000, unit: "VND", scoreType: "digital_revenue_50", maxScore: 50 },
        ],
      },
      {
        id: "digital-traffic",
        name: "B. Ads Execution & Traffic",
        weightLabel: "20%",
        metrics: [
          { id: "roas", name: "ROAS / ROI", target: 2.5, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 10 },
          { id: "traffic", name: "Traffic", target: 30000, unit: "visits", scoreType: "ten_point_50_90", maxScore: 10 },
        ],
      },
      {
        id: "digital-content",
        name: "C. Content Production",
        weightLabel: "15%",
        metrics: [
          { id: "content_output", name: "Content Output", target: 30, unit: "items", scoreType: "five_point_content_output", maxScore: 5 },
          { id: "audience_growth", name: "Followers / Subscribers", target: 0.05, unit: "ratio", scoreType: "five_point_content_quality", maxScore: 5 },
          { id: "ad_content", name: "Ad Content", target: 0.4, unit: "ratio", scoreType: "five_point_ad_content", maxScore: 5 },
        ],
      },
      {
        id: "digital-projects",
        name: "D. Video, Reports, Ad-hoc",
        weightLabel: "15%",
        metrics: [
          { id: "video_creative", name: "Video Script & Creative", target: 1, unit: "project", scoreType: "five_point_project_60_80_100", maxScore: 5 },
          { id: "report", name: "Report", target: 1, unit: "report", scoreType: "five_point_project_60_80_100", maxScore: 5 },
          { id: "adhoc", name: "Ad-hoc", target: 1, unit: "task", scoreType: "five_point_project_60_80_100", maxScore: 5 },
        ],
      },
    ],
  },
  {
    id: "ecom",
    role: "E-Com Operations",
    owner: "E-Com Operations",
    payoutBase: 21900000,
    sections: cloneSections([
      {
        id: "digital-revenue",
        name: "A. Online Revenue",
        weightLabel: "50%",
        metrics: [
          { id: "online_revenue", name: "Online Revenue", target: 124605000, unit: "VND", scoreType: "digital_revenue_50", maxScore: 50 },
        ],
      },
      {
        id: "digital-traffic",
        name: "B. Ads Execution & Traffic",
        weightLabel: "20%",
        metrics: [
          { id: "roas", name: "ROAS / ROI", target: 2.5, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 10 },
          { id: "traffic", name: "Traffic", target: 30000, unit: "visits", scoreType: "ten_point_50_90", maxScore: 10 },
        ],
      },
      {
        id: "digital-content",
        name: "C. Content Production",
        weightLabel: "15%",
        metrics: [
          { id: "content_output", name: "Content Output", target: 30, unit: "items", scoreType: "five_point_content_output", maxScore: 5 },
          { id: "audience_growth", name: "Followers / Subscribers", target: 0.05, unit: "ratio", scoreType: "five_point_content_quality", maxScore: 5 },
          { id: "ad_content", name: "Ad Content", target: 0.4, unit: "ratio", scoreType: "five_point_ad_content", maxScore: 5 },
        ],
      },
      {
        id: "digital-projects",
        name: "D. Video, Reports, Ad-hoc",
        weightLabel: "15%",
        metrics: [
          { id: "video_creative", name: "Video Script & Creative", target: 1, unit: "project", scoreType: "five_point_project_60_80_100", maxScore: 5 },
          { id: "report", name: "Report", target: 1, unit: "report", scoreType: "five_point_project_60_80_100", maxScore: 5 },
          { id: "adhoc", name: "Ad-hoc", target: 1, unit: "task", scoreType: "five_point_project_60_80_100", maxScore: 5 },
        ],
      },
    ]),
  },
  {
    id: "graphic",
    role: "Graphic Designer",
    owner: "Graphic Designer",
    payoutBase: 10400000,
    sections: [
      {
        id: "graphic-core",
        name: "A. Graphic Design",
        weightLabel: "45%",
        metrics: [
          { id: "design_output", name: "Design Output", target: 0.95, unit: "ratio", scoreType: "graphic_fifteen", maxScore: 15 },
          { id: "design_quality", name: "Design Quality", target: 1, unit: "ratio", scoreType: "graphic_fifteen", maxScore: 15 },
          { id: "practical_use", name: "Practical Use", target: 1, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 10 },
          { id: "on_time", name: "On-time Delivery", target: 1, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 5 },
        ],
      },
      {
        id: "graphic-video",
        name: "B. Media / Video",
        weightLabel: "25%",
        metrics: [
          { id: "video_output", name: "Video Output", target: 0.95, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 10 },
          { id: "video_quality", name: "Video Quality", target: 0.9, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 10 },
          { id: "view_ctr", name: "View / Retention / CTR", target: 0.05, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 5 },
        ],
      },
      {
        id: "graphic-social",
        name: "C. Digital Post - Social",
        weightLabel: "10%",
        metrics: [
          { id: "post_output", name: "Post Output", target: 30, unit: "posts", scoreType: "ten_point_50_90", maxScore: 5 },
          { id: "platform_fit", name: "Platform Fit", target: 0.05, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 5 },
        ],
      },
      {
        id: "graphic-business",
        name: "D. Sales, Report, Ad-hoc",
        weightLabel: "20%",
        metrics: [
          { id: "online_gmv", name: "Online Channel GMV", target: 172585000, unit: "VND", scoreType: "sales_ten", maxScore: 10 },
          { id: "report", name: "Report", target: 1, unit: "report", scoreType: "five_point_project_60_80_100", maxScore: 5 },
          { id: "adhoc", name: "Ad-hoc", target: 1, unit: "task", scoreType: "five_point_project_60_80_100", maxScore: 5 },
        ],
      },
    ],
  },
  {
    id: "media",
    role: "Media Editor",
    owner: "Media Editor",
    payoutBase: 10400000,
    sections: cloneSections([
      {
        id: "graphic-core",
        name: "A. Graphic Design",
        weightLabel: "45%",
        metrics: [
          { id: "design_output", name: "Design Output", target: 0.95, unit: "ratio", scoreType: "graphic_fifteen", maxScore: 15 },
          { id: "design_quality", name: "Design Quality", target: 1, unit: "ratio", scoreType: "graphic_fifteen", maxScore: 15 },
          { id: "practical_use", name: "Practical Use", target: 1, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 10 },
          { id: "on_time", name: "On-time Delivery", target: 1, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 5 },
        ],
      },
      {
        id: "graphic-video",
        name: "B. Media / Video",
        weightLabel: "25%",
        metrics: [
          { id: "video_output", name: "Video Output", target: 0.95, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 10 },
          { id: "video_quality", name: "Video Quality", target: 0.9, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 10 },
          { id: "view_ctr", name: "View / Retention / CTR", target: 0.05, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 5 },
        ],
      },
      {
        id: "graphic-social",
        name: "C. Digital Post - Social",
        weightLabel: "10%",
        metrics: [
          { id: "post_output", name: "Post Output", target: 30, unit: "posts", scoreType: "ten_point_50_90", maxScore: 5 },
          { id: "platform_fit", name: "Platform Fit", target: 0.05, unit: "ratio", scoreType: "ten_point_50_90", maxScore: 5 },
        ],
      },
      {
        id: "graphic-business",
        name: "D. Sales, Report, Ad-hoc",
        weightLabel: "20%",
        metrics: [
          { id: "online_gmv", name: "Online Channel GMV", target: 172585000, unit: "VND", scoreType: "sales_ten", maxScore: 10 },
          { id: "report", name: "Report", target: 1, unit: "report", scoreType: "five_point_project_60_80_100", maxScore: 5 },
          { id: "adhoc", name: "Ad-hoc", target: 1, unit: "task", scoreType: "five_point_project_60_80_100", maxScore: 5 },
        ],
      },
    ]),
  },
];

export function getDefaultMarketingManualInputs() {
  const defaults: MarketingManualInputs = {};

  for (const role of marketingRoleTemplates) {
    for (const section of role.sections) {
      for (const metric of section.metrics) {
        defaults[`${role.id}:${metric.id}`] = {
          target: metric.target,
          actual: 0,
        };
      }
    }
  }

  return defaults;
}
