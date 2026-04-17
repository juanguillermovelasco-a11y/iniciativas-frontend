"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  DollarSign,
  CalendarCheck,
  BarChart3,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

interface ExportCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
}

type DownloadStatus = "idle" | "downloading" | "success" | "auth_error";

const exports: ExportCard[] = [
  {
    title: "All Initiatives",
    description: "Complete list of all initiatives with status and details",
    icon: <FileSpreadsheet className="h-5 w-5" />,
    endpoint: "/exports/initiatives/",
  },
  {
    title: "Financial Summary",
    description: "Financial data across all initiatives",
    icon: <DollarSign className="h-5 w-5" />,
    endpoint: "/exports/financial/",
  },
  {
    title: "Milestone Report",
    description: "All milestones with status and dates",
    icon: <CalendarCheck className="h-5 w-5" />,
    endpoint: "/exports/milestones/",
  },
  {
    title: "KPI Report",
    description: "KPI definitions and latest values",
    icon: <BarChart3 className="h-5 w-5" />,
    endpoint: "/exports/kpis/",
  },
  {
    title: "Cash Flow Report",
    description: "Monthly cash flow data per initiative",
    icon: <TrendingUp className="h-5 w-5" />,
    endpoint: "/exports/cashflow/",
  },
];

export default function DownloadsPage() {
  const [statuses, setStatuses] = useState<Record<string, DownloadStatus>>({});

  async function handleDownload(endpoint: string) {
    setStatuses((prev) => ({ ...prev, [endpoint]: "downloading" }));

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        credentials: "include",
      });

      if (!res.ok) {
        // 401/403 = auth required, anything else also shows auth message for simplicity
        setStatuses((prev) => ({ ...prev, [endpoint]: "auth_error" }));
        setTimeout(() => {
          setStatuses((prev) => ({ ...prev, [endpoint]: "idle" }));
        }, 4000);
        return;
      }

      // Trigger actual download by opening in new tab
      window.open(`${API_BASE}${endpoint}`, "_blank");
      setStatuses((prev) => ({ ...prev, [endpoint]: "success" }));
      setTimeout(() => {
        setStatuses((prev) => ({ ...prev, [endpoint]: "idle" }));
      }, 3000);
    } catch {
      // Network error or CORS — treat as auth error
      setStatuses((prev) => ({ ...prev, [endpoint]: "auth_error" }));
      setTimeout(() => {
        setStatuses((prev) => ({ ...prev, [endpoint]: "idle" }));
      }, 4000);
    }
  }

  function buttonContent(endpoint: string) {
    const status = statuses[endpoint] ?? "idle";

    switch (status) {
      case "downloading":
        return (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            Download started...
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
            Downloaded
          </>
        );
      case "auth_error":
        return (
          <>
            <AlertCircle className="mr-1.5 h-4 w-4 text-destructive" />
            Auth required -- log in first
          </>
        );
      default:
        return (
          <>
            <Download className="mr-1.5 h-4 w-4" />
            Download Excel
          </>
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Download className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Downloads</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Export initiative data in Excel format
        </p>
      </div>

      {/* Staff notice */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Staff only</Badge>
        <span className="text-xs text-muted-foreground">
          Exports require staff authentication on the Django admin
        </span>
      </div>

      {/* Export cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exports.map((exp) => (
          <Card key={exp.endpoint} className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary">
                {exp.icon}
                <CardTitle className="text-base">{exp.title}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {exp.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                disabled={(statuses[exp.endpoint] ?? "idle") === "downloading"}
                onClick={() => handleDownload(exp.endpoint)}
              >
                {buttonContent(exp.endpoint)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
