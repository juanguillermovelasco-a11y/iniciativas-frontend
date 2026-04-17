"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  STATE_STYLES,
  type InitiativeState,
  type InitiativeListItem,
  type ExecutiveSummary,
} from "@/lib/types/initiative";
import { api } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function stateLabel(state: InitiativeState): string {
  return state
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_BURN_RATE_DATA = [
  { month: "Jan", expenses: 185000, income: 210000, net: 25000 },
  { month: "Feb", expenses: 192000, income: 225000, net: 33000 },
  { month: "Mar", expenses: 205000, income: 248000, net: 43000 },
  { month: "Apr", expenses: 198000, income: 260000, net: 62000 },
  { month: "May", expenses: 218000, income: 275000, net: 57000 },
  { month: "Jun", expenses: 225000, income: 290000, net: 65000 },
  { month: "Jul", expenses: 210000, income: 305000, net: 95000 },
  { month: "Aug", expenses: 232000, income: 318000, net: 86000 },
  { month: "Sep", expenses: 240000, income: 330000, net: 90000 },
  { month: "Oct", expenses: 245000, income: 352000, net: 107000 },
  { month: "Nov", expenses: 238000, income: 365000, net: 127000 },
  { month: "Dec", expenses: 252000, income: 390000, net: 138000 },
];

const DEMO_WATERFALL_DATA = [
  { month: "Jan", cashIn: 210000, cashOut: -185000, cumulative: 25000 },
  { month: "Feb", cashIn: 225000, cashOut: -192000, cumulative: 58000 },
  { month: "Mar", cashIn: 248000, cashOut: -205000, cumulative: 101000 },
  { month: "Apr", cashIn: 260000, cashOut: -198000, cumulative: 163000 },
  { month: "May", cashIn: 275000, cashOut: -218000, cumulative: 220000 },
  { month: "Jun", cashIn: 290000, cashOut: -225000, cumulative: 285000 },
  { month: "Jul", cashIn: 305000, cashOut: -210000, cumulative: 380000 },
  { month: "Aug", cashIn: 318000, cashOut: -232000, cumulative: 466000 },
  { month: "Sep", cashIn: 330000, cashOut: -240000, cumulative: 556000 },
  { month: "Oct", cashIn: 352000, cashOut: -245000, cumulative: 663000 },
  { month: "Nov", cashIn: 365000, cashOut: -238000, cumulative: 790000 },
  { month: "Dec", cashIn: 390000, cashOut: -252000, cumulative: 928000 },
];

interface VarianceRow {
  id: number;
  name: string;
  workstream: string;
  state: InitiativeState;
  estimate: number;
  projected: number;
  real: number;
  variance: number;
  roi: number;
}

const DEMO_VARIANCE_DATA: VarianceRow[] = [
  { id: 1, name: "ERP Migration", workstream: "Digital Transformation", state: "planned", estimate: 420000, projected: 480000, real: 465000, variance: -3.1, roi: 142 },
  { id: 2, name: "Supply Chain Optimization", workstream: "Operational Excellence", state: "executed", estimate: 310000, projected: 340000, real: 368000, variance: 8.2, roi: 187 },
  { id: 3, name: "Customer Portal v2", workstream: "Customer Experience", state: "viable", estimate: 275000, projected: 295000, real: 258000, variance: -12.5, roi: 96 },
  { id: 4, name: "Cloud Infrastructure", workstream: "Digital Transformation", state: "validated", estimate: 380000, projected: 420000, real: 410000, variance: -2.4, roi: 165 },
  { id: 5, name: "Process Automation", workstream: "Operational Excellence", state: "planned", estimate: 195000, projected: 230000, real: 245000, variance: 6.5, roi: 210 },
  { id: 6, name: "Data Analytics Platform", workstream: "Digital Transformation", state: "viable", estimate: 340000, projected: 380000, real: 352000, variance: -7.4, roi: 128 },
  { id: 7, name: "Sustainability Reporting", workstream: "Sustainability", state: "draft", estimate: 145000, projected: 160000, real: 172000, variance: 7.5, roi: 115 },
  { id: 8, name: "CRM Enhancement", workstream: "Customer Experience", state: "executed", estimate: 220000, projected: 260000, real: 235000, variance: -9.6, roi: 155 },
  { id: 9, name: "Energy Management System", workstream: "Sustainability", state: "validated", estimate: 168000, projected: 190000, real: 178000, variance: -6.3, roi: 134 },
  { id: 10, name: "Warehouse Robotics", workstream: "Operational Excellence", state: "viable", estimate: 285000, projected: 350000, real: 320000, variance: -8.6, roi: 198 },
];

const DEMO_ANNUALIZED_DATA = [
  { workstream: "Digital Transformation", year1: 680000, year2: 1150000, year3: 1420000 },
  { workstream: "Operational Excellence", year1: 490000, year2: 820000, year3: 1080000 },
  { workstream: "Customer Experience", year1: 320000, year2: 580000, year3: 760000 },
  { workstream: "Sustainability", year1: 210000, year2: 410000, year3: 590000 },
];

// ---------------------------------------------------------------------------
// Sort types
// ---------------------------------------------------------------------------

type SortField = keyof VarianceRow;
type SortDir = "asc" | "desc" | null;

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 text-xs shadow-xl ring-1 ring-foreground/5">
      <p className="mb-1.5 font-semibold text-card-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-card-foreground tabular-nums">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sort indicator
// ---------------------------------------------------------------------------

function SortIcon({
  field,
  activeField,
  dir,
}: {
  field: SortField;
  activeField: SortField | null;
  dir: SortDir;
}) {
  if (activeField !== field)
    return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 opacity-30" />;
  if (dir === "asc")
    return <ChevronUp className="ml-1 inline h-3.5 w-3.5" />;
  return <ChevronDown className="ml-1 inline h-3.5 w-3.5" />;
}

// ---------------------------------------------------------------------------
// Build chart data from API executive summary
// ---------------------------------------------------------------------------

function buildBurnRateFromApi(
  summary: ExecutiveSummary
): typeof DEMO_BURN_RATE_DATA {
  const cf = summary.cash_flow_monthly;
  if (!cf || !cf.labels || cf.labels.length === 0) return DEMO_BURN_RATE_DATA;

  return cf.labels.map((label, i) => {
    const income = parseFloat(cf.income[i] || "0");
    const expenses = Math.abs(parseFloat(cf.expenses[i] || "0"));
    const net = parseFloat(cf.net_flow[i] || "0");
    return { month: label, income, expenses, net };
  });
}

function buildWaterfallFromApi(
  summary: ExecutiveSummary
): typeof DEMO_WATERFALL_DATA {
  const cf = summary.cash_flow_monthly;
  if (!cf || !cf.labels || cf.labels.length === 0) return DEMO_WATERFALL_DATA;

  let cumulative = 0;
  return cf.labels.map((label, i) => {
    const cashIn = parseFloat(cf.income[i] || "0");
    const cashOut = -Math.abs(parseFloat(cf.expenses[i] || "0"));
    cumulative += cashIn + cashOut;
    return { month: label, cashIn, cashOut, cumulative };
  });
}

function buildAnnualizedFromApi(
  summary: ExecutiveSummary
): typeof DEMO_ANNUALIZED_DATA {
  if (!summary.annualized_benefits || summary.annualized_benefits.length === 0) {
    return DEMO_ANNUALIZED_DATA;
  }
  // Map annualized benefits to workstream breakdown if benefit_by_workstream available
  if (summary.benefit_by_workstream && summary.benefit_by_workstream.length > 0) {
    return summary.benefit_by_workstream.map((ws) => {
      const total = parseFloat(ws.total_benefit || "0");
      return {
        workstream: ws.workstream,
        year1: Math.round(total * 0.4),
        year2: Math.round(total * 0.7),
        year3: total,
      };
    });
  }
  return DEMO_ANNUALIZED_DATA;
}

function buildVarianceFromApi(
  apiItems: InitiativeListItem[]
): VarianceRow[] {
  if (apiItems.length === 0) return DEMO_VARIANCE_DATA;

  return apiItems.slice(0, 16).map((item, idx) => {
    // Reuse demo financial values but overlay real initiative info
    const demo = DEMO_VARIANCE_DATA[idx % DEMO_VARIANCE_DATA.length];
    const totalBenefit = parseFloat(item.total_benefit || "0");
    return {
      id: item.id,
      name: item.name,
      workstream: item.workstream_name,
      state: item.idea_state,
      estimate: totalBenefit > 0 ? Math.round(totalBenefit * 0.85) : demo.estimate,
      projected: totalBenefit > 0 ? Math.round(totalBenefit * 1.1) : demo.projected,
      real: totalBenefit > 0 ? Math.round(totalBenefit) : demo.real,
      variance: demo.variance,
      roi: demo.roi,
    };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FinancialControllerPage() {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  // Chart data state
  const [burnRateData, setBurnRateData] = useState(DEMO_BURN_RATE_DATA);
  const [waterfallData, setWaterfallData] = useState(DEMO_WATERFALL_DATA);
  const [annualizedData, setAnnualizedData] = useState(DEMO_ANNUALIZED_DATA);
  const [varianceData, setVarianceData] = useState<VarianceRow[]>(DEMO_VARIANCE_DATA);
  const [totalBenefits, setTotalBenefits] = useState<string | null>(null);

  // Fetch live data
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [summaryRes, initiativesRes] = await Promise.allSettled([
          api.get<ExecutiveSummary>("/dashboard/executive-summary/"),
          api.get<PaginatedResponse<InitiativeListItem>>("/initiatives/?page_size=100"),
        ]);

        if (cancelled) return;

        let gotLiveData = false;

        if (summaryRes.status === "fulfilled") {
          const summary = summaryRes.value;
          setBurnRateData(buildBurnRateFromApi(summary));
          setWaterfallData(buildWaterfallFromApi(summary));
          setAnnualizedData(buildAnnualizedFromApi(summary));
          if (summary.total_benefits) {
            setTotalBenefits(summary.total_benefits);
          }
          gotLiveData = true;
        }

        if (initiativesRes.status === "fulfilled" && initiativesRes.value.results.length > 0) {
          setVarianceData(buildVarianceFromApi(initiativesRes.value.results));
          gotLiveData = true;
        }

        if (gotLiveData) setIsDemo(false);
      } catch {
        // API unreachable - keep demo data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Toggle sort on header click
  function handleSort(field: SortField) {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortField(null);
        setSortDir(null);
      }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const sortedVarianceData = useMemo(() => {
    if (!sortField || !sortDir) return varianceData;
    return [...varianceData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [varianceData, sortField, sortDir]);

  // Summary KPIs
  const totalEstimated = useMemo(
    () => varianceData.reduce((sum, r) => sum + r.estimate, 0),
    [varianceData]
  );
  const totalProjected = useMemo(
    () => varianceData.reduce((sum, r) => sum + r.projected, 0),
    [varianceData]
  );
  const totalReal = useMemo(
    () => varianceData.reduce((sum, r) => sum + r.real, 0),
    [varianceData]
  );
  const variancePct = totalProjected > 0
    ? ((totalReal - totalProjected) / totalProjected) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Financial Controller
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Portfolio financial health and variance analysis
            {isDemo && (
              <span className="ml-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                (demo data)
              </span>
            )}
            {!isDemo && (
              <span className="ml-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                (demo variance/ROI)
              </span>
            )}
            {loading && (
              <Loader2 className="inline-block ml-2 size-3.5 animate-spin text-muted-foreground" />
            )}
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold shadow-sm">
          FY 2025-26
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* OVERVIEW TAB                                                      */}
        {/* ================================================================ */}
        <TabsContent value="overview">
          <div className="space-y-6 pt-2">
            {/* --- Budget vs Actual KPI Cards --- */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Estimated Benefits */}
              <Card className="shadow-sm border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Estimated
                      </p>
                      <p className="text-3xl font-bold tracking-tight tabular-nums">
                        {formatCurrency(totalEstimated)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5 text-[var(--success)]" />
                        <span>Baseline target</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Projected Benefits */}
              <Card className="shadow-sm border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Projected
                      </p>
                      <p className="text-3xl font-bold tracking-tight tabular-nums">
                        {formatCurrency(totalProjected)}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--success)]" />
                        <span className="text-[var(--success)] font-medium">
                          +{(((totalProjected - totalEstimated) / totalEstimated) * 100).toFixed(1)}% vs estimate
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[var(--success)]/10 p-2.5 text-[var(--success)]">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Real Benefits */}
              <Card className="shadow-sm border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Real
                        {totalBenefits && !isDemo && (
                          <span className="ml-1 text-[10px] text-foreground/50 normal-case tracking-normal font-normal">
                            (live)
                          </span>
                        )}
                      </p>
                      <p className="text-3xl font-bold tracking-tight tabular-nums">
                        {totalBenefits && !isDemo
                          ? formatCurrency(parseFloat(totalBenefits))
                          : formatCurrency(totalReal)}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--success)]" />
                        <span className="text-[var(--success)] font-medium">
                          +{(((totalReal - totalEstimated) / totalEstimated) * 100).toFixed(1)}% vs estimate
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variance */}
              <Card className="shadow-sm border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Variance
                      </p>
                      <p className="text-3xl font-bold tracking-tight tabular-nums text-[var(--danger)]">
                        {formatPct(variancePct)}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        <ArrowDownRight className="h-3.5 w-3.5 text-[var(--danger)]" />
                        <span className="text-[var(--danger)] font-medium">
                          {formatCurrency(totalReal - totalProjected)} shortfall
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[var(--danger)]/10 p-2.5 text-[var(--danger)]">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- Charts Row --- */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Burn Rate Chart */}
              <Card className="shadow-md border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Burn Rate & Income Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={burnRateData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.6 0.18 145)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="oklch(0.6 0.18 145)" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.6 0.2 25)" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="oklch(0.6 0.2 25)" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => formatCurrency(v)}
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="income"
                          stroke="oklch(0.6 0.18 145)"
                          strokeWidth={2}
                          fill="url(#gradIncome)"
                          name="Income"
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          stroke="oklch(0.6 0.2 25)"
                          strokeWidth={2}
                          fill="url(#gradExpenses)"
                          name="Expenses"
                        />
                        <Area
                          type="monotone"
                          dataKey="net"
                          stroke="oklch(0.55 0.15 150)"
                          strokeWidth={2.5}
                          strokeDasharray="6 3"
                          fill="none"
                          name="Net Flow"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Cash Flow Waterfall */}
              <Card className="shadow-md border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Cash Flow Waterfall
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={waterfallData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v) => formatCurrency(v)}
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                        />
                        <Bar
                          dataKey="cashIn"
                          name="Cash In"
                          fill="oklch(0.6 0.18 145)"
                          radius={[3, 3, 0, 0]}
                          opacity={0.85}
                        />
                        <Bar
                          dataKey="cashOut"
                          name="Cash Out"
                          fill="oklch(0.6 0.2 25)"
                          radius={[3, 3, 0, 0]}
                          opacity={0.85}
                        />
                        <Line
                          type="monotone"
                          dataKey="cumulative"
                          name="Cumulative"
                          stroke="oklch(0.55 0.15 150)"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "oklch(0.55 0.15 150)" }}
                          activeDot={{ r: 5 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* DETAILS TAB                                                       */}
        {/* ================================================================ */}
        <TabsContent value="details">
          <div className="space-y-6 pt-2">
            {/* --- Variance Analysis Table --- */}
            <Card className="shadow-md border-border/50">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-base font-semibold">
                  Variance Analysis by Initiative
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>
                          <button
                            className="inline-flex items-center hover:text-foreground transition-colors text-xs font-semibold"
                            onClick={() => handleSort("name")}
                          >
                            Initiative
                            <SortIcon field="name" activeField={sortField} dir={sortDir} />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            className="inline-flex items-center hover:text-foreground transition-colors text-xs font-semibold"
                            onClick={() => handleSort("workstream")}
                          >
                            Workstream
                            <SortIcon field="workstream" activeField={sortField} dir={sortDir} />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">
                          <button
                            className="inline-flex items-center hover:text-foreground transition-colors text-xs font-semibold"
                            onClick={() => handleSort("estimate")}
                          >
                            Estimate
                            <SortIcon field="estimate" activeField={sortField} dir={sortDir} />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">
                          <button
                            className="inline-flex items-center hover:text-foreground transition-colors text-xs font-semibold"
                            onClick={() => handleSort("projected")}
                          >
                            Projected
                            <SortIcon field="projected" activeField={sortField} dir={sortDir} />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">
                          <button
                            className="inline-flex items-center hover:text-foreground transition-colors text-xs font-semibold"
                            onClick={() => handleSort("real")}
                          >
                            Real
                            <SortIcon field="real" activeField={sortField} dir={sortDir} />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">
                          <button
                            className="inline-flex items-center hover:text-foreground transition-colors text-xs font-semibold"
                            onClick={() => handleSort("variance")}
                          >
                            Variance
                            <SortIcon field="variance" activeField={sortField} dir={sortDir} />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">
                          <button
                            className="inline-flex items-center hover:text-foreground transition-colors text-xs font-semibold"
                            onClick={() => handleSort("roi")}
                          >
                            ROI
                            <SortIcon field="roi" activeField={sortField} dir={sortDir} />
                          </button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedVarianceData.map((row) => {
                        const style = STATE_STYLES[row.state];
                        return (
                          <TableRow key={row.id} className="hover:bg-muted/15">
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-[13px]">{row.name}</span>
                                {style && (
                                  <Badge
                                    className="w-fit h-[16px] rounded px-1.5 text-[9px] font-semibold uppercase tracking-wider"
                                    style={{
                                      background: style.background,
                                      color: style.text,
                                      borderColor: "transparent",
                                    }}
                                  >
                                    {stateLabel(row.state)}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground font-medium">
                                {row.workstream}
                              </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              {formatCurrency(row.estimate)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              {formatCurrency(row.projected)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              {formatCurrency(row.real)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              <span
                                className={
                                  row.variance >= 0
                                    ? "text-[var(--success)] font-semibold"
                                    : "text-[var(--danger)] font-semibold"
                                }
                              >
                                {formatPct(row.variance)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              <span
                                className={
                                  row.roi >= 150
                                    ? "text-[var(--success)] font-semibold"
                                    : row.roi >= 100
                                      ? "text-foreground font-semibold"
                                      : "text-[var(--danger)] font-semibold"
                                }
                              >
                                {row.roi}%
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* --- Annualized Benefits by Workstream --- */}
            <Card className="shadow-md border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Annualized Benefits by Workstream
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={annualizedData}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis
                        dataKey="workstream"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => formatCurrency(v)}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      />
                      <Bar
                        dataKey="year1"
                        name="Year 1"
                        fill="oklch(0.55 0.15 150)"
                        radius={[3, 3, 0, 0]}
                      />
                      <Bar
                        dataKey="year2"
                        name="Year 2"
                        fill="oklch(0.65 0.12 200)"
                        radius={[3, 3, 0, 0]}
                      />
                      <Bar
                        dataKey="year3"
                        name="Year 3"
                        fill="oklch(0.7 0.1 280)"
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
