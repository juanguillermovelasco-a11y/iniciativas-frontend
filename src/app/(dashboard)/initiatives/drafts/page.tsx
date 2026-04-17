"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Plus,
  Search,
  FileEdit,
  Send,
  XCircle,
  ArrowRight,
  RotateCcw,
  Loader2,
} from "lucide-react";

import type { InitiativeState, InitiativeListItem } from "@/lib/types/initiative";
import { api } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Paginated response shape
// ---------------------------------------------------------------------------

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const DRAFT_STATES: InitiativeState[] = ["draft", "submitted", "rejected"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type FilterableState = "all" | "draft" | "submitted" | "rejected";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function stateIcon(state: InitiativeState) {
  switch (state) {
    case "draft":
      return <FileEdit className="size-3.5" />;
    case "submitted":
      return <Send className="size-3.5" />;
    case "rejected":
      return <XCircle className="size-3.5" />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DraftsPage() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<FilterableState>("all");
  const [allInitiatives, setAllInitiatives] = useState<InitiativeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live data from API
  useEffect(() => {
    api
      .get<PaginatedResponse<InitiativeListItem>>("/initiatives/?page_size=100")
      .then((res) => {
        setAllInitiatives(res.results);
      })
      .catch(() => {
        setAllInitiatives([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Only show draft / submitted / rejected in this funnel view
  const funnelItems = useMemo(
    () => allInitiatives.filter((i) => DRAFT_STATES.includes(i.idea_state)),
    [allInitiatives],
  );

  const filtered = useMemo(() => {
    return funnelItems.filter((item) => {
      const matchesSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.toLowerCase());
      const matchesState =
        stateFilter === "all" || item.idea_state === stateFilter;
      return matchesSearch && matchesState;
    });
  }, [funnelItems, search, stateFilter]);

  const draftCount = funnelItems.filter((i) => i.idea_state === "draft").length;
  const submittedCount = funnelItems.filter(
    (i) => i.idea_state === "submitted",
  ).length;
  const rejectedCount = funnelItems.filter(
    (i) => i.idea_state === "rejected",
  ).length;

  // -----------------------------------------------------------------------
  // Card border / style logic
  // -----------------------------------------------------------------------
  function cardClasses(state: InitiativeState): string {
    const base =
      "group relative shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5";
    switch (state) {
      case "draft":
        return `${base} border-dashed border-muted-foreground/30`;
      case "submitted":
        return `${base} border-l-4 border-l-amber-400`;
      case "rejected":
        return `${base} border-l-4 border-l-red-400 opacity-75`;
      default:
        return base;
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading draft ideas...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* -------------------------------------------------------------- */}
      {/* Header                                                          */}
      {/* -------------------------------------------------------------- */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Lightbulb className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Draft Ideas</h1>
            <p className="text-sm text-muted-foreground">
              Ideas and submissions awaiting review{" "}
              <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {funnelItems.length}
              </span>
            </p>
          </div>
        </div>

        <Link href="/initiatives/create" className={cn(buttonVariants({ variant: "default", size: "default" }))}>
          <Plus data-icon="inline-start" className="size-4" />
          New Idea
        </Link>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Summary cards                                                    */}
      {/* -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Drafts */}
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              <FileEdit className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Drafts
              </p>
              <p className="text-2xl font-semibold tabular-nums">{draftCount}</p>
            </div>
          </CardContent>
        </Card>

        {/* Submitted for Review */}
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Send className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Submitted for Review
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {submittedCount}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rejected */}
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <XCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Rejected
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {rejectedCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Filters                                                          */}
      {/* -------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={stateFilter}
          onValueChange={(v) => setStateFilter((v ?? "all") as FilterableState)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* -------------------------------------------------------------- */}
      {/* Initiative cards                                                 */}
      {/* -------------------------------------------------------------- */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <Search className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">
              {funnelItems.length === 0
                ? "No draft ideas found"
                : "No initiatives match your filters"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {funnelItems.length === 0
                ? "Create a new idea to get started, or check back later."
                : "Try adjusting the search term or state filter."}
            </p>
          </div>
          {funnelItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStateFilter("all");
              }}
            >
              <RotateCcw data-icon="inline-start" className="size-3.5" />
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className={cardClasses(item.idea_state)}>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left section */}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: item.state_color.background,
                        color: item.state_color.text,
                      }}
                    >
                      {stateIcon(item.idea_state)}
                      {item.state_text}
                    </span>
                    <h3 className={`text-base font-semibold leading-snug ${item.idea_state === "rejected" ? "text-muted-foreground" : ""}`}>
                      {item.name}
                    </h3>
                  </div>
                  <p className={`line-clamp-2 text-sm leading-relaxed ${item.idea_state === "rejected" ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                    T-shirt: {item.tshirt_size} | Duration: {item.estimated_duration ?? "N/A"}
                  </p>
                </div>

                {/* Right section */}
                <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground sm:flex-col sm:items-end sm:gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {item.workstream_name}
                  </Badge>
                  <span className="text-xs">{item.lead_name}</span>
                  <span className="text-xs tabular-nums">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </CardContent>

              {/* Bottom link */}
              <div className="border-t px-4 py-2.5">
                <Link
                  href={`/initiatives/${item.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  View Details
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
