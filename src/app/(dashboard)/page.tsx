"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  Line,
  Cell,
  Treemap,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Shield,
  Target,
  Zap,
  Users,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/charts/kpi-card";
import type {
  ExecutiveSummary,
  StrategicAlignmentData,
  VelocityData,
  ParetoData,
  LeadCapacityData,
  ResourceDemandData,
  OrgImpactData,
  TimeToValueData,
  SizeDistributionData,
} from "@/lib/types/initiative";
import { STATE_STYLES } from "@/lib/types/initiative";
import { api } from "@/lib/api/client";

// Demo data
const DEMO_DATA: ExecutiveSummary = {
  total_active_initiatives: 24,
  on_track_count: 15,
  at_risk_count: 6,
  off_track_count: 3,
  on_track_percentage: 62.5,
  at_risk_percentage: 25.0,
  off_track_percentage: 12.5,
  total_benefits: "4850000",
  total_investment: "2100000",
  currency_symbol: "$",
  initiatives_by_state: [
    { group: 0, label: "Idea", count: 8, color: "#999933" },
    { group: 1, label: "New", count: 5, color: "#003366" },
    { group: 2, label: "Validated", count: 4, color: "#666699" },
    { group: 3, label: "Viable", count: 3, color: "#6699CC" },
    { group: 4, label: "Planned", count: 2, color: "#3366CC" },
    { group: 5, label: "Executing", count: 1, color: "#006666" },
    { group: 6, label: "Executed", count: 1, color: "#0000CC" },
  ],
  benefit_by_workstream: [
    { workstream: "Digital Transformation", total_benefit: "1800000" },
    { workstream: "Operational Excellence", total_benefit: "1200000" },
    { workstream: "Customer Experience", total_benefit: "950000" },
    { workstream: "Sustainability", total_benefit: "900000" },
  ],
  cash_flow_monthly: {
    labels: ["2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12"],
    income: ["120000","145000","160000","180000","200000","210000","225000","240000","260000","280000","300000","320000"],
    expenses: ["95000","110000","105000","120000","115000","125000","130000","128000","135000","140000","138000","145000"],
    net_flow: ["25000","35000","55000","60000","85000","85000","95000","112000","125000","140000","162000","175000"],
  },
  cumulative_cash_flow: [],
  annualized_benefits: [
    { label: "Year 1", value: "1200000" },
    { label: "Year 2", value: "1800000" },
    { label: "Year 3", value: "1850000" },
  ],
  portfolio_health_score: 72,
  health_components: { milestone_health: 62.5, financial_performance: 85, strategic_alignment: 75 },
  dependency_counts: { it: 8, hr: 5, procurement: 4 },
};

function formatCurrency(value: string | number, symbol = "$"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Math.abs(num) >= 1_000_000) return `${symbol}${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `${symbol}${(num / 1_000).toFixed(0)}K`;
  return `${symbol}${num.toFixed(0)}`;
}

function HealthGauge({ score, components }: { score: number; components: ExecutiveSummary["health_components"] }) {
  const color = score >= 70 ? "oklch(0.6 0.18 145)" : score >= 40 ? "oklch(0.75 0.15 65)" : "oklch(0.6 0.2 25)";
  const label = score >= 70 ? "Healthy" : score >= 40 ? "Mixed" : "At Risk";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" /> Portfolio Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative h-[140px] w-[140px] flex-shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1s ease" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{score}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          </div>
          <div className="space-y-3 flex-1 text-sm">
            {[
              { label: "Milestone Health", value: components.milestone_health, weight: "40%" },
              { label: "Financial Perf.", value: components.financial_performance, weight: "30%" },
              { label: "Strategic Alignment", value: components.strategic_alignment, weight: "30%" },
            ].map((c) => (
              <div key={c.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">{c.label} <span className="text-[10px]">({c.weight})</span></span>
                  <span className="font-medium">{c.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/30">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${c.value}%`, backgroundColor: c.value >= 70 ? "oklch(0.6 0.18 145)" : c.value >= 40 ? "oklch(0.75 0.15 65)" : "oklch(0.6 0.2 25)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const TABS = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "strategic", label: "Strategic", icon: Target },
  { key: "pipeline", label: "Pipeline", icon: Zap },
  { key: "resources", label: "Resources", icon: Users },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function CEODashboard() {
  const [data, setData] = useState<ExecutiveSummary>(DEMO_DATA);
  const [isDemo, setIsDemo] = useState(true);
  const [tab, setTab] = useState<TabKey>("overview");
  const [workstreamFilter, setWorkstreamFilter] = useState("");

  // New data sources
  const [alignment, setAlignment] = useState<StrategicAlignmentData | null>(null);
  const [velocity, setVelocity] = useState<VelocityData | null>(null);
  const [pareto, setPareto] = useState<ParetoData | null>(null);
  const [leadCapacity, setLeadCapacity] = useState<LeadCapacityData | null>(null);
  const [resourceDemand, setResourceDemand] = useState<ResourceDemandData | null>(null);
  const [orgImpact, setOrgImpact] = useState<OrgImpactData | null>(null);
  const [timeToValue, setTimeToValue] = useState<TimeToValueData | null>(null);
  const [sizeDistribution, setSizeDistribution] = useState<SizeDistributionData | null>(null);

  useEffect(() => {
    const params = workstreamFilter ? `?workstream=${workstreamFilter}` : "";
    api.get<ExecutiveSummary>(`/dashboard/executive-summary/${params}`)
      .then((res) => { setData(res); setIsDemo(false); })
      .catch(() => setIsDemo(true));

    api.get<StrategicAlignmentData>(`/dashboard/strategic-alignment/${params}`).then(setAlignment).catch(() => {});
    api.get<VelocityData>(`/dashboard/velocity/${params}`).then(setVelocity).catch(() => {});
    api.get<ParetoData>(`/dashboard/pareto/${params}`).then(setPareto).catch(() => {});
    api.get<LeadCapacityData>(`/dashboard/lead-capacity/${params}`).then(setLeadCapacity).catch(() => {});
    api.get<ResourceDemandData>(`/dashboard/resource-demand/${params}`).then(setResourceDemand).catch(() => {});
    api.get<OrgImpactData>(`/dashboard/org-impact/${params}`).then(setOrgImpact).catch(() => {});
    api.get<TimeToValueData>(`/dashboard/time-to-value/${params}`).then(setTimeToValue).catch(() => {});
    api.get<SizeDistributionData>(`/dashboard/size-distribution/${params}`).then(setSizeDistribution).catch(() => {});
  }, [workstreamFilter]);

  // Workstream list from benefit data
  const workstreams = data.benefit_by_workstream.map((w) => w.workstream);

  // Chart data transforms
  const stateChartData = data.initiatives_by_state.map((s) => ({ name: s.label, count: s.count, fill: s.color }));
  const benefitChartData = data.benefit_by_workstream.map((w) => ({ name: w.workstream, benefit: parseFloat(w.total_benefit) }));
  const cashFlowData = data.cash_flow_monthly.labels.map((label, i) => ({
    month: label,
    income: parseFloat(data.cash_flow_monthly.income[i] || "0"),
    expenses: parseFloat(data.cash_flow_monthly.expenses[i] || "0"),
    net: parseFloat(data.cash_flow_monthly.net_flow[i] || "0"),
  }));
  const annualizedData = data.annualized_benefits.map((b) => ({ name: b.label, benefit: parseFloat(b.value) }));

  // Treemap data for strategic alignment
  const treemapData = alignment
    ? alignment.objectives.filter(o => o.initiative_count > 0).map((obj) => ({
        name: obj.name,
        children: obj.initiatives.map((init) => ({
          name: init.name,
          size: Math.max(parseFloat(init.benefit) || 1, 1),
          state: init.state,
        })),
      }))
    : [];

  // Pareto chart data
  const paretoChartData = pareto
    ? pareto.initiatives.map((i) => ({
        name: i.name.length > 20 ? i.name.substring(0, 18) + "..." : i.name,
        benefit: parseFloat(i.benefit),
        cumulative: i.cumulative_pct,
      }))
    : [];

  // Velocity funnel data
  const velocityData = velocity
    ? velocity.stages.map((s) => ({
        stage: s.stage,
        count: s.count,
        days: s.median_days_in_stage,
        conversion: s.conversion_rate,
      }))
    : [];

  // Lead capacity data
  const leadData = leadCapacity
    ? leadCapacity.leads.map((l) => ({
        name: l.name.split(" ")[0],
        initiatives: l.initiative_count,
        fte: parseFloat(l.total_fte),
      }))
    : [];

  // Dependency radar data
  const depData = [
    { dep: "IT", count: data.dependency_counts.it },
    { dep: "HR", count: data.dependency_counts.hr },
    { dep: "Procurement", count: data.dependency_counts.procurement },
  ];

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Summary</h1>
          <p className="text-sm text-muted-foreground">
            Portfolio health overview{isDemo && " (demo data)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={workstreamFilter}
            onChange={(e) => setWorkstreamFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Workstreams</option>
            {workstreams.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {tab === "overview" && (
        <>
          {/* KPI Cards + Health Gauge */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <HealthGauge score={data.portfolio_health_score} components={data.health_components} />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:col-span-4 lg:grid-cols-4">
              <KPICard title="Active" value={data.total_active_initiatives} subtitle="In progress" icon={<Activity className="h-5 w-5" />} />
              <KPICard title="On Track" value={`${data.on_track_percentage}%`} subtitle={`${data.on_track_count} initiatives`} icon={<CheckCircle2 className="h-5 w-5" />} variant="success" />
              <KPICard title="At Risk" value={`${data.at_risk_percentage}%`} subtitle={`${data.at_risk_count} initiatives`} icon={<AlertTriangle className="h-5 w-5" />} variant="warning" />
              <KPICard title="Off Track" value={`${data.off_track_percentage}%`} subtitle={`${data.off_track_count} initiatives`} icon={<XCircle className="h-5 w-5" />} variant="danger" />
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Initiatives by Lifecycle Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateChartData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {stateChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Net Benefit by Workstream</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={benefitChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Benefit"]} />
                      <Bar dataKey="benefit" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Portfolio Cash Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={1} />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Area type="monotone" dataKey="income" stroke="oklch(0.6 0.18 145)" fill="oklch(0.6 0.18 145 / 0.15)" name="Income" />
                      <Area type="monotone" dataKey="expenses" stroke="oklch(0.6 0.2 25)" fill="oklch(0.6 0.2 25 / 0.15)" name="Expenses" />
                      <Area type="monotone" dataKey="net" stroke="oklch(0.55 0.15 150)" fill="oklch(0.55 0.15 150 / 0.2)" strokeWidth={2} name="Net Flow" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Annualized Benefits Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={annualizedData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Benefit"]} />
                      <Bar dataKey="benefit" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ===== STRATEGIC TAB ===== */}
      {tab === "strategic" && (
        <>
          {/* Strategic Alignment Treemap */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Target className="h-4 w-4" /> Strategic Alignment — Initiatives by Objective
              </CardTitle>
              <p className="text-xs text-muted-foreground">Size = total benefit. Click to explore.</p>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {treemapData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={treemapData}
                      dataKey="size"
                      aspectRatio={4 / 3}
                      stroke="var(--border)"
                      content={({ x, y, width, height, name, depth }: { x: number; y: number; width: number; height: number; name?: string; depth?: number }) => {
                        if (width < 4 || height < 4) return <g />;
                        const isParent = depth === 1;
                        return (
                          <g>
                            <rect x={x} y={y} width={width} height={height} rx={2}
                              fill={isParent ? "var(--color-chart-1)" : "var(--color-chart-2)"}
                              fillOpacity={isParent ? 0.9 : 0.7}
                              stroke="var(--background)" strokeWidth={isParent ? 2 : 1}
                            />
                            {width > 50 && height > 20 && (
                              <text x={x + 6} y={y + (isParent ? 16 : 14)}
                                fill="#fff" fontSize={isParent ? 12 : 10} fontWeight={isParent ? 600 : 400}>
                                {(name || "").substring(0, Math.floor(width / 7))}
                              </text>
                            )}
                          </g>
                        );
                      }}
                    />
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">Loading alignment data...</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alignment Table */}
          {alignment && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Objective Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">#</th>
                        <th className="pb-2 font-medium">Strategic Objective</th>
                        <th className="pb-2 font-medium text-right">Initiatives</th>
                        <th className="pb-2 font-medium text-right">Total Benefit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alignment.objectives.map((obj) => (
                        <tr key={obj.id} className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">{obj.order}</td>
                          <td className="py-2 font-medium">{obj.name}</td>
                          <td className="py-2 text-right">{obj.initiative_count}</td>
                          <td className="py-2 text-right font-medium">{formatCurrency(obj.total_benefit)}</td>
                        </tr>
                      ))}
                      {alignment.unaligned_count > 0 && (
                        <tr className="text-muted-foreground">
                          <td className="py-2">—</td>
                          <td className="py-2 italic">Unaligned</td>
                          <td className="py-2 text-right">{alignment.unaligned_count}</td>
                          <td className="py-2 text-right">{formatCurrency(alignment.unaligned_benefit)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dependency Radar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Cross-Functional Dependencies</CardTitle>
              <p className="text-xs text-muted-foreground">Number of active initiatives requiring each function</p>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={depData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="dep" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fontSize: 10 }} />
                    <Radar dataKey="count" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Org Unit Impact */}
          {orgImpact && orgImpact.units.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Organizational Unit Impact</CardTitle>
                <p className="text-xs text-muted-foreground">Initiative count per affected org unit, stacked by lifecycle stage</p>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orgImpact.units} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="unit" type="category" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      {orgImpact.state_groups.map((g, i) => {
                        const colors = ["#003366", "#666699", "#6699CC", "#3366CC", "#006666", "#0000CC"];
                        return <Bar key={g} dataKey={g} stackId="a" name={g} fill={colors[i % colors.length]} />;
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ===== PIPELINE TAB ===== */}
      {tab === "pipeline" && (
        <>
          {/* Velocity Funnel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" /> Initiative Velocity Funnel
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Pipeline flow — count per stage, median days, conversion rate
                {velocity && ` · Avg time to execution: ${velocity.avg_time_to_execution_days} days`}
              </p>
            </CardHeader>
            <CardContent>
              {velocityData.length > 0 ? (
                <div className="space-y-2">
                  {velocityData.map((stage, i) => {
                    const maxCount = Math.max(...velocityData.map((s) => s.count), 1);
                    const width = Math.max((stage.count / maxCount) * 100, 8);
                    return (
                      <div key={stage.stage} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium text-right shrink-0">{stage.stage}</div>
                        <div className="flex-1">
                          <div className="relative h-9 rounded-md overflow-hidden" style={{ width: `${width}%`, backgroundColor: `oklch(0.55 0.15 ${150 + i * 30})` }}>
                            <div className="absolute inset-0 flex items-center px-3">
                              <span className="text-sm font-bold text-white">{stage.count}</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-20 text-xs text-muted-foreground text-right shrink-0">{stage.days}d median</div>
                        <div className="w-16 text-xs font-medium text-right shrink-0">{stage.conversion}%</div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
                    <div className="w-20" />
                    <div className="flex-1">Initiatives in stage</div>
                    <div className="w-20 text-right">Days in stage</div>
                    <div className="w-16 text-right">Conversion</div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">Loading velocity data...</div>
              )}
            </CardContent>
          </Card>

          {/* Pareto Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Pareto Analysis — Value Concentration</CardTitle>
              <p className="text-xs text-muted-foreground">
                Which initiatives deliver the most value? (80/20 rule)
                {pareto && ` · ${pareto.count} initiatives · Total: ${formatCurrency(pareto.total_benefit)}`}
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {paretoChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={paretoChartData} margin={{ bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-35} textAnchor="end" height={80} />
                      <YAxis yAxisId="benefit" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value, name) => [
                        name === "cumulative" ? `${value}%` : formatCurrency(Number(value)),
                        name === "cumulative" ? "Cumulative %" : "Benefit"
                      ]} />
                      <Bar yAxisId="benefit" dataKey="benefit" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="pct" dataKey="cumulative" type="monotone" stroke="oklch(0.6 0.2 25)" strokeWidth={2} dot={false} />
                      {/* 80% reference line */}
                      <Line yAxisId="pct" dataKey={() => 80} type="monotone" stroke="oklch(0.6 0.2 25)" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">Loading pareto data...</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time-to-Value Scatter */}
          {timeToValue && timeToValue.initiatives.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Time-to-Value — Initiative Age vs Benefit</CardTitle>
                <p className="text-xs text-muted-foreground">Each dot = one initiative. Top-left = high value, fast delivery (best quadrant)</p>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" dataKey="age" name="Age (days)" tick={{ fontSize: 10 }} label={{ value: "Age (days)", position: "bottom", fontSize: 11, offset: -5 }} />
                      <YAxis type="number" dataKey="benefit" name="Benefit" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                      <ZAxis type="number" dataKey="z" range={[40, 300]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => [
                        name === "Benefit" ? formatCurrency(Number(value)) : `${value} days`,
                        name,
                      ]} />
                      <Scatter name="Initiatives" data={timeToValue.initiatives.map((i) => ({
                        age: i.age_days,
                        benefit: parseFloat(i.benefit),
                        z: parseFloat(i.benefit) || 50,
                        name: i.name,
                      }))} fill="var(--color-chart-1)" fillOpacity={0.6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Total Benefits KPI */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KPICard title="Total Benefits" value={formatCurrency(data.total_benefits)} subtitle="Portfolio value" icon={<TrendingUp className="h-5 w-5" />} />
            <KPICard title="Total Investment" value={formatCurrency(data.total_investment)} subtitle="Required investment" icon={<Activity className="h-5 w-5" />} />
            <KPICard title="Benefit/Investment" value={
              parseFloat(data.total_investment) > 0
                ? `${(parseFloat(data.total_benefits) / parseFloat(data.total_investment)).toFixed(1)}x`
                : "N/A"
            } subtitle="Return multiplier" icon={<TrendingUp className="h-5 w-5" />} variant="success" />
          </div>
        </>
      )}

      {/* ===== RESOURCES TAB ===== */}
      {tab === "resources" && (
        <>
          {/* Lead Capacity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Lead Workload Balance
              </CardTitle>
              <p className="text-xs text-muted-foreground">Initiative count and FTE per lead — identifies overloaded people</p>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                {leadData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={leadData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="initiatives" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} name="Initiatives" barSize={16} />
                      <Bar dataKey="fte" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} name="FTE" barSize={16} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">Loading lead data...</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resource Demand Heatmap */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Resource Demand by Quarter</CardTitle>
              <p className="text-xs text-muted-foreground">FTE demand by workstream across quarters (based on milestone dates)</p>
            </CardHeader>
            <CardContent>
              {resourceDemand && resourceDemand.quarters.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">Workstream</th>
                        {resourceDemand.quarters.map((q) => (
                          <th key={q} className="pb-2 font-medium text-center">{q}</th>
                        ))}
                        <th className="pb-2 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resourceDemand.workstreams.map((ws) => (
                        <tr key={ws.workstream} className="border-b border-border/50">
                          <td className="py-2 font-medium">{ws.workstream}</td>
                          {resourceDemand.quarters.map((q) => {
                            const val = parseFloat(ws[q] || "0");
                            const bg = val > 5 ? "bg-red-500/20" : val > 2 ? "bg-amber-500/20" : val > 0 ? "bg-green-500/20" : "";
                            return (
                              <td key={q} className={`py-2 text-center ${bg} rounded`}>
                                {val > 0 ? val.toFixed(1) : "—"}
                              </td>
                            );
                          })}
                          <td className="py-2 text-right font-bold">{parseFloat(ws.total_fte || "0").toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">Loading resource data...</div>
              )}
            </CardContent>
          </Card>

          {/* T-Shirt Size Distribution */}
          {sizeDistribution && sizeDistribution.cells.length > 0 && (() => {
            const sizes = ["XS", "S", "M", "L", "XL"];
            const durations = ["quick_win", "medium_term", "long_term"];
            const durationLabels: Record<string, string> = { quick_win: "Quick Win", medium_term: "Medium Term", long_term: "Long Term" };
            const cellMap = new Map(sizeDistribution.cells.map((c) => [`${c.tshirt_size}-${c.duration}`, c]));
            return (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Portfolio Balance — Size vs Duration</CardTitle>
                  <p className="text-xs text-muted-foreground">Number of initiatives per T-shirt size and estimated duration. Color intensity = benefit.</p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 font-medium">Size \ Duration</th>
                          {durations.map((d) => <th key={d} className="pb-2 font-medium text-center">{durationLabels[d]}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {sizes.map((size) => (
                          <tr key={size} className="border-b border-border/50">
                            <td className="py-3 font-bold text-base">{size}</td>
                            {durations.map((dur) => {
                              const cell = cellMap.get(`${size}-${dur}`);
                              const count = cell?.count ?? 0;
                              const benefit = parseFloat(cell?.total_benefit || "0");
                              const bg = count === 0 ? "" : count >= 5 ? "bg-blue-500/25" : count >= 2 ? "bg-blue-500/15" : "bg-blue-500/8";
                              return (
                                <td key={dur} className={`py-3 text-center rounded ${bg}`}>
                                  {count > 0 ? (
                                    <div>
                                      <span className="text-lg font-bold">{count}</span>
                                      <p className="text-[10px] text-muted-foreground">{formatCurrency(benefit)}</p>
                                    </div>
                                  ) : <span className="text-muted-foreground/40">—</span>}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Dependency Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KPICard title="Requires IT" value={data.dependency_counts.it} subtitle="initiatives" icon={<Shield className="h-5 w-5" />} variant={data.dependency_counts.it > 8 ? "danger" : "default"} />
            <KPICard title="Requires HR" value={data.dependency_counts.hr} subtitle="initiatives" icon={<Users className="h-5 w-5" />} variant={data.dependency_counts.hr > 6 ? "warning" : "default"} />
            <KPICard title="Requires Procurement" value={data.dependency_counts.procurement} subtitle="initiatives" icon={<Activity className="h-5 w-5" />} variant={data.dependency_counts.procurement > 6 ? "warning" : "default"} />
          </div>
        </>
      )}
    </div>
  );
}
