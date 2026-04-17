"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Target,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type { InitiativeListItem } from "@/lib/types/initiative";
import { api } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MilestoneType = "Implementation" | "Behavior Change" | "Economic Impact Start";
type MilestoneStatus = "completed" | "overdue" | "upcoming";

interface DemoMilestone {
  id: number;
  initiative: string;
  milestone: string;
  type: MilestoneType;
  plannedDate: string;
  responsible: string;
  status: MilestoneStatus;
  workstream: string;
}

interface GanttInitiative {
  name: string;
  workstream: string;
  startDate: string;
  endDate: string;
  milestones: { date: string; status: MilestoneStatus; label: string }[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TODAY = new Date(2026, 3, 16); // Apr 16, 2026
const TODAY_STR = "Apr 16, 2026";

const MILESTONE_TYPES: MilestoneType[] = [
  "Implementation",
  "Behavior Change",
  "Economic Impact Start",
];

// ---------------------------------------------------------------------------
// Demo milestone details (tagged as demo)
// ---------------------------------------------------------------------------

const ALL_MILESTONES: DemoMilestone[] = [
  // --- Overdue (4) ---
  { id: 1, initiative: "Cloud Migration Program", milestone: "Phase 2 cloud infrastructure deployment", type: "Implementation", plannedDate: "2026-03-15", responsible: "R. Torres", status: "overdue", workstream: "Digital Transformation" },
  { id: 2, initiative: "Customer 360 View", milestone: "Customer data integration testing", type: "Implementation", plannedDate: "2026-03-01", responsible: "K. Andersen", status: "overdue", workstream: "Customer Experience" },
  { id: 3, initiative: "Supply Chain Control Tower", milestone: "Supplier onboarding completion", type: "Behavior Change", plannedDate: "2026-02-20", responsible: "D. Nakamura", status: "overdue", workstream: "Operational Excellence" },
  { id: 4, initiative: "AI-Powered Document Processing", milestone: "ML model accuracy validation", type: "Implementation", plannedDate: "2026-04-01", responsible: "S. Patel", status: "overdue", workstream: "Digital Transformation" },

  // --- Upcoming within 30 days (6) ---
  { id: 5, initiative: "Cloud Migration Program", milestone: "Phase 3 application migration kickoff", type: "Implementation", plannedDate: "2026-04-22", responsible: "R. Torres", status: "upcoming", workstream: "Digital Transformation" },
  { id: 6, initiative: "Customer Loyalty Platform", milestone: "Rewards engine go-live", type: "Economic Impact Start", plannedDate: "2026-04-28", responsible: "M. Chen", status: "upcoming", workstream: "Customer Experience" },
  { id: 7, initiative: "Green Operations Certification", milestone: "Internal audit completion", type: "Implementation", plannedDate: "2026-05-01", responsible: "L. Johansson", status: "upcoming", workstream: "Sustainability" },
  { id: 8, initiative: "Predictive Maintenance System", milestone: "Sensor network deployment", type: "Implementation", plannedDate: "2026-05-05", responsible: "A. Reyes", status: "upcoming", workstream: "Operational Excellence" },
  { id: 9, initiative: "Digital Onboarding Journey", milestone: "User acceptance testing sign-off", type: "Behavior Change", plannedDate: "2026-05-10", responsible: "J. Kim", status: "upcoming", workstream: "Customer Experience" },
  { id: 10, initiative: "Energy Monitoring Dashboard", milestone: "Real-time dashboard launch", type: "Economic Impact Start", plannedDate: "2026-05-14", responsible: "T. Okafor", status: "upcoming", workstream: "Sustainability" },

  // --- Upcoming beyond 30 days ---
  { id: 11, initiative: "AI-Powered Document Processing", milestone: "Production rollout", type: "Implementation", plannedDate: "2026-06-01", responsible: "S. Patel", status: "upcoming", workstream: "Digital Transformation" },
  { id: 12, initiative: "Supply Chain Control Tower", milestone: "Real-time tracking launch", type: "Economic Impact Start", plannedDate: "2026-06-15", responsible: "D. Nakamura", status: "upcoming", workstream: "Operational Excellence" },
  { id: 13, initiative: "Customer 360 View", milestone: "CRM integration go-live", type: "Implementation", plannedDate: "2026-06-20", responsible: "K. Andersen", status: "upcoming", workstream: "Customer Experience" },
  { id: 14, initiative: "Cloud Migration Program", milestone: "Legacy system decommission", type: "Implementation", plannedDate: "2026-07-01", responsible: "R. Torres", status: "upcoming", workstream: "Digital Transformation" },
  { id: 15, initiative: "Predictive Maintenance System", milestone: "Alert engine go-live", type: "Economic Impact Start", plannedDate: "2026-07-10", responsible: "A. Reyes", status: "upcoming", workstream: "Operational Excellence" },
  { id: 16, initiative: "Green Operations Certification", milestone: "ISO 14001 submission", type: "Implementation", plannedDate: "2026-07-15", responsible: "L. Johansson", status: "upcoming", workstream: "Sustainability" },
  { id: 17, initiative: "Digital Onboarding Journey", milestone: "Full rollout", type: "Behavior Change", plannedDate: "2026-08-01", responsible: "J. Kim", status: "upcoming", workstream: "Customer Experience" },
  { id: 18, initiative: "Customer Loyalty Platform", milestone: "First economic impact measurement", type: "Economic Impact Start", plannedDate: "2026-08-15", responsible: "M. Chen", status: "upcoming", workstream: "Customer Experience" },
  { id: 19, initiative: "Energy Monitoring Dashboard", milestone: "Facility-wide deployment", type: "Implementation", plannedDate: "2026-09-01", responsible: "T. Okafor", status: "upcoming", workstream: "Sustainability" },
  { id: 20, initiative: "Cloud Migration Program", milestone: "Performance benchmark validation", type: "Behavior Change", plannedDate: "2026-09-15", responsible: "R. Torres", status: "upcoming", workstream: "Digital Transformation" },
  { id: 21, initiative: "Predictive Maintenance System", milestone: "ROI assessment", type: "Economic Impact Start", plannedDate: "2026-10-01", responsible: "A. Reyes", status: "upcoming", workstream: "Operational Excellence" },
  { id: 22, initiative: "Supply Chain Control Tower", milestone: "Full network integration", type: "Implementation", plannedDate: "2026-10-15", responsible: "D. Nakamura", status: "upcoming", workstream: "Operational Excellence" },
  { id: 23, initiative: "Customer 360 View", milestone: "Behavior analytics launch", type: "Behavior Change", plannedDate: "2026-11-01", responsible: "K. Andersen", status: "upcoming", workstream: "Customer Experience" },
  { id: 24, initiative: "Green Operations Certification", milestone: "Carbon offset program launch", type: "Economic Impact Start", plannedDate: "2026-11-15", responsible: "L. Johansson", status: "upcoming", workstream: "Sustainability" },
  { id: 25, initiative: "AI-Powered Document Processing", milestone: "Full department adoption", type: "Behavior Change", plannedDate: "2026-12-01", responsible: "S. Patel", status: "upcoming", workstream: "Digital Transformation" },
  { id: 26, initiative: "Digital Onboarding Journey", milestone: "Economic impact assessment", type: "Economic Impact Start", plannedDate: "2026-12-15", responsible: "J. Kim", status: "upcoming", workstream: "Customer Experience" },

  // --- Completed ---
  { id: 27, initiative: "Cloud Migration Program", milestone: "Phase 1 cloud infrastructure deployment", type: "Implementation", plannedDate: "2025-06-15", responsible: "R. Torres", status: "completed", workstream: "Digital Transformation" },
  { id: 28, initiative: "Cloud Migration Program", milestone: "Security audit completion", type: "Implementation", plannedDate: "2025-09-01", responsible: "R. Torres", status: "completed", workstream: "Digital Transformation" },
  { id: 29, initiative: "Customer 360 View", milestone: "Data architecture design", type: "Implementation", plannedDate: "2025-04-01", responsible: "K. Andersen", status: "completed", workstream: "Customer Experience" },
  { id: 30, initiative: "Customer 360 View", milestone: "Data pipeline build", type: "Implementation", plannedDate: "2025-08-15", responsible: "K. Andersen", status: "completed", workstream: "Customer Experience" },
  { id: 31, initiative: "Supply Chain Control Tower", milestone: "Requirements gathering", type: "Implementation", plannedDate: "2025-03-01", responsible: "D. Nakamura", status: "completed", workstream: "Operational Excellence" },
  { id: 32, initiative: "Supply Chain Control Tower", milestone: "Platform selection", type: "Implementation", plannedDate: "2025-06-01", responsible: "D. Nakamura", status: "completed", workstream: "Operational Excellence" },
  { id: 33, initiative: "AI-Powered Document Processing", milestone: "ML model training", type: "Implementation", plannedDate: "2025-07-01", responsible: "S. Patel", status: "completed", workstream: "Digital Transformation" },
  { id: 34, initiative: "AI-Powered Document Processing", milestone: "Pilot department launch", type: "Behavior Change", plannedDate: "2025-11-01", responsible: "S. Patel", status: "completed", workstream: "Digital Transformation" },
  { id: 35, initiative: "Customer Loyalty Platform", milestone: "Platform architecture design", type: "Implementation", plannedDate: "2025-05-01", responsible: "M. Chen", status: "completed", workstream: "Customer Experience" },
  { id: 36, initiative: "Customer Loyalty Platform", milestone: "Beta launch", type: "Implementation", plannedDate: "2025-10-01", responsible: "M. Chen", status: "completed", workstream: "Customer Experience" },
  { id: 37, initiative: "Green Operations Certification", milestone: "Baseline assessment", type: "Implementation", plannedDate: "2025-04-15", responsible: "L. Johansson", status: "completed", workstream: "Sustainability" },
  { id: 38, initiative: "Green Operations Certification", milestone: "Process redesign", type: "Behavior Change", plannedDate: "2025-09-15", responsible: "L. Johansson", status: "completed", workstream: "Sustainability" },
  { id: 39, initiative: "Predictive Maintenance System", milestone: "Feasibility study", type: "Implementation", plannedDate: "2025-05-15", responsible: "A. Reyes", status: "completed", workstream: "Operational Excellence" },
  { id: 40, initiative: "Predictive Maintenance System", milestone: "Pilot sensor installation", type: "Implementation", plannedDate: "2025-10-15", responsible: "A. Reyes", status: "completed", workstream: "Operational Excellence" },
  { id: 41, initiative: "Digital Onboarding Journey", milestone: "UX research and design", type: "Implementation", plannedDate: "2025-06-01", responsible: "J. Kim", status: "completed", workstream: "Customer Experience" },
  { id: 42, initiative: "Digital Onboarding Journey", milestone: "MVP development", type: "Implementation", plannedDate: "2025-12-01", responsible: "J. Kim", status: "completed", workstream: "Customer Experience" },
  { id: 43, initiative: "Energy Monitoring Dashboard", milestone: "Sensor procurement", type: "Implementation", plannedDate: "2025-07-15", responsible: "T. Okafor", status: "completed", workstream: "Sustainability" },
  { id: 44, initiative: "Energy Monitoring Dashboard", milestone: "Prototype dashboard", type: "Implementation", plannedDate: "2025-12-15", responsible: "T. Okafor", status: "completed", workstream: "Sustainability" },
];

// Gantt timeline data
const GANTT_INITIATIVES: GanttInitiative[] = [
  {
    name: "Cloud Migration Program",
    workstream: "Digital Transformation",
    startDate: "2025-06-15",
    endDate: "2026-09-15",
    milestones: [
      { date: "2025-06-15", status: "completed", label: "Phase 1 deployment" },
      { date: "2025-09-01", status: "completed", label: "Security audit" },
      { date: "2026-03-15", status: "overdue", label: "Phase 2 deployment" },
      { date: "2026-04-22", status: "upcoming", label: "Phase 3 kickoff" },
      { date: "2026-07-01", status: "upcoming", label: "Legacy decommission" },
      { date: "2026-09-15", status: "upcoming", label: "Performance benchmark" },
    ],
  },
  {
    name: "Customer 360 View",
    workstream: "Customer Experience",
    startDate: "2025-04-01",
    endDate: "2026-11-01",
    milestones: [
      { date: "2025-04-01", status: "completed", label: "Data architecture" },
      { date: "2025-08-15", status: "completed", label: "Pipeline build" },
      { date: "2026-03-01", status: "overdue", label: "Integration testing" },
      { date: "2026-06-20", status: "upcoming", label: "CRM go-live" },
      { date: "2026-11-01", status: "upcoming", label: "Analytics launch" },
    ],
  },
  {
    name: "Supply Chain Control Tower",
    workstream: "Operational Excellence",
    startDate: "2025-03-01",
    endDate: "2026-10-15",
    milestones: [
      { date: "2025-03-01", status: "completed", label: "Requirements" },
      { date: "2025-06-01", status: "completed", label: "Platform selection" },
      { date: "2026-02-20", status: "overdue", label: "Supplier onboarding" },
      { date: "2026-06-15", status: "upcoming", label: "Tracking launch" },
      { date: "2026-10-15", status: "upcoming", label: "Full integration" },
    ],
  },
  {
    name: "AI-Powered Doc Processing",
    workstream: "Digital Transformation",
    startDate: "2025-07-01",
    endDate: "2026-12-01",
    milestones: [
      { date: "2025-07-01", status: "completed", label: "ML training" },
      { date: "2025-11-01", status: "completed", label: "Pilot launch" },
      { date: "2026-04-01", status: "overdue", label: "Accuracy validation" },
      { date: "2026-06-01", status: "upcoming", label: "Production rollout" },
      { date: "2026-12-01", status: "upcoming", label: "Full adoption" },
    ],
  },
  {
    name: "Customer Loyalty Platform",
    workstream: "Customer Experience",
    startDate: "2025-05-01",
    endDate: "2026-08-15",
    milestones: [
      { date: "2025-05-01", status: "completed", label: "Architecture design" },
      { date: "2025-10-01", status: "completed", label: "Beta launch" },
      { date: "2026-04-28", status: "upcoming", label: "Rewards go-live" },
      { date: "2026-08-15", status: "upcoming", label: "Impact measurement" },
    ],
  },
  {
    name: "Green Operations Cert.",
    workstream: "Sustainability",
    startDate: "2025-04-15",
    endDate: "2026-11-15",
    milestones: [
      { date: "2025-04-15", status: "completed", label: "Baseline assessment" },
      { date: "2025-09-15", status: "completed", label: "Process redesign" },
      { date: "2026-05-01", status: "upcoming", label: "Internal audit" },
      { date: "2026-07-15", status: "upcoming", label: "ISO submission" },
      { date: "2026-11-15", status: "upcoming", label: "Carbon offset" },
    ],
  },
  {
    name: "Predictive Maintenance",
    workstream: "Operational Excellence",
    startDate: "2025-05-15",
    endDate: "2026-10-01",
    milestones: [
      { date: "2025-05-15", status: "completed", label: "Feasibility study" },
      { date: "2025-10-15", status: "completed", label: "Pilot sensors" },
      { date: "2026-05-05", status: "upcoming", label: "Sensor deployment" },
      { date: "2026-07-10", status: "upcoming", label: "Alert go-live" },
      { date: "2026-10-01", status: "upcoming", label: "ROI assessment" },
    ],
  },
  {
    name: "Energy Monitoring Dashboard",
    workstream: "Sustainability",
    startDate: "2025-07-15",
    endDate: "2026-09-01",
    milestones: [
      { date: "2025-07-15", status: "completed", label: "Sensor procurement" },
      { date: "2025-12-15", status: "completed", label: "Prototype" },
      { date: "2026-05-14", status: "upcoming", label: "Dashboard launch" },
      { date: "2026-09-01", status: "upcoming", label: "Facility deployment" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateShort(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function typeBadgeVariant(type: MilestoneType): "default" | "secondary" | "outline" {
  switch (type) {
    case "Implementation":
      return "default";
    case "Behavior Change":
      return "secondary";
    case "Economic Impact Start":
      return "outline";
  }
}

// ---------------------------------------------------------------------------
// Gantt helpers
// ---------------------------------------------------------------------------

const GANTT_START = new Date(2025, 0, 1);
const GANTT_END = new Date(2026, 11, 31);
const GANTT_TOTAL_DAYS = daysBetween(GANTT_START, GANTT_END);

const GANTT_MONTHS: { label: string; offsetPct: number }[] = [];
for (let y = 2025; y <= 2026; y++) {
  for (let m = 0; m < 12; m++) {
    const d = new Date(y, m, 1);
    const pct = (daysBetween(GANTT_START, d) / GANTT_TOTAL_DAYS) * 100;
    const shortMonth = d.toLocaleDateString("en-US", { month: "short" });
    const label = m === 0 ? `${shortMonth} ${y}` : shortMonth;
    GANTT_MONTHS.push({ label, offsetPct: pct });
  }
}

function ganttPct(dateStr: string): number {
  const d = parseDate(dateStr);
  return Math.max(0, Math.min(100, (daysBetween(GANTT_START, d) / GANTT_TOTAL_DAYS) * 100));
}

const TODAY_PCT = ganttPct("2026-04-16");

// ---------------------------------------------------------------------------
// Paginated response shape
// ---------------------------------------------------------------------------

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DailyTrackingPage() {
  const [workstreamFilter, setWorkstreamFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Live API data
  const [initiatives, setInitiatives] = useState<InitiativeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PaginatedResponse<InitiativeListItem>>("/initiatives/?page_size=100")
      .then((res) => {
        setInitiatives(res.results);
      })
      .catch(() => {
        // fall back to empty — demo milestones still visible
      })
      .finally(() => setLoading(false));
  }, []);

  // Derive workstream list from live data (fallback to hardcoded if empty)
  const workstreams = useMemo(() => {
    if (initiatives.length === 0) {
      return ["Digital Transformation", "Operational Excellence", "Customer Experience", "Sustainability"];
    }
    return [...new Set(initiatives.map((i) => i.workstream_name))].sort();
  }, [initiatives]);

  // Build live summary: total initiatives, those with overdue milestones
  const liveOverdueCount = useMemo(
    () => initiatives.filter((i) => i.overdue_milestones_count > 0).length,
    [initiatives],
  );
  const totalOverdueMilestones = useMemo(
    () => initiatives.reduce((sum, i) => sum + i.overdue_milestones_count, 0),
    [initiatives],
  );

  // Filtered demo milestones
  const filtered = useMemo(() => {
    return ALL_MILESTONES.filter((m) => {
      if (workstreamFilter !== "all" && m.workstream !== workstreamFilter) return false;
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      return true;
    });
  }, [workstreamFilter, typeFilter]);

  // Counts
  const totalCount = filtered.length;
  const completedCount = filtered.filter((m) => m.status === "completed").length;
  const upcomingCount = filtered.filter((m) => m.status === "upcoming").length;
  const overdueCount = filtered.filter((m) => m.status === "overdue").length;

  // Overdue items sorted by days overdue (desc)
  const overdueMilestones = useMemo(() => {
    return filtered
      .filter((m) => m.status === "overdue")
      .map((m) => ({
        ...m,
        daysOverdue: daysBetween(parseDate(m.plannedDate), TODAY),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [filtered]);

  // Upcoming within 30 days, sorted by date (asc)
  const upcomingNext30 = useMemo(() => {
    return filtered
      .filter((m) => {
        if (m.status !== "upcoming") return false;
        const d = parseDate(m.plannedDate);
        const diff = daysBetween(TODAY, d);
        return diff >= 0 && diff <= 30;
      })
      .map((m) => ({
        ...m,
        daysUntil: daysBetween(TODAY, parseDate(m.plannedDate)),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ----------------------------------------------------------------- */}
      <div>
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Daily Tracking</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Milestone status as of {TODAY_STR}
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Live API summary                                                   */}
      {/* ----------------------------------------------------------------- */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading live data...</span>
          </CardContent>
        </Card>
      ) : initiatives.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 pt-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Initiatives</p>
                <p className="text-2xl font-bold">{initiatives.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 pt-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Initiatives w/ Overdue</p>
                <p className="text-2xl font-bold text-destructive">{liveOverdueCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 pt-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Overdue Milestones</p>
                <p className="text-2xl font-bold text-amber-600">{totalOverdueMilestones}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Live initiative list with overdue flags */}
      {!loading && initiatives.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Initiative Overview</CardTitle>
            <CardDescription>Live data from API -- {initiatives.length} initiatives</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Workstream</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead className="text-right">Overdue Milestones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initiatives.map((init) => (
                  <TableRow key={init.id}>
                    <TableCell className="font-medium">{init.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{init.workstream_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: init.state_color.background,
                          color: init.state_color.text,
                        }}
                      >
                        {init.state_text}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{init.lead_name}</TableCell>
                    <TableCell className="text-right">
                      {init.overdue_milestones_count > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {init.overdue_milestones_count}
                        </span>
                      ) : (
                        <span className="text-emerald-600">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* ----------------------------------------------------------------- */}
      {/* Demo milestone detail section header                               */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Milestone Details</h2>
        <Badge variant="outline" className="text-xs">demo milestones</Badge>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Summary cards (demo milestones)                                    */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 pt-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Milestones</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 pt-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 pt-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">{upcomingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 pt-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Filter bar                                                        */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={workstreamFilter}
          onValueChange={(v) => setWorkstreamFilter(v ?? "all")}
        >
          <SelectTrigger className="min-w-[200px]">
            <SelectValue placeholder="All Workstreams" />
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

        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v ?? "all")}
        >
          <SelectTrigger className="min-w-[220px]">
            <SelectValue placeholder="All Milestone Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Milestone Types</SelectItem>
            {MILESTONE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Overdue Milestones Alert                                          */}
      {/* ----------------------------------------------------------------- */}
      {overdueMilestones.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/[0.02] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">
                {overdueMilestones.length} Overdue Milestone{overdueMilestones.length !== 1 ? "s" : ""} Requiring Attention
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Initiative</TableHead>
                  <TableHead>Milestone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Planned Date</TableHead>
                  <TableHead className="text-right">Days Overdue</TableHead>
                  <TableHead>Responsible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueMilestones.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.initiative}</TableCell>
                    <TableCell>{m.milestone}</TableCell>
                    <TableCell>
                      <Badge variant={typeBadgeVariant(m.type)}>{m.type}</Badge>
                    </TableCell>
                    <TableCell>{formatDateShort(m.plannedDate)}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {m.daysOverdue} days
                    </TableCell>
                    <TableCell>{m.responsible}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Upcoming Milestones (next 30 days)                                */}
      {/* ----------------------------------------------------------------- */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Upcoming Milestones</CardTitle>
          <CardDescription>Next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingNext30.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones due in the next 30 days with current filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Initiative</TableHead>
                  <TableHead>Milestone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Planned Date</TableHead>
                  <TableHead className="text-right">Days Until Due</TableHead>
                  <TableHead>Responsible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingNext30.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.initiative}</TableCell>
                    <TableCell>{m.milestone}</TableCell>
                    <TableCell>
                      <Badge variant={typeBadgeVariant(m.type)}>{m.type}</Badge>
                    </TableCell>
                    <TableCell>{formatDateShort(m.plannedDate)}</TableCell>
                    <TableCell className="text-right font-semibold text-blue-600">
                      {m.daysUntil} days
                    </TableCell>
                    <TableCell>{m.responsible}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* ----------------------------------------------------------------- */}
      {/* Mini Gantt Timeline                                               */}
      {/* ----------------------------------------------------------------- */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Initiative Timeline Overview</CardTitle>
          <CardDescription>Jan 2025 - Dec 2026</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Month labels */}
          <div className="relative mb-2 h-6 overflow-hidden text-[10px] text-muted-foreground">
            {GANTT_MONTHS.map((m, i) => (
              <span
                key={i}
                className="absolute top-0 -translate-x-1/2 select-none"
                style={{ left: `${m.offsetPct}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid + today line container */}
          <div className="relative">
            {/* Vertical month gridlines */}
            {GANTT_MONTHS.map((m, i) => (
              <div
                key={i}
                className="pointer-events-none absolute top-0 bottom-0 w-px bg-border/40"
                style={{ left: `${m.offsetPct}%` }}
              />
            ))}

            {/* Today line */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 z-10 w-px border-l-2 border-dashed border-destructive/60"
              style={{ left: `${TODAY_PCT}%` }}
            >
              <span className="absolute -top-5 left-1 text-[10px] font-medium text-destructive">
                Today
              </span>
            </div>

            {/* Initiative rows */}
            <div className="space-y-3 py-2">
              {GANTT_INITIATIVES.map((init, idx) => {
                const startPct = ganttPct(init.startDate);
                const endPct = ganttPct(init.endDate);
                const widthPct = endPct - startPct;

                return (
                  <div key={idx} className="flex items-center gap-3">
                    {/* Label */}
                    <div className="w-[180px] shrink-0 truncate text-xs font-medium" title={init.name}>
                      {init.name}
                    </div>

                    {/* Bar area */}
                    <div className="relative h-6 flex-1">
                      {/* Background bar */}
                      <div
                        className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted-foreground/15"
                        style={{
                          left: `${startPct}%`,
                          width: `${widthPct}%`,
                        }}
                      />

                      {/* Milestone dots */}
                      {init.milestones.map((ms, mi) => {
                        const pct = ganttPct(ms.date);
                        let dotColor: string;
                        switch (ms.status) {
                          case "completed":
                            dotColor = "bg-emerald-500";
                            break;
                          case "overdue":
                            dotColor = "bg-destructive";
                            break;
                          default:
                            dotColor = "bg-muted-foreground/40";
                        }
                        return (
                          <div
                            key={mi}
                            className={`absolute top-1/2 z-[5] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background ${dotColor}`}
                            style={{ left: `${pct}%` }}
                            title={`${ms.label} (${formatDateShort(ms.date)})`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Completed
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-destructive" />
              Overdue
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
              Upcoming
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-px w-4 border-t-2 border-dashed border-destructive/60" />
              Today
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
