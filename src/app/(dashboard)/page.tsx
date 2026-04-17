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
} from "recharts";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/charts/kpi-card";
import type { ExecutiveSummary } from "@/lib/types/initiative";
import { api } from "@/lib/api/client";

// Demo data used when the API is unavailable (empty DB or server down)
const DEMO_DATA: ExecutiveSummary = {
  total_active_initiatives: 24,
  on_track_count: 15,
  at_risk_count: 6,
  off_track_count: 3,
  on_track_percentage: 62.5,
  at_risk_percentage: 25.0,
  off_track_percentage: 12.5,
  total_benefits: "4850000",
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
    labels: [
      "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
      "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
    ],
    income: [
      "120000", "145000", "160000", "180000", "200000", "210000",
      "225000", "240000", "260000", "280000", "300000", "320000",
    ],
    expenses: [
      "95000", "110000", "105000", "120000", "115000", "125000",
      "130000", "128000", "135000", "140000", "138000", "145000",
    ],
    net_flow: [
      "25000", "35000", "55000", "60000", "85000", "85000",
      "95000", "112000", "125000", "140000", "162000", "175000",
    ],
  },
  annualized_benefits: [
    { label: "Year 1", value: "1200000" },
    { label: "Year 2", value: "1800000" },
    { label: "Year 3", value: "1850000" },
  ],
};

function formatCurrency(value: string | number, symbol = "$"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num >= 1_000_000) return `${symbol}${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${symbol}${(num / 1_000).toFixed(0)}K`;
  return `${symbol}${num.toFixed(0)}`;
}

export default function CEODashboard() {
  const [data, setData] = useState<ExecutiveSummary>(DEMO_DATA);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    api
      .get<ExecutiveSummary>("/dashboard/executive-summary/")
      .then((res) => {
        setData(res);
        setIsDemo(false);
      })
      .catch(() => {
        // API not available, use demo data
        setIsDemo(true);
      });
  }, []);

  // Prepare chart data
  const stateChartData = data.initiatives_by_state.map((s) => ({
    name: s.label,
    count: s.count,
    fill: s.color,
  }));

  const benefitChartData = data.benefit_by_workstream.map((w) => ({
    name: w.workstream,
    benefit: parseFloat(w.total_benefit),
  }));

  const cashFlowData = data.cash_flow_monthly.labels.map((label, i) => ({
    month: label,
    income: parseFloat(data.cash_flow_monthly.income[i] || "0"),
    expenses: parseFloat(data.cash_flow_monthly.expenses[i] || "0"),
    net: parseFloat(data.cash_flow_monthly.net_flow[i] || "0"),
  }));

  const annualizedData = data.annualized_benefits.map((b) => ({
    name: b.label,
    benefit: parseFloat(b.value),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Executive Summary
          </h1>
          <p className="text-sm text-muted-foreground">
            Portfolio health overview
            {isDemo && " (demo data)"}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Active Initiatives"
          value={data.total_active_initiatives}
          subtitle="In progress"
          icon={<Activity className="h-5 w-5" />}
        />
        <KPICard
          title="On Track"
          value={`${data.on_track_percentage}%`}
          subtitle={`${data.on_track_count} initiatives`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="success"
        />
        <KPICard
          title="At Risk"
          value={`${data.at_risk_percentage}%`}
          subtitle={`${data.at_risk_count} initiatives`}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="warning"
        />
        <KPICard
          title="Off Track"
          value={`${data.off_track_percentage}%`}
          subtitle={`${data.off_track_count} initiatives`}
          icon={<XCircle className="h-5 w-5" />}
          variant="danger"
        />
        <KPICard
          title="Total Benefits"
          value={formatCurrency(data.total_benefits, data.currency_symbol)}
          subtitle="Portfolio value"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Initiatives by State */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Initiatives by Lifecycle Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateChartData}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    fill="var(--color-chart-1)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Benefit by Workstream */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Net Benefit by Workstream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benefitChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Benefit",
                    ]}
                  />
                  <Bar
                    dataKey="benefit"
                    fill="var(--color-chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cash Flow */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Portfolio Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    interval={1}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="oklch(0.6 0.18 145)"
                    fill="oklch(0.6 0.18 145 / 0.15)"
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="oklch(0.6 0.2 25)"
                    fill="oklch(0.6 0.2 25 / 0.15)"
                    name="Expenses"
                  />
                  <Area
                    type="monotone"
                    dataKey="net"
                    stroke="oklch(0.55 0.15 150)"
                    fill="oklch(0.55 0.15 150 / 0.2)"
                    strokeWidth={2}
                    name="Net Flow"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Annualized Benefits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Annualized Benefits Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={annualizedData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Benefit",
                    ]}
                  />
                  <Bar
                    dataKey="benefit"
                    fill="var(--color-chart-2)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
