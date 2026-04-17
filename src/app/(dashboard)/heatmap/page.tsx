"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Grid3X3,
  Filter,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STATE_STYLES,
  type InitiativeState,
  type InitiativeListItem,
} from "@/lib/types/initiative";
import { api } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CellStatus = "green" | "amber" | "red" | "gray";
type Trend = "up" | "down" | "flat";

interface HeatmapCell {
  status: CellStatus;
  trend: Trend;
  value: string;
  previousValue: string;
  changePercent: number;
}

interface HeatmapInitiative {
  id: number;
  name: string;
  state: InitiativeState;
  workstream: string;
  kpis: Record<string, HeatmapCell>;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<CellStatus, { bg: string; bgMuted: string; text: string }> = {
  green:  { bg: "#22c55e", bgMuted: "rgba(34,197,94,0.12)",  text: "#15803d" },
  amber:  { bg: "#eab308", bgMuted: "rgba(234,179,8,0.12)",  text: "#a16207" },
  red:    { bg: "#ef4444", bgMuted: "rgba(239,68,68,0.12)",   text: "#b91c1c" },
  gray:   { bg: "#9ca3af", bgMuted: "rgba(156,163,175,0.08)", text: "#6b7280" },
};

// ---------------------------------------------------------------------------
// KPI definitions
// ---------------------------------------------------------------------------

const KPIS = [
  "Revenue Growth",
  "Cost Reduction",
  "Customer Satisfaction",
  "Process Efficiency",
  "Employee Engagement",
  "Time to Market",
  "Quality Score",
  "ROI",
] as const;

type KPIName = (typeof KPIS)[number];

// ---------------------------------------------------------------------------
// Demo data generator
// ---------------------------------------------------------------------------

function cell(
  status: CellStatus,
  trend: Trend,
  value: string,
  previousValue: string,
  changePercent: number
): HeatmapCell {
  return { status, trend, value, previousValue, changePercent };
}

const DEMO_KPI_SETS: Record<string, HeatmapCell>[] = [
  {
    "Revenue Growth":          cell("green", "up",   "+12.4%", "+8.1%",   53.1),
    "Cost Reduction":          cell("green", "up",   "-18.2%", "-12.5%",  45.6),
    "Customer Satisfaction":   cell("green", "up",   "92/100", "85/100",  8.2),
    "Process Efficiency":      cell("amber", "flat", "78%",    "76%",     2.6),
    "Employee Engagement":     cell("green", "up",   "4.3/5",  "3.9/5",  10.3),
    "Time to Market":          cell("green", "up",   "12 days","18 days", -33.3),
    "Quality Score":           cell("green", "up",   "96%",    "91%",     5.5),
    "ROI":                     cell("green", "up",   "340%",   "280%",    21.4),
  },
  {
    "Revenue Growth":          cell("amber", "flat", "+3.1%",  "+2.8%",   10.7),
    "Cost Reduction":          cell("green", "up",   "-22.5%", "-15.0%",  50.0),
    "Customer Satisfaction":   cell("amber", "flat", "80/100", "79/100",  1.3),
    "Process Efficiency":      cell("green", "up",   "89%",    "72%",     23.6),
    "Employee Engagement":     cell("red",   "down", "3.1/5",  "3.6/5",  -13.9),
    "Time to Market":          cell("green", "up",   "8 days", "14 days", -42.9),
    "Quality Score":           cell("amber", "flat", "88%",    "87%",     1.1),
    "ROI":                     cell("green", "up",   "215%",   "160%",    34.4),
  },
  {
    "Revenue Growth":          cell("green", "up",   "+8.7%",  "+5.2%",   67.3),
    "Cost Reduction":          cell("amber", "flat", "-4.2%",  "-3.8%",   10.5),
    "Customer Satisfaction":   cell("green", "up",   "94/100", "82/100",  14.6),
    "Process Efficiency":      cell("amber", "flat", "71%",    "69%",     2.9),
    "Employee Engagement":     cell("green", "up",   "4.1/5",  "3.7/5",  10.8),
    "Time to Market":          cell("red",   "down", "28 days","22 days", 27.3),
    "Quality Score":           cell("green", "up",   "91%",    "86%",     5.8),
    "ROI":                     cell("amber", "flat", "145%",   "140%",    3.6),
  },
  {
    "Revenue Growth":          cell("gray",  "flat", "N/A",    "N/A",     0),
    "Cost Reduction":          cell("red",   "down", "+5.1%",  "-2.0%",  -355.0),
    "Customer Satisfaction":   cell("green", "up",   "88/100", "81/100",  8.6),
    "Process Efficiency":      cell("red",   "down", "52%",    "58%",    -10.3),
    "Employee Engagement":     cell("green", "up",   "4.5/5",  "3.8/5",  18.4),
    "Time to Market":          cell("amber", "flat", "45 days","42 days", 7.1),
    "Quality Score":           cell("amber", "flat", "82%",    "80%",     2.5),
    "ROI":                     cell("red",   "down", "45%",    "80%",    -43.8),
  },
  {
    "Revenue Growth":          cell("green", "up",   "+15.3%", "+9.0%",   70.0),
    "Cost Reduction":          cell("green", "up",   "-12.8%", "-8.5%",   50.6),
    "Customer Satisfaction":   cell("amber", "flat", "83/100", "82/100",  1.2),
    "Process Efficiency":      cell("green", "up",   "94%",    "78%",     20.5),
    "Employee Engagement":     cell("amber", "flat", "3.8/5",  "3.7/5",  2.7),
    "Time to Market":          cell("green", "up",   "5 days", "11 days", -54.5),
    "Quality Score":           cell("green", "up",   "97%",    "90%",     7.8),
    "ROI":                     cell("green", "up",   "420%",   "310%",    35.5),
  },
  {
    "Revenue Growth":          cell("gray",  "flat", "N/A",    "N/A",     0),
    "Cost Reduction":          cell("amber", "flat", "-3.0%",  "-2.5%",   20.0),
    "Customer Satisfaction":   cell("gray",  "flat", "N/A",    "N/A",     0),
    "Process Efficiency":      cell("amber", "flat", "68%",    "66%",     3.0),
    "Employee Engagement":     cell("green", "up",   "4.7/5",  "3.5/5",  34.3),
    "Time to Market":          cell("green", "up",   "15 days","20 days", -25.0),
    "Quality Score":           cell("amber", "flat", "85%",    "83%",     2.4),
    "ROI":                     cell("amber", "flat", "110%",   "105%",    4.8),
  },
  {
    "Revenue Growth":          cell("green", "up",   "+22.1%", "+14.0%",  57.9),
    "Cost Reduction":          cell("red",   "down", "+8.3%",  "+2.0%",   315.0),
    "Customer Satisfaction":   cell("amber", "flat", "76/100", "75/100",  1.3),
    "Process Efficiency":      cell("red",   "down", "55%",    "62%",    -11.3),
    "Employee Engagement":     cell("amber", "flat", "3.6/5",  "3.5/5",  2.9),
    "Time to Market":          cell("red",   "down", "60 days","35 days", 71.4),
    "Quality Score":           cell("red",   "down", "72%",    "81%",    -11.1),
    "ROI":                     cell("amber", "flat", "85%",    "80%",     6.3),
  },
  {
    "Revenue Growth":          cell("gray",  "flat", "N/A",    "N/A",     0),
    "Cost Reduction":          cell("amber", "flat", "-6.0%",  "-5.5%",   9.1),
    "Customer Satisfaction":   cell("green", "up",   "90/100", "84/100",  7.1),
    "Process Efficiency":      cell("green", "up",   "86%",    "74%",     16.2),
    "Employee Engagement":     cell("amber", "flat", "3.7/5",  "3.6/5",  2.8),
    "Time to Market":          cell("amber", "flat", "20 days","19 days", 5.3),
    "Quality Score":           cell("green", "up",   "98%",    "92%",     6.5),
    "ROI":                     cell("green", "up",   "190%",   "140%",    35.7),
  },
  {
    "Revenue Growth":          cell("amber", "flat", "+2.5%",  "+2.2%",   13.6),
    "Cost Reduction":          cell("green", "up",   "-28.0%", "-18.0%",  55.6),
    "Customer Satisfaction":   cell("amber", "flat", "81/100", "80/100",  1.3),
    "Process Efficiency":      cell("green", "up",   "96%",    "82%",     17.1),
    "Employee Engagement":     cell("green", "up",   "4.0/5",  "3.4/5",  17.6),
    "Time to Market":          cell("green", "up",   "6 days", "12 days", -50.0),
    "Quality Score":           cell("green", "up",   "99%",    "93%",     6.5),
    "ROI":                     cell("green", "up",   "380%",   "290%",    31.0),
  },
  {
    "Revenue Growth":          cell("green", "up",   "+6.2%",  "+3.8%",   63.2),
    "Cost Reduction":          cell("green", "up",   "-9.5%",  "-6.0%",   58.3),
    "Customer Satisfaction":   cell("green", "up",   "91/100", "78/100",  16.7),
    "Process Efficiency":      cell("amber", "flat", "74%",    "72%",     2.8),
    "Employee Engagement":     cell("amber", "flat", "3.9/5",  "3.8/5",  2.6),
    "Time to Market":          cell("amber", "flat", "18 days","17 days", 5.9),
    "Quality Score":           cell("green", "up",   "90%",    "84%",     7.1),
    "ROI":                     cell("amber", "flat", "155%",   "148%",    4.7),
  },
  {
    "Revenue Growth":          cell("gray",  "flat", "N/A",    "N/A",     0),
    "Cost Reduction":          cell("amber", "flat", "-2.1%",  "-1.8%",   16.7),
    "Customer Satisfaction":   cell("green", "up",   "87/100", "80/100",  8.8),
    "Process Efficiency":      cell("amber", "flat", "63%",    "61%",     3.3),
    "Employee Engagement":     cell("green", "up",   "4.4/5",  "3.9/5",  12.8),
    "Time to Market":          cell("red",   "down", "50 days","30 days", 66.7),
    "Quality Score":           cell("amber", "flat", "84%",    "82%",     2.4),
    "ROI":                     cell("red",   "down", "60%",    "90%",    -33.3),
  },
  {
    "Revenue Growth":          cell("amber", "flat", "+1.8%",  "+1.5%",   20.0),
    "Cost Reduction":          cell("green", "up",   "-15.0%", "-9.0%",   66.7),
    "Customer Satisfaction":   cell("amber", "flat", "79/100", "78/100",  1.3),
    "Process Efficiency":      cell("green", "up",   "88%",    "75%",     17.3),
    "Employee Engagement":     cell("amber", "flat", "3.5/5",  "3.4/5",  2.9),
    "Time to Market":          cell("green", "up",   "10 days","16 days", -37.5),
    "Quality Score":           cell("green", "up",   "95%",    "88%",     8.0),
    "ROI":                     cell("green", "up",   "260%",   "190%",    36.8),
  },
  {
    "Revenue Growth":          cell("green", "up",   "+18.5%", "+10.0%",  85.0),
    "Cost Reduction":          cell("red",   "down", "+4.2%",  "+1.0%",   320.0),
    "Customer Satisfaction":   cell("amber", "flat", "77/100", "76/100",  1.3),
    "Process Efficiency":      cell("red",   "down", "58%",    "64%",    -9.4),
    "Employee Engagement":     cell("red",   "down", "3.0/5",  "3.5/5", -14.3),
    "Time to Market":          cell("red",   "down", "55 days","30 days", 83.3),
    "Quality Score":           cell("amber", "flat", "78%",    "77%",     1.3),
    "ROI":                     cell("red",   "down", "65%",    "95%",    -31.6),
  },
  {
    "Revenue Growth":          cell("gray",  "flat", "N/A",    "N/A",     0),
    "Cost Reduction":          cell("gray",  "flat", "N/A",    "N/A",     0),
    "Customer Satisfaction":   cell("gray",  "flat", "N/A",    "N/A",     0),
    "Process Efficiency":      cell("amber", "flat", "45%",    "42%",     7.1),
    "Employee Engagement":     cell("amber", "flat", "3.4/5",  "3.3/5",  3.0),
    "Time to Market":          cell("gray",  "flat", "N/A",    "N/A",     0),
    "Quality Score":           cell("red",   "down", "68%",    "74%",    -8.1),
    "ROI":                     cell("gray",  "flat", "N/A",    "N/A",     0),
  },
];

const DEMO_DATA: HeatmapInitiative[] = [
  { id: 1, name: "Digital Onboarding Platform", state: "executed", workstream: "Digital Transformation", kpis: DEMO_KPI_SETS[0] },
  { id: 2, name: "Supply Chain Automation", state: "planned", workstream: "Operational Excellence", kpis: DEMO_KPI_SETS[1] },
  { id: 3, name: "Customer 360 View", state: "viable", workstream: "Customer Experience", kpis: DEMO_KPI_SETS[2] },
  { id: 4, name: "Green Energy Transition", state: "initiative", workstream: "Sustainability", kpis: DEMO_KPI_SETS[3] },
  { id: 5, name: "AI-Powered Analytics", state: "validated", workstream: "Digital Transformation", kpis: DEMO_KPI_SETS[4] },
  { id: 6, name: "Employee Wellness Program", state: "execution_submitted", workstream: "People & Culture", kpis: DEMO_KPI_SETS[5] },
  { id: 7, name: "Market Expansion LATAM", state: "planned", workstream: "Growth", kpis: DEMO_KPI_SETS[6] },
  { id: 8, name: "Zero-Trust Security", state: "viable", workstream: "Digital Transformation", kpis: DEMO_KPI_SETS[7] },
  { id: 9, name: "Lean Manufacturing 2.0", state: "executed", workstream: "Operational Excellence", kpis: DEMO_KPI_SETS[8] },
  { id: 10, name: "Omnichannel Support Hub", state: "planning_submitted", workstream: "Customer Experience", kpis: DEMO_KPI_SETS[9] },
  { id: 11, name: "Carbon Footprint Tracker", state: "validation_submitted", workstream: "Sustainability", kpis: DEMO_KPI_SETS[10] },
  { id: 12, name: "Predictive Maintenance", state: "viable", workstream: "Operational Excellence", kpis: DEMO_KPI_SETS[11] },
  { id: 13, name: "Revenue Diversification", state: "submitted", workstream: "Growth", kpis: DEMO_KPI_SETS[12] },
  { id: 14, name: "Data Governance Framework", state: "draft", workstream: "Digital Transformation", kpis: DEMO_KPI_SETS[13] },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stateLabel(state: InitiativeState): string {
  return state
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function trendIcon(trend: Trend, status: CellStatus) {
  const color = STATUS_COLORS[status].text;
  const size = 12;
  switch (trend) {
    case "up":
      return <ArrowUpRight size={size} color={color} strokeWidth={2.5} />;
    case "down":
      return <ArrowDownRight size={size} color={color} strokeWidth={2.5} />;
    default:
      return <Minus size={size} color={color} strokeWidth={2.5} />;
  }
}

function percentGreen(cells: (HeatmapCell | undefined)[]): number {
  const valid = cells.filter(
    (c): c is HeatmapCell => c !== undefined && c.status !== "gray"
  );
  if (valid.length === 0) return 0;
  return Math.round(
    (valid.filter((c) => c.status === "green").length / valid.length) * 100
  );
}

function healthLabel(pct: number): { status: CellStatus; label: string } {
  if (pct >= 70) return { status: "green", label: "Healthy" };
  if (pct >= 40) return { status: "amber", label: "Mixed" };
  return { status: "red", label: "At Risk" };
}

/** Merge API initiative info with demo KPI data */
function mergeApiWithDemo(apiItems: InitiativeListItem[]): HeatmapInitiative[] {
  return apiItems.map((item, idx) => ({
    id: item.id,
    name: item.name,
    state: item.idea_state,
    workstream: item.workstream_name,
    kpis: DEMO_KPI_SETS[idx % DEMO_KPI_SETS.length],
  }));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HeatmapCellComponent({ cell: c, kpiName }: { cell: HeatmapCell; kpiName: string }) {
  const colors = STATUS_COLORS[c.status];
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <td
            className="relative cursor-default border-r border-b border-border/30 p-0 transition-all hover:brightness-95"
            style={{
              background: colors.bgMuted,
            }}
          >
            <div className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-2 py-2">
              <div className="flex items-center gap-0.5">
                {trendIcon(c.trend, c.status)}
                <span
                  className="text-[11px] font-semibold leading-none tabular-nums"
                  style={{ color: colors.text }}
                >
                  {c.value}
                </span>
              </div>
              <div
                className="h-1 w-5 rounded-full"
                style={{ background: colors.bg, opacity: 0.5 }}
              />
            </div>
          </td>
        }
      />
      <TooltipContent side="top" className="max-w-xs">
        <div className="flex flex-col gap-1 py-0.5">
          <span className="font-semibold">{kpiName}</span>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Current:</span>
            <span className="font-medium">{c.value}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Previous:</span>
            <span>{c.previousValue}</span>
          </div>
          {c.status !== "gray" && (
            <div className="flex justify-between gap-4">
              <span className="text-muted">Change:</span>
              <span
                className="font-medium"
                style={{
                  color:
                    c.changePercent > 0
                      ? STATUS_COLORS.green.text
                      : c.changePercent < 0
                        ? STATUS_COLORS.red.text
                        : STATUS_COLORS.amber.text,
                }}
              >
                {c.changePercent > 0 ? "+" : ""}
                {c.changePercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function SummaryCell({ pct }: { pct: number }) {
  const { status } = healthLabel(pct);
  const colors = STATUS_COLORS[status];
  return (
    <td
      className="border-r border-b border-border/30 p-0"
      style={{ background: colors.bgMuted }}
    >
      <div className="flex min-h-[52px] items-center justify-center">
        <span
          className="text-[11px] font-bold tabular-nums"
          style={{ color: colors.text }}
        >
          {pct}%
        </span>
      </div>
    </td>
  );
}

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

type SortDirection = "asc" | "desc" | null;

function sortValue(cell: HeatmapCell | undefined): number {
  if (!cell || cell.status === "gray") return -Infinity;
  const statusOrder: Record<CellStatus, number> = {
    green: 3,
    amber: 2,
    red: 1,
    gray: 0,
  };
  return statusOrder[cell.status] * 1000 + cell.changePercent;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function HeatmapPage() {
  const [workstreamFilter, setWorkstreamFilter] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [data, setData] = useState<HeatmapInitiative[]>(DEMO_DATA);
  const [workstreams, setWorkstreams] = useState<string[]>(
    Array.from(new Set(DEMO_DATA.map((i) => i.workstream))).sort()
  );
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch live initiative info from API
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await api.get<PaginatedResponse<InitiativeListItem>>(
          "/initiatives/?page_size=100"
        );

        if (cancelled) return;

        if (res.results && res.results.length > 0) {
          const merged = mergeApiWithDemo(res.results);
          setData(merged);

          const uniqueWs = Array.from(
            new Set(res.results.map((i) => i.workstream_name))
          ).sort();
          setWorkstreams(uniqueWs);
          setIsDemo(false);
        }
      } catch {
        // API unreachable - keep demo data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleSort = (kpi: string) => {
    if (sortColumn === kpi) {
      if (sortDir === "desc") setSortDir("asc");
      else if (sortDir === "asc") {
        setSortColumn(null);
        setSortDir(null);
      }
    } else {
      setSortColumn(kpi);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let items = data;
    if (workstreamFilter !== "all") {
      items = items.filter((i) => i.workstream === workstreamFilter);
    }
    if (sortColumn && sortDir) {
      const dir = sortDir === "desc" ? -1 : 1;
      items = [...items].sort(
        (a, b) =>
          dir * (sortValue(a.kpis[sortColumn]) - sortValue(b.kpis[sortColumn]))
      );
    }
    return items;
  }, [data, workstreamFilter, sortColumn, sortDir]);

  // Column-level summaries (% green across all filtered initiatives)
  const kpiSummaries = useMemo(
    () =>
      KPIS.map((kpi) => percentGreen(filtered.map((i) => i.kpis[kpi]))),
    [filtered]
  );

  // Row-level summaries (% green across all KPIs for each initiative)
  const rowSummaries = useMemo(
    () =>
      filtered.map((init) =>
        percentGreen(KPIS.map((kpi) => init.kpis[kpi]))
      ),
    [filtered]
  );

  // Overall portfolio health
  const overallHealth = useMemo(() => {
    const allCells = filtered.flatMap((i) =>
      KPIS.map((kpi) => i.kpis[kpi])
    );
    return percentGreen(allCells);
  }, [filtered]);

  const overallInfo = healthLabel(overallHealth);

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5 shadow-sm">
                <Grid3X3 className="h-5 w-5 text-foreground/70" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Performance Heatmap
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Initiative KPIs at a glance
                  {isDemo && (
                    <span className="ml-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      (demo data)
                    </span>
                  )}
                  {!isDemo && (
                    <span className="ml-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      (demo KPI values)
                    </span>
                  )}
                  {loading && (
                    <Loader2 className="inline-block ml-2 size-3.5 animate-spin text-muted-foreground" />
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="hidden items-center gap-3 rounded-lg border border-border/50 bg-card px-3 py-2 text-[11px] text-muted-foreground shadow-sm lg:flex">
              {(["green", "amber", "red", "gray"] as CellStatus[]).map(
                (s) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shadow-sm"
                      style={{ background: STATUS_COLORS[s].bg }}
                    />
                    {s === "green"
                      ? "On Target"
                      : s === "amber"
                        ? "At Risk"
                        : s === "red"
                          ? "Off Target"
                          : "No Data"}
                  </span>
                )
              )}
            </div>

            {/* Workstream filter */}
            <Select
              value={workstreamFilter}
              onValueChange={(v) => setWorkstreamFilter(v ?? "all")}
            >
              <SelectTrigger className="min-w-[180px] h-9 text-xs">
                <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Filter workstream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workstreams</SelectItem>
                {workstreams.map((ws) => (
                  <SelectItem key={ws} value={ws}>
                    {ws}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="shadow-sm border-border/50">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-xs font-medium text-muted-foreground">
                Initiatives
              </span>
              <span className="text-2xl font-bold tabular-nums">{filtered.length}</span>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-xs font-medium text-muted-foreground">
                Portfolio Health
              </span>
              <span
                className="text-2xl font-bold tabular-nums"
                style={{ color: STATUS_COLORS[overallInfo.status].text }}
              >
                {overallHealth}%
              </span>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-xs font-medium text-muted-foreground">
                Green Cells
              </span>
              <span className="text-2xl font-bold tabular-nums" style={{ color: STATUS_COLORS.green.text }}>
                {filtered.flatMap((i) => KPIS.map((k) => i.kpis[k])).filter((c) => c?.status === "green").length}
              </span>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-xs font-medium text-muted-foreground">
                Red Cells
              </span>
              <span className="text-2xl font-bold tabular-nums" style={{ color: STATUS_COLORS.red.text }}>
                {filtered.flatMap((i) => KPIS.map((k) => i.kpis[k])).filter((c) => c?.status === "red").length}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap grid */}
        <Card className="overflow-hidden shadow-md border-border/50">
          <CardHeader className="border-b border-border/40 pb-3">
            <CardTitle className="text-base font-semibold">
              Initiatives vs KPIs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                {/* Column headers */}
                <thead>
                  <tr>
                    {/* Empty corner cell */}
                    <th className="sticky left-0 z-20 min-w-[230px] border-r border-b border-border/40 bg-card px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                      Initiative
                    </th>
                    {KPIS.map((kpi) => (
                      <th
                        key={kpi}
                        className="group cursor-pointer border-r border-b border-border/40 bg-card p-0 transition-colors hover:bg-muted/50"
                        onClick={() => handleSort(kpi)}
                      >
                        <div className="flex h-[72px] w-[90px] items-end justify-center pb-2">
                          <div
                            className="flex origin-bottom-left items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-foreground/80"
                            style={{
                              transform: "rotate(-45deg)",
                              transformOrigin: "center center",
                            }}
                          >
                            {kpi}
                            {sortColumn === kpi ? (
                              sortDir === "desc" ? (
                                <ArrowDown size={10} />
                              ) : (
                                <ArrowUp size={10} />
                              )
                            ) : (
                              <ArrowUpDown
                                size={10}
                                className="opacity-0 transition-opacity group-hover:opacity-50"
                              />
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                    {/* Summary column header */}
                    <th className="border-b border-border/40 bg-muted/20 p-0">
                      <div className="flex h-[72px] w-[70px] items-end justify-center pb-2">
                        <div
                          className="whitespace-nowrap text-[11px] font-bold text-foreground/60"
                          style={{
                            transform: "rotate(-45deg)",
                            transformOrigin: "center center",
                          }}
                        >
                          Health
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((init, rowIdx) => {
                    const style = STATE_STYLES[init.state];
                    const rowHealth = rowSummaries[rowIdx];
                    const rowInfo = healthLabel(rowHealth);
                    return (
                      <tr
                        key={init.id}
                        className="transition-colors hover:bg-muted/15"
                      >
                        {/* Row header */}
                        <td className="sticky left-0 z-10 border-r border-b border-border/40 bg-card px-3 py-2">
                          <div className="flex flex-col gap-1">
                            <span className="max-w-[210px] truncate text-[12px] font-semibold leading-tight text-foreground">
                              {init.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                className="h-[18px] rounded px-1.5 text-[9px] font-semibold uppercase tracking-wider"
                                style={{
                                  background: style.background,
                                  color: style.text,
                                  borderColor: "transparent",
                                }}
                              >
                                {stateLabel(init.state)}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {init.workstream}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* KPI cells */}
                        {KPIS.map((kpi) => (
                          <HeatmapCellComponent
                            key={kpi}
                            cell={init.kpis[kpi]}
                            kpiName={kpi}
                          />
                        ))}

                        {/* Row summary */}
                        <td
                          className="border-b border-border/40 bg-muted/10 p-0"
                        >
                          <div className="flex min-h-[52px] flex-col items-center justify-center gap-0.5">
                            <span
                              className="text-[12px] font-bold tabular-nums"
                              style={{
                                color: STATUS_COLORS[rowInfo.status].text,
                              }}
                            >
                              {rowHealth}%
                            </span>
                            <span className="text-[9px] font-medium text-muted-foreground">
                              {rowInfo.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Summary row */}
                  <tr className="bg-muted/15">
                    <td className="sticky left-0 z-10 border-r border-border/40 bg-muted/20 px-3 py-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
                        KPI Health
                      </span>
                    </td>
                    {kpiSummaries.map((pct, i) => (
                      <SummaryCell key={KPIS[i]} pct={pct} />
                    ))}
                    {/* Overall corner */}
                    <td className="border-border/40 bg-muted/20 p-0">
                      <div className="flex min-h-[52px] flex-col items-center justify-center gap-0.5">
                        <span
                          className="text-[13px] font-extrabold tabular-nums"
                          style={{
                            color: STATUS_COLORS[overallInfo.status].text,
                          }}
                        >
                          {overallHealth}%
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground">
                          Overall
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
