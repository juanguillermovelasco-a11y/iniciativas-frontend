"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Filter,
  Diamond,
  Circle,
  Triangle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type InitiativeState,
  type InitiativeListItem,
  type MilestoneType,
  STATE_STYLES,
} from "@/lib/types/initiative";
import { api } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Milestone {
  type: MilestoneType;
  date: string; // ISO date
  label: string;
}

interface RoadmapInitiative {
  id: number;
  name: string;
  state: InitiativeState;
  workstream: string;
  start_date: string;
  end_date: string;
  lead: string;
  milestones: Milestone[];
}

type ZoomLevel = "quarter" | "year";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_WORKSTREAMS = [
  "Digital Transformation",
  "Operational Excellence",
  "Customer Experience",
  "Sustainability",
];

const DEMO_INITIATIVES: RoadmapInitiative[] = [
  // Digital Transformation
  {
    id: 1,
    name: "Cloud Migration Program",
    state: "viable",
    workstream: "Digital Transformation",
    start_date: "2025-01-15",
    end_date: "2025-09-30",
    lead: "A. Rivera",
    milestones: [
      { type: "implementation", date: "2025-04-15", label: "Phase 1 Go-Live" },
      { type: "behavior_change", date: "2025-06-01", label: "Team Adoption" },
      { type: "economic_impact_start", date: "2025-08-15", label: "Cost Savings Begin" },
    ],
  },
  {
    id: 2,
    name: "Data Lakehouse Architecture",
    state: "planned",
    workstream: "Digital Transformation",
    start_date: "2025-03-01",
    end_date: "2025-12-15",
    lead: "M. Chen",
    milestones: [
      { type: "implementation", date: "2025-07-01", label: "MVP Deployed" },
      { type: "behavior_change", date: "2025-09-15", label: "Analyst Onboarding" },
      { type: "economic_impact_start", date: "2025-11-01", label: "Revenue Insights" },
    ],
  },
  {
    id: 3,
    name: "AI-Powered Document Processing",
    state: "validated",
    workstream: "Digital Transformation",
    start_date: "2025-06-01",
    end_date: "2026-03-30",
    lead: "S. Patel",
    milestones: [
      { type: "implementation", date: "2025-10-01", label: "Pilot Launch" },
      { type: "behavior_change", date: "2025-12-15", label: "Process Redesign" },
      { type: "economic_impact_start", date: "2026-02-01", label: "FTE Savings" },
    ],
  },
  {
    id: 4,
    name: "API Gateway Modernization",
    state: "draft",
    workstream: "Digital Transformation",
    start_date: "2025-09-01",
    end_date: "2026-06-30",
    lead: "J. Kim",
    milestones: [
      { type: "implementation", date: "2026-01-15", label: "Gateway Live" },
      { type: "economic_impact_start", date: "2026-05-01", label: "Partner Revenue" },
    ],
  },
  // Operational Excellence
  {
    id: 5,
    name: "Lean Manufacturing Rollout",
    state: "viable",
    workstream: "Operational Excellence",
    start_date: "2025-02-01",
    end_date: "2025-11-30",
    lead: "R. Torres",
    milestones: [
      { type: "implementation", date: "2025-05-01", label: "Plant A Complete" },
      { type: "behavior_change", date: "2025-07-15", label: "Kaizen Culture" },
      { type: "economic_impact_start", date: "2025-09-01", label: "Waste Reduction" },
    ],
  },
  {
    id: 6,
    name: "Predictive Maintenance System",
    state: "planned",
    workstream: "Operational Excellence",
    start_date: "2025-04-15",
    end_date: "2026-01-31",
    lead: "L. Okafor",
    milestones: [
      { type: "implementation", date: "2025-08-01", label: "Sensors Installed" },
      { type: "behavior_change", date: "2025-10-15", label: "Ops Team Trained" },
      { type: "economic_impact_start", date: "2025-12-01", label: "Downtime Reduction" },
    ],
  },
  {
    id: 7,
    name: "Supply Chain Control Tower",
    state: "validated",
    workstream: "Operational Excellence",
    start_date: "2025-07-01",
    end_date: "2026-05-31",
    lead: "D. Nakamura",
    milestones: [
      { type: "implementation", date: "2025-11-15", label: "Dashboard Live" },
      { type: "economic_impact_start", date: "2026-03-01", label: "Inventory Savings" },
    ],
  },
  // Customer Experience
  {
    id: 8,
    name: "Omnichannel Platform",
    state: "viable",
    workstream: "Customer Experience",
    start_date: "2025-01-01",
    end_date: "2025-08-31",
    lead: "E. Johansson",
    milestones: [
      { type: "implementation", date: "2025-03-15", label: "Web + Mobile" },
      { type: "behavior_change", date: "2025-05-01", label: "Agent Training" },
      { type: "economic_impact_start", date: "2025-07-01", label: "NPS Improvement" },
    ],
  },
  {
    id: 9,
    name: "Customer 360 View",
    state: "planned",
    workstream: "Customer Experience",
    start_date: "2025-05-01",
    end_date: "2026-02-28",
    lead: "K. Andersen",
    milestones: [
      { type: "implementation", date: "2025-09-01", label: "CDP Integrated" },
      { type: "behavior_change", date: "2025-11-01", label: "Sales Enablement" },
      { type: "economic_impact_start", date: "2026-01-15", label: "Upsell Lift" },
    ],
  },
  {
    id: 10,
    name: "AI Chatbot v2",
    state: "draft",
    workstream: "Customer Experience",
    start_date: "2025-08-01",
    end_date: "2026-04-30",
    lead: "P. Nguyen",
    milestones: [
      { type: "implementation", date: "2025-12-01", label: "Bot Live" },
      { type: "behavior_change", date: "2026-02-01", label: "Deflection Targets" },
      { type: "economic_impact_start", date: "2026-03-15", label: "Support Savings" },
    ],
  },
  {
    id: 11,
    name: "Loyalty Program Redesign",
    state: "validated",
    workstream: "Customer Experience",
    start_date: "2025-10-01",
    end_date: "2026-08-31",
    lead: "C. Williams",
    milestones: [
      { type: "implementation", date: "2026-02-15", label: "Program Launch" },
      { type: "economic_impact_start", date: "2026-06-01", label: "Retention Lift" },
    ],
  },
  // Sustainability
  {
    id: 12,
    name: "Carbon Tracking Platform",
    state: "viable",
    workstream: "Sustainability",
    start_date: "2025-03-01",
    end_date: "2025-10-31",
    lead: "T. Bergman",
    milestones: [
      { type: "implementation", date: "2025-06-15", label: "Scope 1+2 Tracked" },
      { type: "behavior_change", date: "2025-08-01", label: "BU Reporting" },
      { type: "economic_impact_start", date: "2025-10-01", label: "Credit Savings" },
    ],
  },
  {
    id: 13,
    name: "Circular Packaging Initiative",
    state: "planned",
    workstream: "Sustainability",
    start_date: "2025-06-15",
    end_date: "2026-04-30",
    lead: "I. Muller",
    milestones: [
      { type: "implementation", date: "2025-10-01", label: "Supplier Switch" },
      { type: "behavior_change", date: "2025-12-15", label: "Line Retooling" },
      { type: "economic_impact_start", date: "2026-03-01", label: "Material Savings" },
    ],
  },
  {
    id: 14,
    name: "Net-Zero Fleet Transition",
    state: "draft",
    workstream: "Sustainability",
    start_date: "2025-09-01",
    end_date: "2026-09-30",
    lead: "F. Dubois",
    milestones: [
      { type: "implementation", date: "2026-03-01", label: "Pilot Vehicles" },
      { type: "economic_impact_start", date: "2026-07-01", label: "Fuel Savings" },
    ],
  },
  {
    id: 15,
    name: "Green Building Certification",
    state: "validated",
    workstream: "Sustainability",
    start_date: "2025-11-01",
    end_date: "2026-11-30",
    lead: "A. Singh",
    milestones: [
      { type: "implementation", date: "2026-04-01", label: "Audit Complete" },
      { type: "behavior_change", date: "2026-07-01", label: "Facility Ops" },
      { type: "economic_impact_start", date: "2026-09-15", label: "Energy Savings" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIMELINE_START = new Date("2025-01-01");
const TIMELINE_END = new Date("2026-12-31");
const TODAY = new Date("2026-04-16");

const STATE_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  initiative: "Initiative",
  rejected: "Rejected",
  validation_submitted: "Validation Submitted",
  validated: "Validated",
  viability_submitted: "Viability Submitted",
  viable: "Viable",
  planning_submitted: "Planning Submitted",
  planned: "Planned",
  execution_submitted: "Execution Submitted",
  executed: "Executed",
};

const MILESTONE_CONFIG: Record<
  MilestoneType,
  { icon: typeof Diamond; color: string; label: string }
> = {
  implementation: {
    icon: Diamond,
    color: "#6366f1",
    label: "Implementation",
  },
  behavior_change: {
    icon: Triangle,
    color: "#f59e0b",
    label: "Behavior Change",
  },
  economic_impact_start: {
    icon: Circle,
    color: "#10b981",
    label: "Economic Impact",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}

const TOTAL_DAYS = daysBetween(TIMELINE_START, TIMELINE_END);

function dateToPercent(dateStr: string): number {
  const d = new Date(dateStr);
  const offset = daysBetween(TIMELINE_START, d);
  return Math.max(0, Math.min(100, (offset / TOTAL_DAYS) * 100));
}

function todayPercent(): number {
  const offset = daysBetween(TIMELINE_START, TODAY);
  return Math.max(0, Math.min(100, (offset / TOTAL_DAYS) * 100));
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < TODAY;
}

function generateMonths(): { label: string; shortLabel: string; start: number; width: number }[] {
  const months: { label: string; shortLabel: string; start: number; width: number }[] = [];
  const d = new Date(TIMELINE_START);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const shortNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  while (d <= TIMELINE_END) {
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const start = dateToPercent(monthStart.toISOString().slice(0, 10));
    const end = dateToPercent(monthEnd.toISOString().slice(0, 10));

    months.push({
      label: `${monthNames[month]} ${year}`,
      shortLabel: `${shortNames[month]}`,
      start,
      width: end - start,
    });

    d.setMonth(d.getMonth() + 1);
  }
  return months;
}

function generateQuarters(): { label: string; start: number; width: number }[] {
  const quarters: { label: string; start: number; width: number }[] = [];
  const starts = [
    { y: 2025, q: 1, s: "2025-01-01", e: "2025-03-31" },
    { y: 2025, q: 2, s: "2025-04-01", e: "2025-06-30" },
    { y: 2025, q: 3, s: "2025-07-01", e: "2025-09-30" },
    { y: 2025, q: 4, s: "2025-10-01", e: "2025-12-31" },
    { y: 2026, q: 1, s: "2026-01-01", e: "2026-03-31" },
    { y: 2026, q: 2, s: "2026-04-01", e: "2026-06-30" },
    { y: 2026, q: 3, s: "2026-07-01", e: "2026-09-30" },
    { y: 2026, q: 4, s: "2026-10-01", e: "2026-12-31" },
  ];

  for (const q of starts) {
    const start = dateToPercent(q.s);
    const end = dateToPercent(q.e);
    quarters.push({
      label: `Q${q.q} ${q.y}`,
      start,
      width: end - start,
    });
  }
  return quarters;
}

/** Merge API initiative data with demo milestone/timeline data */
function mergeApiWithDemo(
  apiItems: InitiativeListItem[],
): RoadmapInitiative[] {
  return apiItems.map((item, idx) => {
    // Try to find a matching demo initiative to reuse its timeline
    const demoMatch = DEMO_INITIATIVES[idx % DEMO_INITIATIVES.length];
    return {
      id: item.id,
      name: item.name,
      state: item.idea_state,
      workstream: item.workstream_name,
      start_date: demoMatch.start_date,
      end_date: demoMatch.end_date,
      lead: item.lead_name,
      milestones: demoMatch.milestones,
    };
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MilestoneMarker({
  milestone,
  barLeft,
  barWidth,
}: {
  milestone: Milestone;
  barLeft: number;
  barWidth: number;
}) {
  const pos = dateToPercent(milestone.date);
  const relativePos = barWidth > 0 ? ((pos - barLeft) / barWidth) * 100 : 0;
  const config = MILESTONE_CONFIG[milestone.type];
  const Icon = config.icon;
  const overdue = isOverdue(milestone.date);

  return (
    <div
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 group/milestone"
      style={{ left: `${relativePos}%` }}
      title={`${milestone.label} (${milestone.date})${overdue ? " - OVERDUE" : ""}`}
    >
      <div className="relative">
        <Icon
          className="size-3.5 drop-shadow-sm"
          style={{
            color: overdue ? "#ef4444" : config.color,
            fill: overdue ? "#ef4444" : config.color,
          }}
          strokeWidth={overdue ? 2.5 : 2}
        />
        {overdue && (
          <div className="absolute -top-1 -right-1">
            <span className="flex size-1.5 rounded-full bg-red-500 animate-pulse" />
          </div>
        )}
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/milestone:block z-50">
        <div className="rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-xl ring-1 ring-foreground/10 whitespace-nowrap">
          <div className="font-semibold">{milestone.label}</div>
          <div className="text-muted-foreground mt-0.5 flex items-center gap-1">
            <Icon className="size-2.5" style={{ color: overdue ? "#ef4444" : config.color, fill: overdue ? "#ef4444" : config.color }} />
            {config.label}
            <span className="mx-0.5 text-border">|</span>
            {milestone.date}
          </div>
          {overdue && (
            <div className="text-red-500 font-semibold mt-1 flex items-center gap-1">
              <AlertCircle className="size-2.5" />
              Overdue
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InitiativeBar({ initiative }: { initiative: RoadmapInitiative }) {
  const style = STATE_STYLES[initiative.state];
  const left = dateToPercent(initiative.start_date);
  const right = dateToPercent(initiative.end_date);
  const width = right - left;

  const hasOverdue = initiative.milestones.some((m) => isOverdue(m.date));

  return (
    <div className="flex items-center gap-0 h-10 group/row">
      {/* Initiative label - fixed left column */}
      <div className="w-60 min-w-60 shrink-0 pr-3 flex items-center gap-2">
        <Badge
          className="shrink-0 text-[10px] px-1.5 py-0 h-[18px] font-semibold tracking-wide uppercase rounded"
          style={{ backgroundColor: style.background, color: style.text }}
        >
          {STATE_LABELS[initiative.state] ?? initiative.state}
        </Badge>
        <span
          className="text-xs font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
          title={initiative.name}
        >
          {initiative.name}
        </span>
      </div>

      {/* Timeline area */}
      <div className="flex-1 min-w-0 relative h-full flex items-center">
        {/* Bar */}
        <div
          className="absolute h-6 rounded-md cursor-pointer transition-all duration-200 hover:h-7 hover:shadow-lg group/bar"
          style={{
            left: `${left}%`,
            width: `${Math.max(width, 0.3)}%`,
            backgroundColor: style.background,
            opacity: 0.85,
          }}
        >
          {/* Bar label on hover */}
          <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
            <span
              className="text-[10px] font-medium truncate opacity-0 group-hover/bar:opacity-100 transition-opacity"
              style={{ color: style.text }}
            >
              {initiative.lead}
            </span>
          </div>

          {/* Milestones */}
          {initiative.milestones.map((m, i) => (
            <MilestoneMarker
              key={i}
              milestone={m}
              barLeft={left}
              barWidth={width}
            />
          ))}

          {/* Overdue glow */}
          {hasOverdue && (
            <div className="absolute inset-0 rounded-md ring-1 ring-red-500/40 pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}

function WorkstreamGroup({
  name,
  initiatives,
  defaultOpen = true,
}: {
  name: string;
  initiatives: RoadmapInitiative[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      {/* Group header */}
      <button
        className="flex items-center gap-0 w-full h-9 hover:bg-muted/50 transition-colors rounded-lg px-1"
        onClick={() => setOpen(!open)}
      >
        <div className="w-60 min-w-60 shrink-0 flex items-center gap-1.5 pl-1">
          {open ? (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground" />
          )}
          <span className="text-xs font-bold text-foreground tracking-tight">
            {name}
          </span>
          <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 h-4 rounded">
            {initiatives.length}
          </Badge>
        </div>
        <div className="flex-1" />
      </button>

      {/* Initiatives */}
      {open && (
        <div className="ml-3 border-l-2 border-border/40 pl-3 space-y-0.5 pb-3">
          {initiatives.map((init) => (
            <InitiativeBar key={init.id} initiative={init} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function RoadmapPage() {
  const [zoom, setZoom] = useState<ZoomLevel>("year");
  const [workstreamFilter, setWorkstreamFilter] = useState<string>("all");
  const [initiatives, setInitiatives] = useState<RoadmapInitiative[]>(DEMO_INITIATIVES);
  const [workstreams, setWorkstreams] = useState<string[]>(DEMO_WORKSTREAMS);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch live data from API
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
          setInitiatives(merged);

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

  const months = useMemo(() => generateMonths(), []);
  const quarters = useMemo(() => generateQuarters(), []);
  const todayLine = useMemo(() => todayPercent(), []);

  const grouped = useMemo(() => {
    const filtered =
      workstreamFilter === "all"
        ? initiatives
        : initiatives.filter((i) => i.workstream === workstreamFilter);

    const map = new Map<string, RoadmapInitiative[]>();
    for (const ws of workstreams) {
      const items = filtered.filter((i) => i.workstream === ws);
      if (items.length > 0) map.set(ws, items);
    }
    return map;
  }, [workstreamFilter, initiatives, workstreams]);

  const totalOverdue = initiatives.reduce(
    (acc, i) => acc + i.milestones.filter((m) => isOverdue(m.date)).length,
    0
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Portfolio Roadmap
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Timeline view across {initiatives.length} initiatives
            {isDemo && (
              <span className="ml-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                (demo data)
              </span>
            )}
            {!isDemo && (
              <span className="ml-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                (demo timeline)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Loading indicator */}
          {loading && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}

          {/* Overdue indicator */}
          {totalOverdue > 0 && (
            <Badge variant="destructive" className="gap-1 font-semibold shadow-sm">
              <AlertCircle className="size-3" />
              {totalOverdue} overdue
            </Badge>
          )}

          {/* Workstream filter */}
          <Select value={workstreamFilter} onValueChange={(v) => setWorkstreamFilter(v ?? "all")}>
            <SelectTrigger className="min-w-[180px] h-9 text-xs">
              <Filter className="size-3.5 text-muted-foreground mr-1.5" />
              <SelectValue />
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

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-border bg-card overflow-hidden shadow-sm">
            <Button
              variant={zoom === "quarter" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none border-0 px-3 text-xs h-9"
              onClick={() => setZoom("quarter")}
            >
              <ZoomIn className="size-3.5 mr-1.5" />
              Quarter
            </Button>
            <div className="w-px h-5 bg-border" />
            <Button
              variant={zoom === "year" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none border-0 px-3 text-xs h-9"
              onClick={() => setZoom("year")}
            >
              <ZoomOut className="size-3.5 mr-1.5" />
              Year
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground rounded-lg border border-border/60 bg-card px-4 py-2.5 shadow-sm">
        <span className="font-semibold text-foreground text-xs">Milestones:</span>
        {(Object.entries(MILESTONE_CONFIG) as [MilestoneType, typeof MILESTONE_CONFIG[MilestoneType]][]).map(
          ([key, config]) => {
            const Icon = config.icon;
            return (
              <span key={key} className="flex items-center gap-1.5">
                <Icon className="size-3" style={{ color: config.color, fill: config.color }} />
                {config.label}
              </span>
            );
          }
        )}
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500 inline-block" />
          Overdue
        </span>
      </div>

      {/* Timeline Card */}
      <Card className="overflow-hidden shadow-md border-border/60">
        <CardHeader className="pb-0 border-b border-border/30">
          <CardTitle className="text-base font-semibold">
            Initiative Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-4 px-0">
          <div className="overflow-x-auto">
            <div
              style={{ minWidth: zoom === "quarter" ? "1600px" : "1100px" }}
            >
              {/* Time axis header */}
              <div className="flex items-end sticky top-0 bg-card z-20 border-b border-border">
                {/* Label spacer */}
                <div className="w-60 min-w-60 shrink-0" />

                {/* Axis */}
                <div className="flex-1 relative">
                  {/* Year labels */}
                  <div className="flex h-6 items-center">
                    {[2025, 2026].map((year) => {
                      const start = dateToPercent(`${year}-01-01`);
                      const end = dateToPercent(`${year}-12-31`);
                      return (
                        <div
                          key={year}
                          className="absolute text-xs font-bold text-foreground"
                          style={{
                            left: `${start}%`,
                            width: `${end - start}%`,
                            textAlign: "center",
                          }}
                        >
                          {year}
                        </div>
                      );
                    })}
                  </div>

                  {/* Month / Quarter labels */}
                  <div className="flex h-7 items-center relative border-t border-border/50">
                    {zoom === "year"
                      ? months.map((m, i) => (
                          <div
                            key={i}
                            className="absolute text-[10px] text-muted-foreground text-center select-none"
                            style={{
                              left: `${m.start}%`,
                              width: `${m.width}%`,
                            }}
                          >
                            {m.shortLabel}
                          </div>
                        ))
                      : quarters.map((q, i) => (
                          <div
                            key={i}
                            className="absolute text-[10px] font-semibold text-muted-foreground text-center select-none"
                            style={{
                              left: `${q.start}%`,
                              width: `${q.width}%`,
                            }}
                          >
                            {q.label}
                          </div>
                        ))}
                  </div>
                </div>
              </div>

              {/* Grid body */}
              <div className="relative px-4 pt-3">
                {/* Vertical grid lines */}
                <div className="absolute inset-0 pointer-events-none" style={{ left: "15rem" }}>
                  {(zoom === "year" ? months : quarters).map((item, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-border/20"
                      style={{ left: `${item.start}%` }}
                    />
                  ))}
                </div>

                {/* Today line in each row's timeline area */}
                <div className="relative">
                  {/* Workstream groups */}
                  <div className="space-y-1">
                    {Array.from(grouped.entries()).map(([ws, items]) => (
                      <WorkstreamGroup
                        key={ws}
                        name={ws}
                        initiatives={items}
                      />
                    ))}
                  </div>

                  {/* Today indicator overlay */}
                  <div
                    className="absolute top-0 bottom-0 pointer-events-none z-20"
                    style={{ left: "15rem", right: 0 }}
                  >
                    <div
                      className="absolute top-0 bottom-0 w-px"
                      style={{
                        left: `${todayLine}%`,
                        background: "linear-gradient(to bottom, var(--destructive), transparent)",
                      }}
                    />
                    <div
                      className="absolute -top-1 -translate-x-1/2"
                      style={{ left: `${todayLine}%` }}
                    >
                      <span className="text-[9px] font-bold text-destructive bg-card px-1.5 py-0.5 rounded-md border border-destructive/30 shadow-sm">
                        TODAY
                      </span>
                    </div>
                  </div>
                </div>

                {/* Empty state */}
                {grouped.size === 0 && (
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    No initiatives match the selected filter.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* State legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {(["draft", "validated", "viable", "planned"] as InitiativeState[]).map(
          (state) => {
            const s = STATE_STYLES[state];
            return (
              <div key={state} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="inline-block size-2.5 rounded-sm shadow-sm"
                  style={{ backgroundColor: s.background }}
                />
                <span className="font-medium">{STATE_LABELS[state]}</span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
