"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  BarChart3,
  AlertTriangle,
  Target,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { InitiativeState } from "@/lib/types/initiative";
import { STATE_STYLES } from "@/lib/types/initiative";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TrackedInitiative {
  id: number;
  name: string;
  state: InitiativeState;
  stateLabel: string;
  workstream: string;
  hasDescription: boolean;
  hasFinancialData: boolean;
  milestones: { current: number; target: number };
  kpis: { current: number; target: number };
  hasCashFlow: boolean;
  completeness: number;
  action: string;
}

// ---------------------------------------------------------------------------
// State group mapping for filters
// ---------------------------------------------------------------------------

const STATE_STAGE_MAP: Record<string, InitiativeState[]> = {
  early: ["draft", "submitted", "initiative", "rejected"],
  mid: ["validation_submitted", "validated", "viability_submitted", "viable"],
  late: ["planning_submitted", "planned", "execution_submitted", "executed"],
};

const STATE_LABELS: Record<InitiativeState, string> = {
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

// ---------------------------------------------------------------------------
// Demo data — 16 initiatives with varying completeness
// ---------------------------------------------------------------------------

const INITIATIVES: TrackedInitiative[] = [
  // Executed: 90-100%
  {
    id: 8,
    name: "Omnichannel Platform",
    state: "executed",
    stateLabel: "Executed",
    workstream: "Customer Experience",
    hasDescription: true,
    hasFinancialData: true,
    milestones: { current: 3, target: 3 },
    kpis: { current: 4, target: 4 },
    hasCashFlow: true,
    completeness: 100,
    action: "None",
  },
  {
    id: 5,
    name: "Lean Manufacturing Rollout",
    state: "execution_submitted",
    stateLabel: "Execution Submitted",
    workstream: "Operational Excellence",
    hasDescription: true,
    hasFinancialData: true,
    milestones: { current: 3, target: 3 },
    kpis: { current: 3, target: 3 },
    hasCashFlow: true,
    completeness: 95,
    action: "None",
  },

  // Planned / Viable: 70-85%
  {
    id: 2,
    name: "Data Lakehouse Architecture",
    state: "planned",
    stateLabel: "Planned",
    workstream: "Digital Transformation",
    hasDescription: true,
    hasFinancialData: true,
    milestones: { current: 2, target: 3 },
    kpis: { current: 2, target: 3 },
    hasCashFlow: true,
    completeness: 82,
    action: "Complete milestones",
  },
  {
    id: 13,
    name: "Circular Packaging Initiative",
    state: "planned",
    stateLabel: "Planned",
    workstream: "Sustainability",
    hasDescription: true,
    hasFinancialData: true,
    milestones: { current: 2, target: 3 },
    kpis: { current: 0, target: 3 },
    hasCashFlow: true,
    completeness: 78,
    action: "Add KPIs",
  },
  {
    id: 1,
    name: "Cloud Migration Program",
    state: "viable",
    stateLabel: "Viable",
    workstream: "Digital Transformation",
    hasDescription: true,
    hasFinancialData: true,
    milestones: { current: 1, target: 3 },
    kpis: { current: 2, target: 3 },
    hasCashFlow: false,
    completeness: 75,
    action: "Add cash flow data",
  },
  {
    id: 12,
    name: "Carbon Tracking Platform",
    state: "viable",
    stateLabel: "Viable",
    workstream: "Sustainability",
    hasDescription: true,
    hasFinancialData: false,
    milestones: { current: 2, target: 3 },
    kpis: { current: 1, target: 3 },
    hasCashFlow: false,
    completeness: 72,
    action: "Add financial data",
  },
  {
    id: 6,
    name: "Predictive Maintenance System",
    state: "planning_submitted",
    stateLabel: "Planning Submitted",
    workstream: "Operational Excellence",
    hasDescription: true,
    hasFinancialData: true,
    milestones: { current: 1, target: 3 },
    kpis: { current: 0, target: 3 },
    hasCashFlow: false,
    completeness: 70,
    action: "Add KPIs",
  },

  // Validated: 50-70%
  {
    id: 3,
    name: "AI-Powered Document Processing",
    state: "validated",
    stateLabel: "Validated",
    workstream: "Digital Transformation",
    hasDescription: true,
    hasFinancialData: false,
    milestones: { current: 1, target: 3 },
    kpis: { current: 1, target: 3 },
    hasCashFlow: false,
    completeness: 65,
    action: "Add financial data",
  },
  {
    id: 15,
    name: "Green Building Certification",
    state: "validated",
    stateLabel: "Validated",
    workstream: "Sustainability",
    hasDescription: true,
    hasFinancialData: false,
    milestones: { current: 0, target: 3 },
    kpis: { current: 1, target: 3 },
    hasCashFlow: false,
    completeness: 55,
    action: "Add financial data",
  },
  {
    id: 9,
    name: "Customer 360 View",
    state: "viability_submitted",
    stateLabel: "Viability Submitted",
    workstream: "Customer Experience",
    hasDescription: true,
    hasFinancialData: true,
    milestones: { current: 1, target: 3 },
    kpis: { current: 0, target: 3 },
    hasCashFlow: false,
    completeness: 58,
    action: "Add KPIs",
  },
  {
    id: 7,
    name: "Supply Chain Control Tower",
    state: "validation_submitted",
    stateLabel: "Validation Submitted",
    workstream: "Operational Excellence",
    hasDescription: true,
    hasFinancialData: false,
    milestones: { current: 1, target: 3 },
    kpis: { current: 0, target: 3 },
    hasCashFlow: false,
    completeness: 52,
    action: "Add financial data",
  },

  // Initiative / Submitted: 30-50%
  {
    id: 11,
    name: "Loyalty Program Redesign",
    state: "initiative",
    stateLabel: "Initiative",
    workstream: "Customer Experience",
    hasDescription: true,
    hasFinancialData: false,
    milestones: { current: 0, target: 3 },
    kpis: { current: 0, target: 3 },
    hasCashFlow: false,
    completeness: 42,
    action: "Add financial data",
  },
  {
    id: 10,
    name: "AI Chatbot v2",
    state: "submitted",
    stateLabel: "Submitted",
    workstream: "Customer Experience",
    hasDescription: true,
    hasFinancialData: false,
    milestones: { current: 0, target: 3 },
    kpis: { current: 0, target: 3 },
    hasCashFlow: false,
    completeness: 35,
    action: "Add financial data",
  },
  {
    id: 14,
    name: "Net-Zero Fleet Transition",
    state: "rejected",
    stateLabel: "Rejected",
    workstream: "Sustainability",
    hasDescription: true,
    hasFinancialData: false,
    milestones: { current: 0, target: 3 },
    kpis: { current: 0, target: 3 },
    hasCashFlow: false,
    completeness: 30,
    action: "Add financial data",
  },

  // Draft: 10-30%
  {
    id: 4,
    name: "API Gateway Modernization",
    state: "draft",
    stateLabel: "Draft",
    workstream: "Digital Transformation",
    hasDescription: false,
    hasFinancialData: false,
    milestones: { current: 0, target: 3 },
    kpis: { current: 0, target: 3 },
    hasCashFlow: false,
    completeness: 18,
    action: "Add description",
  },
  {
    id: 16,
    name: "Warehouse Automation Phase 2",
    state: "draft",
    stateLabel: "Draft",
    workstream: "Operational Excellence",
    hasDescription: false,
    hasFinancialData: false,
    milestones: { current: 0, target: 3 },
    kpis: { current: 0, target: 3 },
    hasCashFlow: false,
    completeness: 12,
    action: "Add description",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function completenessColor(pct: number): string {
  if (pct > 80) return "oklch(0.6 0.18 145)"; // green
  if (pct >= 50) return "oklch(0.7 0.15 85)"; // amber
  return "oklch(0.6 0.2 25)"; // red
}

function completenessTextClass(pct: number): string {
  if (pct > 80) return "text-[oklch(0.6_0.18_145)]";
  if (pct >= 50) return "text-[oklch(0.7_0.15_85)]";
  return "text-[oklch(0.6_0.2_25)]";
}

// ---------------------------------------------------------------------------
// Circular progress (pure CSS)
// ---------------------------------------------------------------------------

function CircularProgress({
  value,
  size = 56,
  strokeWidth = 5,
  color,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Check / X icon helper
// ---------------------------------------------------------------------------

function DataCheck({ ok, label }: { ok: boolean; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {ok ? (
        <CheckCircle2 className="size-4 text-[oklch(0.6_0.18_145)]" />
      ) : (
        <XCircle className="size-4 text-[oklch(0.6_0.2_25)]" />
      )}
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Missing data lists
// ---------------------------------------------------------------------------

const MISSING_FINANCIAL = INITIATIVES.filter((i) => !i.hasFinancialData).slice(0, 4);
const MISSING_KPIS = INITIATIVES.filter((i) => i.kpis.current === 0).slice(0, 3);
const INCOMPLETE_MILESTONES = INITIATIVES.filter(
  (i) => i.milestones.current < 3
).slice(0, 5);
const NO_CASH_FLOW = INITIATIVES.filter((i) => !i.hasCashFlow).slice(0, 6);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InitiativeTrackingPage() {
  const [workstreamFilter, setWorkstreamFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  // Unique workstreams
  const workstreams = useMemo(() => {
    const unique = new Set<string>();
    for (const i of INITIATIVES) unique.add(i.workstream);
    return Array.from(unique).sort();
  }, []);

  // Filter
  const filtered = useMemo(() => {
    let items = [...INITIATIVES];

    if (workstreamFilter !== "all") {
      items = items.filter((i) => i.workstream === workstreamFilter);
    }

    if (stageFilter !== "all") {
      const states = STATE_STAGE_MAP[stageFilter];
      if (states) {
        items = items.filter((i) => states.includes(i.state));
      }
    }

    return items;
  }, [workstreamFilter, stageFilter]);

  // Portfolio-level KPIs
  const portfolioCompleteness = 72;
  const dataQualityScore = 85;
  const needingAttention = INITIATIVES.filter((i) => i.completeness < 50).length;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Initiative Tracking
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Data completeness and progress across all initiatives
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Summary Cards                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Portfolio Completeness */}
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="relative flex items-center justify-center">
                <CircularProgress
                  value={portfolioCompleteness}
                  color="oklch(0.55 0.15 250)"
                />
                <span className="absolute text-sm font-bold">
                  {portfolioCompleteness}%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Portfolio Completeness
                </p>
                <p className="text-xl font-bold tracking-tight">
                  {portfolioCompleteness}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Score */}
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="relative flex items-center justify-center">
                <CircularProgress
                  value={dataQualityScore}
                  color="oklch(0.6 0.18 145)"
                />
                <span className="absolute text-sm font-bold">
                  {dataQualityScore}%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data Quality Score
                </p>
                <p className="text-xl font-bold tracking-tight text-[oklch(0.6_0.18_145)]">
                  {dataQualityScore}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Initiatives Needing Attention */}
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex items-center justify-center rounded-full bg-[oklch(0.7_0.15_85)]/15 p-3">
                <AlertTriangle className="size-6 text-[oklch(0.7_0.15_85)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Initiatives Needing Attention
                </p>
                <p className="text-xl font-bold tracking-tight text-[oklch(0.7_0.15_85)]">
                  {needingAttention}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Filter Bar                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={workstreamFilter}
            onValueChange={(v) => setWorkstreamFilter(v ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-auto">
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

          <Select
            value={stageFilter}
            onValueChange={(v) => setStageFilter(v ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="early">Early Stage</SelectItem>
              <SelectItem value="mid">Mid Stage</SelectItem>
              <SelectItem value="late">Late Stage</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground">
            {filtered.length} initiative{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== INITIATIVES.length &&
              ` (filtered from ${INITIATIVES.length})`}
          </span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Completeness Table                                               */}
        {/* ---------------------------------------------------------------- */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-[200px]">Initiative</TableHead>
                <TableHead className="w-[130px]">State</TableHead>
                <TableHead className="w-[160px]">Workstream</TableHead>
                <TableHead className="w-[70px] text-center">
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      Desc.
                    </TooltipTrigger>
                    <TooltipContent>Description</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="w-[70px] text-center">
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      Fin.
                    </TooltipTrigger>
                    <TooltipContent>Financial Data</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="w-[90px] text-center">Milestones</TableHead>
                <TableHead className="w-[80px] text-center">KPIs</TableHead>
                <TableHead className="w-[80px] text-center">
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      Cash Flow
                    </TooltipTrigger>
                    <TooltipContent>Cash Flow Records</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="w-[140px]">Completeness</TableHead>
                <TableHead className="w-[160px]">Action Needed</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No initiatives match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    className={idx % 2 === 1 ? "bg-muted/20" : ""}
                  >
                    {/* Initiative name (link) */}
                    <TableCell className="font-medium">
                      <Link
                        href={`/initiatives/${item.id}`}
                        className="hover:underline text-primary"
                      >
                        {item.name}
                      </Link>
                    </TableCell>

                    {/* State badge */}
                    <TableCell>
                      <Badge
                        className="text-[11px] px-2 py-0 h-5 font-medium"
                        style={{
                          backgroundColor: STATE_STYLES[item.state].background,
                          color: STATE_STYLES[item.state].text,
                        }}
                      >
                        {STATE_LABELS[item.state]}
                      </Badge>
                    </TableCell>

                    {/* Workstream */}
                    <TableCell className="text-muted-foreground text-sm">
                      {item.workstream}
                    </TableCell>

                    {/* Description */}
                    <TableCell className="text-center">
                      <DataCheck ok={item.hasDescription} />
                    </TableCell>

                    {/* Financial Data */}
                    <TableCell className="text-center">
                      <DataCheck ok={item.hasFinancialData} />
                    </TableCell>

                    {/* Milestones */}
                    <TableCell className="text-center">
                      <DataCheck
                        ok={item.milestones.current >= item.milestones.target}
                        label={`${item.milestones.current}/${item.milestones.target}`}
                      />
                    </TableCell>

                    {/* KPIs */}
                    <TableCell className="text-center">
                      <DataCheck
                        ok={item.kpis.current >= item.kpis.target}
                        label={`${item.kpis.current}/${item.kpis.target}`}
                      />
                    </TableCell>

                    {/* Cash Flow */}
                    <TableCell className="text-center">
                      <DataCheck ok={item.hasCashFlow} />
                    </TableCell>

                    {/* Completeness bar */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full max-w-[80px] rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${item.completeness}%`,
                              backgroundColor: completenessColor(
                                item.completeness
                              ),
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium tabular-nums ${completenessTextClass(item.completeness)}`}
                        >
                          {item.completeness}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Action needed */}
                    <TableCell>
                      {item.action !== "None" ? (
                        <span className="text-xs text-[oklch(0.7_0.15_85)] font-medium">
                          {item.action}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          --
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Data Quality Summary                                             */}
        {/* ---------------------------------------------------------------- */}
        <Separator />

        <div>
          <h2 className="text-lg font-semibold tracking-tight mb-4">
            Data Quality Summary
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Missing Financial Data */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <DollarSign className="size-4 text-[oklch(0.6_0.2_25)]" />
                  Missing Financial Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {MISSING_FINANCIAL.map((i) => (
                    <li
                      key={i.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <Link
                        href={`/initiatives/${i.id}`}
                        className="hover:underline text-primary"
                      >
                        {i.name}
                      </Link>
                      <Badge variant="secondary" className="text-[11px]">
                        {i.stateLabel}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Missing KPIs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Target className="size-4 text-[oklch(0.7_0.15_85)]" />
                  Missing KPIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {MISSING_KPIS.map((i) => (
                    <li
                      key={i.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <Link
                        href={`/initiatives/${i.id}`}
                        className="hover:underline text-primary"
                      >
                        {i.name}
                      </Link>
                      <Badge variant="secondary" className="text-[11px]">
                        {i.stateLabel}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Incomplete Milestones */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <BarChart3 className="size-4 text-[oklch(0.7_0.15_85)]" />
                  Incomplete Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {INCOMPLETE_MILESTONES.map((i) => (
                    <li
                      key={i.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <Link
                        href={`/initiatives/${i.id}`}
                        className="hover:underline text-primary"
                      >
                        {i.name}
                      </Link>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {i.milestones.current}/{i.milestones.target} milestones
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* No Cash Flow Data */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <TrendingUp className="size-4 text-[oklch(0.6_0.2_25)]" />
                  No Cash Flow Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {NO_CASH_FLOW.map((i) => (
                    <li
                      key={i.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <Link
                        href={`/initiatives/${i.id}`}
                        className="hover:underline text-primary"
                      >
                        {i.name}
                      </Link>
                      <Badge variant="secondary" className="text-[11px]">
                        {i.stateLabel}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
