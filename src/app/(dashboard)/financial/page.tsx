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
  Cell,
  LineChart,
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
  Target,
  Clock,
  PieChart,
  AlertTriangle,
  Shield,
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
  STATE_STYLES,
  type InitiativeState,
  type ExecutiveSummary,
  type BenefitRealizationData,
  type ROIDistributionData,
  type InvestmentByWorkstreamData,
  type MilestoneSlipData,
  type RiskExposureData,
} from "@/lib/types/initiative";
import { api } from "@/lib/api/client";

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
  return state.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-card-foreground tabular-nums">
            {typeof entry.value === "number" && Math.abs(entry.value) > 100
              ? formatCurrency(entry.value)
              : `${entry.value}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sort types & helpers
// ---------------------------------------------------------------------------

interface VarianceRow {
  id: number;
  name: string;
  workstream: string;
  state: InitiativeState;
  estimate: number;
  projected: number;
  real: number;
  final: number;
  variance: number;
  roi: number;
}

type SortField = keyof VarianceRow;
type SortDir = "asc" | "desc" | null;

function SortIcon({ field, activeField, dir }: { field: SortField; activeField: SortField | null; dir: SortDir }) {
  if (activeField !== field) return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 opacity-30" />;
  if (dir === "asc") return <ChevronUp className="ml-1 inline h-3.5 w-3.5" />;
  return <ChevronDown className="ml-1 inline h-3.5 w-3.5" />;
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

const TABS = [
  { key: "overview", label: "Overview", icon: DollarSign },
  { key: "realization", label: "Benefit Realization", icon: Target },
  { key: "investment", label: "Investment & ROI", icon: PieChart },
  { key: "execution", label: "Execution Quality", icon: Clock },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FinancialControllerPage() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  // API data
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [realization, setRealization] = useState<BenefitRealizationData | null>(null);
  const [roiDist, setRoiDist] = useState<ROIDistributionData | null>(null);
  const [investment, setInvestment] = useState<InvestmentByWorkstreamData | null>(null);
  const [milestoneSlip, setMilestoneSlip] = useState<MilestoneSlipData | null>(null);
  const [riskExposure, setRiskExposure] = useState<RiskExposureData | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const results = await Promise.allSettled([
          api.get<ExecutiveSummary>("/dashboard/executive-summary/"),
          api.get<BenefitRealizationData>("/dashboard/benefit-realization/"),
          api.get<ROIDistributionData>("/dashboard/roi-distribution/"),
          api.get<InvestmentByWorkstreamData>("/dashboard/investment-by-workstream/"),
          api.get<MilestoneSlipData>("/dashboard/milestone-slip/"),
          api.get<RiskExposureData>("/dashboard/risk-exposure/"),
        ]);
        if (cancelled) return;

        if (results[0].status === "fulfilled") setSummary(results[0].value);
        if (results[1].status === "fulfilled") setRealization(results[1].value);
        if (results[2].status === "fulfilled") setRoiDist(results[2].value);
        if (results[3].status === "fulfilled") setInvestment(results[3].value);
        if (results[4].status === "fulfilled") setMilestoneSlip(results[4].value);
        if (results[5].status === "fulfilled") setRiskExposure(results[5].value);

        if (results.some((r) => r.status === "fulfilled")) setIsDemo(false);
      } catch { /* keep demo */ }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  // Burn rate from executive summary
  const burnRateData = useMemo(() => {
    if (!summary?.cash_flow_monthly?.labels?.length) return [];
    const cf = summary.cash_flow_monthly;
    return cf.labels.map((label, i) => ({
      month: label,
      income: parseFloat(cf.income[i] || "0"),
      expenses: Math.abs(parseFloat(cf.expenses[i] || "0")),
      net: parseFloat(cf.net_flow[i] || "0"),
    }));
  }, [summary]);

  // Waterfall from summary
  const waterfallData = useMemo(() => {
    if (!summary?.cash_flow_monthly?.labels?.length) return [];
    const cf = summary.cash_flow_monthly;
    let cum = 0;
    return cf.labels.map((label, i) => {
      const cashIn = parseFloat(cf.income[i] || "0");
      const cashOut = -Math.abs(parseFloat(cf.expenses[i] || "0"));
      cum += cashIn + cashOut;
      return { month: label, cashIn, cashOut, cumulative: cum };
    });
  }, [summary]);

  // Break-even from cumulative cash flow
  const breakEvenData = useMemo(() => {
    if (!summary?.cumulative_cash_flow?.length) return [];
    return summary.cumulative_cash_flow.map((d) => ({
      month: d.month,
      income: parseFloat(d.cumulative_income),
      expenses: parseFloat(d.cumulative_expenses),
    }));
  }, [summary]);

  // Variance table from benefit realization
  const varianceData: VarianceRow[] = useMemo(() => {
    if (!realization?.initiatives?.length) return [];
    return realization.initiatives.map((init) => {
      const est = parseFloat(init.estimate.total_benefit);
      const proj = parseFloat(init.projected.total_benefit);
      const real = parseFloat(init.real.total_benefit);
      const fin = parseFloat(init.final.total_benefit);
      const bestReal = fin > 0 ? fin : real > 0 ? real : proj;
      const variance = est > 0 ? ((bestReal - est) / est) * 100 : 0;
      const roi = parseFloat(init.estimate.roi) || 0;
      return {
        id: init.id, name: init.name, workstream: init.workstream, state: init.state,
        estimate: est, projected: proj, real, final: fin, variance: Math.round(variance * 10) / 10, roi,
      };
    });
  }, [realization]);

  // Investment chart data
  const investmentChartData = useMemo(() => {
    if (!investment?.workstreams?.length) return [];
    return investment.workstreams.map((ws) => ({
      name: ws.workstream || "",
      ...Object.fromEntries(
        (investment.state_groups || []).map((g) => [g, parseFloat(ws[g] || "0")])
      ),
      total: parseFloat(ws.total || "0"),
    }));
  }, [investment]);

  // ROI histogram
  const roiChartData = useMemo(() => {
    if (!roiDist?.buckets) return [];
    return roiDist.buckets.map((b) => ({ label: b.label, count: b.count }));
  }, [roiDist]);

  // Milestone slip histogram
  const slipChartData = useMemo(() => {
    if (!milestoneSlip?.buckets) return [];
    return milestoneSlip.buckets.map((b) => ({
      label: b.label,
      count: b.count,
      color: b.label.includes("early") ? "oklch(0.6 0.18 145)" : b.label === "On time" ? "oklch(0.55 0.15 150)" : "oklch(0.6 0.2 25)",
    }));
  }, [milestoneSlip]);

  // Sort
  function handleSort(field: SortField) {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortField(null); setSortDir(null); }
    } else { setSortField(field); setSortDir("asc"); }
  }

  const sortedVariance = useMemo(() => {
    if (!sortField || !sortDir) return varianceData;
    return [...varianceData].sort((a, b) => {
      const aVal = a[sortField]; const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      return sortDir === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
  }, [varianceData, sortField, sortDir]);

  // Summary KPIs
  const totals = realization?.totals;
  const totalEst = parseFloat(totals?.estimate_benefit || "0");
  const totalProj = parseFloat(totals?.projected_benefit || "0");
  const totalReal = parseFloat(totals?.real_benefit || "0");
  const totalFinal = parseFloat(totals?.final_benefit || "0");
  const variancePct = totals?.variance_estimate_to_real_pct ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Controller</h1>
          <p className="text-sm text-muted-foreground">
            Portfolio financial health and variance analysis
            {isDemo && <span className="ml-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">(demo data)</span>}
            {loading && <Loader2 className="inline-block ml-2 size-3.5 animate-spin text-muted-foreground" />}
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold shadow-sm">FY 2025-26</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm"><CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Estimated</p>
              <p className="text-3xl font-bold tabular-nums mt-1">{formatCurrency(totalEst)}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><TrendingUp className="h-3.5 w-3.5" /> Baseline target</div>
            </CardContent></Card>

            <Card className="shadow-sm"><CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Projected</p>
              <p className="text-3xl font-bold tabular-nums mt-1">{formatCurrency(totalProj)}</p>
              <div className="flex items-center gap-1 text-xs mt-1">
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--success)]" />
                <span className="text-[var(--success)] font-medium">{totalEst > 0 ? formatPct(((totalProj - totalEst) / totalEst) * 100) : "N/A"} vs est.</span>
              </div>
            </CardContent></Card>

            <Card className="shadow-sm"><CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Real</p>
              <p className="text-3xl font-bold tabular-nums mt-1">{formatCurrency(totalReal)}</p>
              <div className="flex items-center gap-1 text-xs mt-1">
                {totalReal >= totalEst ? <ArrowUpRight className="h-3.5 w-3.5 text-[var(--success)]" /> : <ArrowDownRight className="h-3.5 w-3.5 text-[var(--danger)]" />}
                <span className={totalReal >= totalEst ? "text-[var(--success)] font-medium" : "text-[var(--danger)] font-medium"}>
                  {totalEst > 0 ? formatPct(((totalReal - totalEst) / totalEst) * 100) : "N/A"} vs est.
                </span>
              </div>
            </CardContent></Card>

            <Card className="shadow-sm"><CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Variance (Est → Real)</p>
              <p className={`text-3xl font-bold tabular-nums mt-1 ${variancePct >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                {formatPct(variancePct)}
              </p>
              <div className="flex items-center gap-1 text-xs mt-1">
                <TrendingDown className="h-3.5 w-3.5 text-[var(--danger)]" />
                <span className="text-[var(--danger)] font-medium">{formatCurrency(totalReal - totalEst)}</span>
              </div>
            </CardContent></Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Burn Rate */}
            <Card className="shadow-md">
              <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Burn Rate & Income Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  {burnRateData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={burnRateData}>
                        <defs>
                          <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.6 0.18 145)" stopOpacity={0.3} /><stop offset="100%" stopColor="oklch(0.6 0.18 145)" stopOpacity={0.02} /></linearGradient>
                          <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.6 0.2 25)" stopOpacity={0.25} /><stop offset="100%" stopColor="oklch(0.6 0.2 25)" stopOpacity={0.02} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} width={55} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="income" stroke="oklch(0.6 0.18 145)" fill="url(#gi)" strokeWidth={2} name="Income" />
                        <Area type="monotone" dataKey="expenses" stroke="oklch(0.6 0.2 25)" fill="url(#ge)" strokeWidth={2} name="Expenses" />
                        <Area type="monotone" dataKey="net" stroke="oklch(0.55 0.15 150)" strokeWidth={2.5} strokeDasharray="6 3" fill="none" name="Net Flow" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <div className="flex h-full items-center justify-center text-muted-foreground">No cash flow data</div>}
                </div>
              </CardContent>
            </Card>

            {/* Waterfall */}
            <Card className="shadow-md">
              <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Cash Flow Waterfall</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  {waterfallData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={waterfallData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} width={55} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="cashIn" name="Cash In" fill="oklch(0.6 0.18 145)" radius={[3, 3, 0, 0]} opacity={0.85} />
                        <Bar dataKey="cashOut" name="Cash Out" fill="oklch(0.6 0.2 25)" radius={[3, 3, 0, 0]} opacity={0.85} />
                        <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke="oklch(0.55 0.15 150)" strokeWidth={2.5} dot={{ r: 2 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : <div className="flex h-full items-center justify-center text-muted-foreground">No cash flow data</div>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Break-Even Analysis */}
          {breakEvenData.length > 0 && (
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Break-Even Analysis — Cumulative Income vs Expenses</CardTitle>
                <p className="text-xs text-muted-foreground">Where the lines cross = portfolio break-even point</p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={breakEvenData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} width={55} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="income" name="Cumulative Income" stroke="oklch(0.6 0.18 145)" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="expenses" name="Cumulative Expenses" stroke="oklch(0.6 0.2 25)" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ===== BENEFIT REALIZATION TAB ===== */}
      {tab === "realization" && (
        <div className="space-y-6">
          {/* Grouped Bar: Estimate vs Projected vs Real vs Final per initiative */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Benefit Realization — Estimate vs Projected vs Real vs Final</CardTitle>
              <p className="text-xs text-muted-foreground">The investment committee chart — how estimates track to reality</p>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {varianceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={varianceData.slice(0, 12)} margin={{ bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} width={55} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="estimate" name="Estimate" fill="#999933" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="projected" name="Projected" fill="#006633" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="real" name="Real" fill="#003366" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="final" name="Final" fill="#0000CC" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="flex h-full items-center justify-center text-muted-foreground">No realization data</div>}
              </div>
            </CardContent>
          </Card>

          {/* Variance Table */}
          <Card className="shadow-md">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-base font-semibold">Variance Analysis by Initiative</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {(["name", "workstream", "estimate", "projected", "real", "variance", "roi"] as SortField[]).map((f) => (
                        <TableHead key={f} className={f !== "name" && f !== "workstream" ? "text-right" : ""}>
                          <button className="inline-flex items-center hover:text-foreground transition-colors text-xs font-semibold" onClick={() => handleSort(f)}>
                            {f === "name" ? "Initiative" : f.charAt(0).toUpperCase() + f.slice(1)}
                            <SortIcon field={f} activeField={sortField} dir={sortDir} />
                          </button>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedVariance.map((row) => {
                      const style = STATE_STYLES[row.state];
                      return (
                        <TableRow key={row.id} className="hover:bg-muted/15">
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-[13px]">{row.name}</span>
                              {style && (
                                <Badge className="w-fit h-4 rounded px-1.5 text-[9px] font-semibold uppercase"
                                  style={{ background: style.background, color: style.text, borderColor: "transparent" }}>
                                  {stateLabel(row.state)}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{row.workstream}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{formatCurrency(row.estimate)}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{formatCurrency(row.projected)}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{formatCurrency(row.real)}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span className={row.variance >= 0 ? "text-[var(--success)] font-semibold" : "text-[var(--danger)] font-semibold"}>
                              {formatPct(row.variance)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span className={row.roi >= 150 ? "text-[var(--success)] font-semibold" : row.roi >= 100 ? "font-semibold" : "text-[var(--danger)] font-semibold"}>
                              {row.roi > 0 ? `${row.roi}%` : "—"}
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
        </div>
      )}

      {/* ===== INVESTMENT & ROI TAB ===== */}
      {tab === "investment" && (
        <div className="space-y-6">
          {/* Investment by Workstream */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Required Investment by Workstream</CardTitle>
              <p className="text-xs text-muted-foreground">Total required_investment per workstream, stacked by lifecycle stage</p>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {investmentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={investmentChartData} margin={{ bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} width={55} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      {(investment?.state_groups || []).map((g, i) => {
                        const colors = ["#003366", "#666699", "#6699CC", "#3366CC", "#006666", "#0000CC"];
                        return <Bar key={g} dataKey={g} stackId="a" name={g} fill={colors[i % colors.length]} />;
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="flex h-full items-center justify-center text-muted-foreground">No investment data</div>}
              </div>
            </CardContent>
          </Card>

          {/* ROI Distribution */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">ROI Distribution</CardTitle>
                <p className="text-xs text-muted-foreground">
                  How many initiatives fall in each ROI bucket
                  {roiDist && ` · Avg: ${roiDist.avg_roi}% · Median: ${roiDist.median_roi}%`}
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {roiChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roiChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Initiatives" radius={[4, 4, 0, 0]}>
                          {roiChartData.map((_, i) => (
                            <Cell key={i} fill={i < 2 ? "oklch(0.6 0.2 25)" : i < 4 ? "oklch(0.75 0.15 65)" : "oklch(0.6 0.18 145)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="flex h-full items-center justify-center text-muted-foreground">No ROI data (run cash flow analysis first)</div>}
                </div>
              </CardContent>
            </Card>

            {/* ROI KPI cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 content-start">
              <Card className="shadow-sm"><CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Avg ROI</p>
                <p className="text-3xl font-bold tabular-nums mt-1">{roiDist?.avg_roi ?? 0}%</p>
              </CardContent></Card>
              <Card className="shadow-sm"><CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Median ROI</p>
                <p className="text-3xl font-bold tabular-nums mt-1">{roiDist?.median_roi ?? 0}%</p>
              </CardContent></Card>
              <Card className="shadow-sm"><CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Total Portfolio Benefits</p>
                <p className="text-3xl font-bold tabular-nums mt-1">{formatCurrency(totalEst + totalProj + totalReal)}</p>
              </CardContent></Card>
              <Card className="shadow-sm"><CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Total Investment</p>
                <p className="text-3xl font-bold tabular-nums mt-1">{summary ? formatCurrency(parseFloat(summary.total_investment)) : "$0"}</p>
              </CardContent></Card>
            </div>
          </div>
        </div>
      )}

      {/* ===== EXECUTION QUALITY TAB ===== */}
      {tab === "execution" && (
        <div className="space-y-6">
          {/* Milestone Slip KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Card className="shadow-sm"><CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Milestones</p>
              <p className="text-3xl font-bold tabular-nums mt-1">{milestoneSlip?.total_milestones ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed milestones analyzed</p>
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Avg Slip</p>
              <p className={`text-3xl font-bold tabular-nums mt-1 ${(milestoneSlip?.avg_slip_days ?? 0) > 7 ? "text-[var(--danger)]" : ""}`}>
                {milestoneSlip?.avg_slip_days ?? 0}d
              </p>
              <p className="text-xs text-muted-foreground mt-1">Average days late</p>
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Median Slip</p>
              <p className="text-3xl font-bold tabular-nums mt-1">{milestoneSlip?.median_slip_days ?? 0}d</p>
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase">On-Time %</p>
              <p className={`text-3xl font-bold tabular-nums mt-1 ${(milestoneSlip?.on_time_percentage ?? 0) >= 70 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                {milestoneSlip?.on_time_percentage ?? 0}%
              </p>
            </CardContent></Card>
          </div>

          {/* Slip Histogram */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Milestone Slip Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">Distribution of (actual − planned) days for completed milestones. Green = early, red = late.</p>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                {slipChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={slipChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Milestones" radius={[4, 4, 0, 0]}>
                        {slipChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="flex h-full items-center justify-center text-muted-foreground">No milestone completion data</div>}
              </div>
            </CardContent>
          </Card>

          {/* By Type Summary */}
          {milestoneSlip?.by_type && (
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Slip by Milestone Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {Object.entries(milestoneSlip.by_type).map(([type, data]) => (
                    <div key={type} className="rounded-lg border p-4">
                      <p className="text-sm font-medium capitalize">{type.replace(/_/g, " ")}</p>
                      <div className="flex items-baseline gap-3 mt-2">
                        <span className="text-2xl font-bold tabular-nums">{data.count}</span>
                        <span className="text-sm text-muted-foreground">milestones</span>
                      </div>
                      <p className={`text-sm mt-1 ${data.avg_slip > 7 ? "text-[var(--danger)]" : "text-muted-foreground"}`}>
                        Avg slip: {data.avg_slip}d
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Exposure */}
          {riskExposure && (
            <>
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Risk Documentation Coverage
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Percentage of active initiatives with documented risks ({riskExposure.total_initiatives} initiatives)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                      { label: "Implementation Risk", value: riskExposure.implementation_risk_coverage },
                      { label: "Business Risk", value: riskExposure.business_risk_coverage },
                      { label: "Overall Coverage", value: riskExposure.overall_risk_coverage },
                    ].map((r) => (
                      <div key={r.label} className="rounded-lg border p-4">
                        <p className="text-sm font-medium text-muted-foreground">{r.label}</p>
                        <p className={`text-3xl font-bold tabular-nums mt-1 ${r.value >= 70 ? "text-[var(--success)]" : r.value >= 40 ? "text-amber-500" : "text-[var(--danger)]"}`}>
                          {r.value}%
                        </p>
                        <div className="mt-2 h-2 rounded-full bg-muted/30">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${r.value}%`, backgroundColor: r.value >= 70 ? "oklch(0.6 0.18 145)" : r.value >= 40 ? "oklch(0.75 0.15 65)" : "oklch(0.6 0.2 25)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {riskExposure.top_risk_initiatives.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader className="pb-2 border-b border-border/30">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Top Risk Initiatives
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Initiatives with the most documented risk exposure</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs font-semibold">Initiative</TableHead>
                            <TableHead className="text-xs font-semibold">Workstream</TableHead>
                            <TableHead className="text-xs font-semibold">Dependencies</TableHead>
                            <TableHead className="text-xs font-semibold">Implementation Risks</TableHead>
                            <TableHead className="text-xs font-semibold">Business Risks</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {riskExposure.top_risk_initiatives.map((ri) => {
                            const style = STATE_STYLES[ri.state];
                            return (
                              <TableRow key={ri.id} className="hover:bg-muted/15">
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-[13px]">{ri.name}</span>
                                    {style && (
                                      <Badge className="w-fit h-4 rounded px-1.5 text-[9px] font-semibold uppercase"
                                        style={{ background: style.background, color: style.text, borderColor: "transparent" }}>
                                        {stateLabel(ri.state)}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{ri.workstream}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    {ri.requires_it && <Badge variant="outline" className="text-[9px] px-1 h-4">IT</Badge>}
                                    {ri.requires_hr && <Badge variant="outline" className="text-[9px] px-1 h-4">HR</Badge>}
                                    {ri.requires_procurement && <Badge variant="outline" className="text-[9px] px-1 h-4">Proc</Badge>}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{ri.implementation_risks || "—"}</TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{ri.business_risks || "—"}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
