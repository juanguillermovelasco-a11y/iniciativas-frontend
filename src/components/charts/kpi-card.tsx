"use client";

import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "border-border",
  success: "border-l-4 border-l-[oklch(0.6_0.18_145)]",
  warning: "border-l-4 border-l-[oklch(0.75_0.15_65)]",
  danger: "border-l-4 border-l-[oklch(0.6_0.2_25)]",
};

export function KPICard({ title, value, subtitle, icon, variant = "default" }: KPICardProps) {
  return (
    <Card className={variantStyles[variant]}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
