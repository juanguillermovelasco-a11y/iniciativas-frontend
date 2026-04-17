"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Target,
  DollarSign,
  FileText,
} from "lucide-react";

import type {
  InitiativeDetail,
  FinancialData,
  Milestone,
  KPI,
} from "@/lib/types/initiative";
import { STATE_TRANSITIONS } from "@/lib/types/initiative";
import { api } from "@/lib/api/client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_INITIATIVE: InitiativeDetail = {
  id: 1,
  name: "Customer Portal Redesign",
  description:
    "Complete redesign of the customer-facing portal to improve UX, reduce support tickets, and increase self-service adoption by 40%.",
  current_situation:
    "The existing portal was built in 2019 and has not been updated since. Customer satisfaction scores for the portal are at 3.2/5, and 60% of support tickets originate from portal usability issues.",
  what_needs_to_change:
    "The portal needs a modern, responsive UI with streamlined workflows for the top 10 customer tasks. Authentication must be upgraded to SSO, and the knowledge base needs to be integrated directly into the portal.",
  what_will_be_done:
    "Redesign and rebuild the portal using a modern component framework. Implement SSO integration, embedded knowledge base, and real-time chat support. Conduct user testing with 50 customers before launch.",
  tshirt_size: "L",
  estimated_duration: "medium_term",
  estimated_duration_display: "Medium Term (3-12 months)",
  affected_organization_unit: 3,
  affected_organization_unit_detail: {
    id: 3,
    name: "Customer Experience",
    description: "Customer experience and service delivery",
    organization_unit_type: { id: 1, numeric_id: 1, name: "Department" },
  },
  requires_it: true,
  requires_hr: false,
  requires_procurement: true,
  required_fte: "4.5",
  workstream: 1,
  workstream_detail: {
    id: 1,
    name: "Digital Transformation",
    description: "Initiatives focused on digitizing core business processes",
    type: "strategic",
    type_display: "Strategic",
    owner: {
      id: 2,
      username: "mgarcia",
      first_name: "Maria",
      last_name: "Garcia",
      email: "m.garcia@company.com",
      full_name: "Maria Garcia",
    },
  },
  strategic_objective: 2,
  strategic_objective_detail: {
    id: 2,
    name: "Improve Customer Experience",
    description: "Enhance all customer touchpoints for better satisfaction",
    order: 2,
  },
  lead: 5,
  lead_detail: {
    id: 5,
    username: "jdoe",
    first_name: "John",
    last_name: "Doe",
    email: "j.doe@company.com",
    full_name: "John Doe",
  },
  confirmed_lead: 5,
  confirmed_lead_detail: {
    id: 5,
    username: "jdoe",
    first_name: "John",
    last_name: "Doe",
    email: "j.doe@company.com",
    full_name: "John Doe",
  },
  required_resources:
    "2 frontend developers, 1 UX designer, 1 backend developer, 0.5 project manager",
  required_investment: "320000",
  identified_implementation_risks:
    "SSO integration complexity may cause delays. Vendor selection for the component library may extend the timeline by 2-4 weeks.",
  identified_business_risks:
    "Customer disruption during migration. Potential data migration issues with legacy accounts created before 2020.",
  idea_state: "viable",
  state_display: "Viable",
  state_text: "Viable",
  state_color: { background: "#6699CC", text: "#FFFFFF" },
  state_order: 7,
  financial_data: [
    {
      id: 1,
      initiative: 1,
      data_type: "estimate",
      data_type_display: "Estimate",
      recurring_net_impact_revenue: "150000",
      recurring_net_impact_costs: "-45000",
      recurring_net_impact_cash_flow: "105000",
      recurring_net_impact_profit: "105000",
      recurrence_period: 12,
      one_time_net_impact_revenue: "0",
      one_time_net_impact_costs: "-80000",
      one_time_net_impact_cash_flow: "-80000",
      one_time_net_impact_profit: "-80000",
      one_time_implementation_cost: "320000",
      total_anualized_benefit_1: "25000",
      total_anualized_benefit_2: "105000",
      total_anualized_benefit_3: "105000",
      total_benefit: "235000",
      roi: "73.4",
      created_at: "2025-08-15T10:00:00Z",
      updated_at: "2025-08-20T14:30:00Z",
    },
    {
      id: 2,
      initiative: 1,
      data_type: "projected",
      data_type_display: "Projected",
      recurring_net_impact_revenue: "180000",
      recurring_net_impact_costs: "-50000",
      recurring_net_impact_cash_flow: "130000",
      recurring_net_impact_profit: "130000",
      recurrence_period: 12,
      one_time_net_impact_revenue: "0",
      one_time_net_impact_costs: "-90000",
      one_time_net_impact_cash_flow: "-90000",
      one_time_net_impact_profit: "-90000",
      one_time_implementation_cost: "350000",
      total_anualized_benefit_1: "40000",
      total_anualized_benefit_2: "130000",
      total_anualized_benefit_3: "130000",
      total_benefit: "300000",
      roi: "85.7",
      created_at: "2025-09-01T09:00:00Z",
      updated_at: "2025-09-10T11:00:00Z",
    },
    {
      id: 3,
      initiative: 1,
      data_type: "real",
      data_type_display: "Real",
      recurring_net_impact_revenue: "165000",
      recurring_net_impact_costs: "-48000",
      recurring_net_impact_cash_flow: "117000",
      recurring_net_impact_profit: "117000",
      recurrence_period: 12,
      one_time_net_impact_revenue: "5000",
      one_time_net_impact_costs: "-85000",
      one_time_net_impact_cash_flow: "-80000",
      one_time_net_impact_profit: "-80000",
      one_time_implementation_cost: "340000",
      total_anualized_benefit_1: "37000",
      total_anualized_benefit_2: "117000",
      total_anualized_benefit_3: "117000",
      total_benefit: "271000",
      roi: "79.7",
      created_at: "2025-11-01T08:00:00Z",
      updated_at: "2025-11-15T16:00:00Z",
    },
  ],
  milestones: [
    {
      id: 1,
      initiative: 1,
      planned_date: "2025-09-30",
      actual_execution_date: "2025-10-02",
      description: "UX research and wireframes completed",
      milestone_type: "implementation",
      milestone_type_display: "Implementation",
      responsible: "Sarah Kim",
      is_overdue: false,
      created_at: "2025-08-15T10:00:00Z",
      updated_at: "2025-10-02T09:00:00Z",
    },
    {
      id: 2,
      initiative: 1,
      planned_date: "2025-11-15",
      actual_execution_date: "2025-11-14",
      description: "MVP development and internal testing",
      milestone_type: "implementation",
      milestone_type_display: "Implementation",
      responsible: "Dev Team",
      is_overdue: false,
      created_at: "2025-08-15T10:00:00Z",
      updated_at: "2025-11-14T17:00:00Z",
    },
    {
      id: 3,
      initiative: 1,
      planned_date: "2025-12-01",
      actual_execution_date: null,
      description: "Customer beta testing with 50 users",
      milestone_type: "behavior_change",
      milestone_type_display: "Behavior Change",
      responsible: "John Doe",
      is_overdue: true,
      created_at: "2025-08-15T10:00:00Z",
      updated_at: "2025-08-15T10:00:00Z",
    },
    {
      id: 4,
      initiative: 1,
      planned_date: "2026-06-01",
      actual_execution_date: null,
      description: "Full portal launch and economic impact measurement",
      milestone_type: "economic_impact_start",
      milestone_type_display: "Economic Impact Start",
      responsible: "John Doe",
      is_overdue: false,
      created_at: "2025-08-15T10:00:00Z",
      updated_at: "2025-08-15T10:00:00Z",
    },
  ],
  kpis: [
    {
      id: 1,
      initiative: 1,
      name: "Portal Customer Satisfaction (CSAT)",
      description:
        "Average customer satisfaction score for portal interactions, measured via post-interaction survey",
      formula: "Sum of ratings / Total responses",
      data_type: "numeric",
      data_type_display: "Numeric",
      periodicity: "monthly",
      periodicity_display: "Monthly",
      latest_value: { date: "2025-11-01", value: "4.1" },
      values_count: 4,
      created_at: "2025-08-15T10:00:00Z",
      updated_at: "2025-11-05T10:00:00Z",
    },
    {
      id: 2,
      initiative: 1,
      name: "Support Ticket Reduction",
      description:
        "Percentage reduction in support tickets originating from portal usability issues compared to baseline",
      formula: "(Baseline tickets - Current tickets) / Baseline tickets * 100",
      data_type: "numeric",
      data_type_display: "Numeric",
      periodicity: "monthly",
      periodicity_display: "Monthly",
      latest_value: { date: "2025-11-01", value: "28.5" },
      values_count: 3,
      created_at: "2025-08-15T10:00:00Z",
      updated_at: "2025-11-05T10:00:00Z",
    },
  ],
  cash_flows_count: 8,
  permissions: { can_edit: true, can_edit_financial: true },
  created_at: "2025-08-15T10:00:00Z",
  updated_at: "2025-11-15T16:00:00Z",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0";
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm">{children || <span className="text-muted-foreground">--</span>}</dd>
    </div>
  );
}

function BoolBadge({ value, label }: { value: boolean; label: string }) {
  return (
    <Badge variant={value ? "default" : "secondary"}>
      {value ? "Yes" : "No"} - {label}
    </Badge>
  );
}

function DataTypeBadge({ dataType }: { dataType: string }) {
  const colors: Record<string, string> = {
    estimate: "bg-amber-100 text-amber-800",
    projected: "bg-blue-100 text-blue-800",
    real: "bg-green-100 text-green-800",
    final: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[dataType] ?? "bg-gray-100 text-gray-800"}`}
    >
      {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tab: General
// ---------------------------------------------------------------------------

function GeneralTab({ data }: { data: InitiativeDetail }) {
  return (
    <div className="space-y-6">
      {/* Long text fields */}
      <div className="grid gap-6 md:grid-cols-2">
        <FieldRow label="Description">{data.description}</FieldRow>
        <FieldRow label="Current Situation">{data.current_situation}</FieldRow>
        <FieldRow label="What Needs to Change">
          {data.what_needs_to_change}
        </FieldRow>
        <FieldRow label="What Will Be Done">{data.what_will_be_done}</FieldRow>
      </div>

      <Separator />

      {/* Categorization */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FieldRow label="Workstream">
          {data.workstream_detail.name}
        </FieldRow>
        <FieldRow label="Strategic Objective">
          {data.strategic_objective_detail?.name ?? "--"}
        </FieldRow>
        <FieldRow label="Lead">{data.lead_detail.full_name}</FieldRow>
        <FieldRow label="Confirmed Lead">
          {data.confirmed_lead_detail?.full_name ?? "--"}
        </FieldRow>
        <FieldRow label="T-shirt Size">{data.tshirt_size}</FieldRow>
        <FieldRow label="Estimated Duration">
          {data.estimated_duration_display}
        </FieldRow>
        <FieldRow label="Affected Organization Unit">
          {data.affected_organization_unit_detail?.name ?? "--"}
        </FieldRow>
      </div>

      <Separator />

      {/* Requirements flags */}
      <div className="flex flex-wrap gap-2">
        <BoolBadge value={data.requires_it} label="IT" />
        <BoolBadge value={data.requires_hr} label="HR" />
        <BoolBadge value={data.requires_procurement} label="Procurement" />
      </div>

      <Separator />

      {/* Resources & risks */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FieldRow label="Required FTE">{data.required_fte}</FieldRow>
        <FieldRow label="Required Resources">
          {data.required_resources}
        </FieldRow>
        <FieldRow label="Required Investment">
          {formatCurrency(data.required_investment)}
        </FieldRow>
        <FieldRow label="Implementation Risks">
          {data.identified_implementation_risks}
        </FieldRow>
        <FieldRow label="Business Risks">
          {data.identified_business_risks}
        </FieldRow>
      </div>

      <Separator />

      {/* Timestamps */}
      <div className="grid gap-6 sm:grid-cols-2">
        <FieldRow label="Created">{formatDate(data.created_at)}</FieldRow>
        <FieldRow label="Updated">{formatDate(data.updated_at)}</FieldRow>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Financial
// ---------------------------------------------------------------------------

function FinancialCard({ fd }: { fd: FinancialData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DataTypeBadge dataType={fd.data_type} />
          <span className="text-muted-foreground text-xs font-normal">
            Updated {formatDate(fd.updated_at)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recurring impacts */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Recurring Impacts
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Revenue" value={fd.recurring_net_impact_revenue} />
            <MiniStat label="Costs" value={fd.recurring_net_impact_costs} />
            <MiniStat
              label="Cash Flow"
              value={fd.recurring_net_impact_cash_flow}
            />
            <MiniStat label="Profit" value={fd.recurring_net_impact_profit} />
          </div>
        </div>

        {/* One-time impacts */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            One-Time Impacts
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat
              label="Revenue"
              value={fd.one_time_net_impact_revenue}
            />
            <MiniStat label="Costs" value={fd.one_time_net_impact_costs} />
            <MiniStat
              label="Cash Flow"
              value={fd.one_time_net_impact_cash_flow}
            />
            <MiniStat label="Impl. Cost" value={fd.one_time_implementation_cost} />
          </div>
        </div>

        <Separator />

        {/* Annualized benefits */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Annualized Benefits
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            <MiniStat label="Year 1" value={fd.total_anualized_benefit_1} />
            <MiniStat label="Year 2" value={fd.total_anualized_benefit_2} />
            <MiniStat label="Year 3" value={fd.total_anualized_benefit_3} />
            <MiniStat label="Total Benefit" value={fd.total_benefit} highlight />
            <MiniStat label="ROI" value={`${fd.roi}%`} raw highlight />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  raw = false,
  highlight = false,
}: {
  label: string;
  value: string;
  raw?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-sm font-semibold ${highlight ? "text-primary" : ""}`}
      >
        {raw ? value : formatCurrency(value)}
      </p>
    </div>
  );
}

function FinancialTab({ data }: { data: FinancialData[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<DollarSign className="size-10 text-muted-foreground/50" />}
        message="No financial data recorded yet."
      />
    );
  }
  return (
    <div className="space-y-4">
      {data.map((fd) => (
        <FinancialCard key={fd.id} fd={fd} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Milestones
// ---------------------------------------------------------------------------

function MilestonesTab({ data }: { data: Milestone[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Target className="size-10 text-muted-foreground/50" />}
        message="No milestones defined yet."
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Planned Date</TableHead>
              <TableHead>Actual Date</TableHead>
              <TableHead>Responsible</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((m) => {
              const completed = m.actual_execution_date !== null;
              return (
                <TableRow
                  key={m.id}
                  className={
                    m.is_overdue && !completed
                      ? "bg-red-50 dark:bg-red-950/20"
                      : ""
                  }
                >
                  <TableCell>
                    <Badge variant="secondary">{m.milestone_type_display}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal">
                    {m.description}
                  </TableCell>
                  <TableCell>{formatDate(m.planned_date)}</TableCell>
                  <TableCell>
                    {m.actual_execution_date
                      ? formatDate(m.actual_execution_date)
                      : "--"}
                  </TableCell>
                  <TableCell>{m.responsible}</TableCell>
                  <TableCell>
                    {completed ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="size-4" />
                        Completed
                      </span>
                    ) : m.is_overdue ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <AlertTriangle className="size-4" />
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-4" />
                        Upcoming
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab: KPIs
// ---------------------------------------------------------------------------

function KPIsTab({ data }: { data: KPI[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="size-10 text-muted-foreground/50" />}
        message="No KPIs defined yet."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((kpi) => (
        <Card key={kpi.id}>
          <CardHeader>
            <CardTitle>{kpi.name}</CardTitle>
            <CardDescription>{kpi.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Formula">{kpi.formula}</FieldRow>
              <FieldRow label="Data Type">
                <Badge variant="secondary">{kpi.data_type_display}</Badge>
              </FieldRow>
              <FieldRow label="Periodicity">
                <Badge variant="outline">{kpi.periodicity_display}</Badge>
              </FieldRow>
              <FieldRow label="Values Recorded">{kpi.values_count}</FieldRow>
            </div>
            {kpi.latest_value && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Latest Value ({formatDate(kpi.latest_value.date)})
                </p>
                <p className="text-xl font-bold">{kpi.latest_value.value}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Cash Flow
// ---------------------------------------------------------------------------

function CashFlowTab({ count }: { count: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-8 justify-center">
        <FileText className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {count > 0
            ? `${count} cash flow record${count !== 1 ? "s" : ""}`
            : "No cash flow records"}
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      {icon}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function InitiativeDetailPage() {
  const params = useParams<{ id: string }>();
  const [initiative, setInitiative] = useState<InitiativeDetail>(DEMO_INITIATIVE);

  useEffect(() => {
    api
      .get<InitiativeDetail>(`/initiatives/${params.id}/`)
      .then((res) => setInitiative(res))
      .catch(() => {/* fall back to demo data */});
  }, [params.id]);

  const [transitionDialog, setTransitionDialog] = useState<{
    open: boolean;
    label: string;
    action: string;
    variant: "default" | "destructive";
  }>({ open: false, label: "", action: "", variant: "default" });

  const transitions = STATE_TRANSITIONS[initiative.idea_state] ?? [];

  function handleTransition(action: string) {
    api
      .post(`/initiatives/${initiative.id}/state-transition/`, { action })
      .then(() => {
        // Reload initiative data
        api.get<InitiativeDetail>(`/initiatives/${params.id}/`).then(setInitiative);
      })
      .catch(() => {/* ignore errors in demo mode */});
    setTransitionDialog((prev) => ({ ...prev, open: false }));
  }

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="space-y-4">
        <Link href="/initiatives" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="size-4" />
          All Initiatives
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {initiative.name}
            </h1>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: initiative.state_color.background,
                color: initiative.state_color.text,
              }}
            >
              {initiative.state_display}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {transitions.map((t) => (
              <Button
                key={t.action}
                variant={t.variant}
                size="sm"
                onClick={() =>
                  setTransitionDialog({
                    open: true,
                    label: t.label,
                    action: t.action,
                    variant: t.variant,
                  })
                }
              >
                {t.label}
              </Button>
            ))}
            {initiative.permissions.can_edit && (
              <Button variant="outline" size="sm">
                <Pencil className="size-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ---- State transition confirmation dialog ---- */}
      <Dialog
        open={transitionDialog.open}
        onOpenChange={(open) =>
          setTransitionDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {transitionDialog.label.toLowerCase()}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransitionDialog((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant={transitionDialog.variant}
              onClick={() => handleTransition(transitionDialog.action)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Tabs ---- */}
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab data={initiative} />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialTab data={initiative.financial_data} />
        </TabsContent>

        <TabsContent value="milestones">
          <MilestonesTab data={initiative.milestones} />
        </TabsContent>

        <TabsContent value="kpis">
          <KPIsTab data={initiative.kpis} />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowTab count={initiative.cash_flows_count} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
