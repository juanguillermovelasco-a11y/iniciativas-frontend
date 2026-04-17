"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { InitiativeListItem, InitiativeState } from "@/lib/types/initiative";
import { STATE_STYLES } from "@/lib/types/initiative";
import { api } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 15;

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

const STATE_GROUP_MAP: Record<string, InitiativeState[]> = {
  "draft_submitted": ["draft", "submitted"],
  "initiative": ["initiative", "rejected"],
  "validation": ["validation_submitted", "validated"],
  "viability": ["viability_submitted", "viable"],
  "planning": ["planning_submitted", "planned"],
  "execution": ["execution_submitted", "executed"],
};

const STATE_GROUP_LABELS: { value: string; label: string }[] = [
  { value: "all", label: "All States" },
  { value: "draft_submitted", label: "Draft / Submitted" },
  { value: "initiative", label: "Initiative" },
  { value: "validation", label: "Validation" },
  { value: "viability", label: "Viability" },
  { value: "planning", label: "Planning" },
  { value: "execution", label: "Execution" },
];

type SortField = "name" | "idea_state" | "workstream_name" | "total_benefit" | "updated_at";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBenefit(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return "$0";
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

function formatRelativeDate(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

// ---------------------------------------------------------------------------
// Demo data — 16 initiatives across all 12 states
// ---------------------------------------------------------------------------

const DEMO_DATA: InitiativeListItem[] = [
  {
    id: 1,
    name: "Cloud Migration Program",
    idea_state: "viable",
    state_display: "Viable",
    state_text: "Viable",
    state_color: STATE_STYLES.viable,
    state_order: 7,
    workstream: 1,
    workstream_name: "Digital Transformation",
    strategic_objective: 1,
    strategic_objective_name: "Modernize IT Infrastructure",
    lead: 1,
    lead_name: "A. Rivera",
    confirmed_lead: 1,
    confirmed_lead_name: "A. Rivera",
    tshirt_size: "XL",
    estimated_duration: "long_term",
    total_benefit: "1800000",
    overdue_milestones_count: 2,
    created_at: "2025-01-10T09:00:00Z",
    updated_at: "2026-04-15T14:30:00Z",
  },
  {
    id: 2,
    name: "Data Lakehouse Architecture",
    idea_state: "planned",
    state_display: "Planned",
    state_text: "Planned",
    state_color: STATE_STYLES.planned,
    state_order: 9,
    workstream: 1,
    workstream_name: "Digital Transformation",
    strategic_objective: 1,
    strategic_objective_name: "Modernize IT Infrastructure",
    lead: 2,
    lead_name: "M. Chen",
    confirmed_lead: 2,
    confirmed_lead_name: "M. Chen",
    tshirt_size: "L",
    estimated_duration: "medium_term",
    total_benefit: "950000",
    overdue_milestones_count: 0,
    created_at: "2025-02-20T10:00:00Z",
    updated_at: "2026-04-14T09:15:00Z",
  },
  {
    id: 3,
    name: "AI-Powered Document Processing",
    idea_state: "validated",
    state_display: "Validated",
    state_text: "Validated",
    state_color: STATE_STYLES.validated,
    state_order: 5,
    workstream: 1,
    workstream_name: "Digital Transformation",
    strategic_objective: 2,
    strategic_objective_name: "Automate Core Processes",
    lead: 3,
    lead_name: "S. Patel",
    confirmed_lead: null,
    confirmed_lead_name: null,
    tshirt_size: "M",
    estimated_duration: "medium_term",
    total_benefit: "620000",
    overdue_milestones_count: 1,
    created_at: "2025-05-15T08:00:00Z",
    updated_at: "2026-04-12T16:45:00Z",
  },
  {
    id: 4,
    name: "API Gateway Modernization",
    idea_state: "draft",
    state_display: "Draft",
    state_text: "Draft",
    state_color: STATE_STYLES.draft,
    state_order: 0,
    workstream: 1,
    workstream_name: "Digital Transformation",
    strategic_objective: null,
    strategic_objective_name: null,
    lead: 4,
    lead_name: "J. Kim",
    confirmed_lead: null,
    confirmed_lead_name: null,
    tshirt_size: "L",
    estimated_duration: "long_term",
    total_benefit: "450000",
    overdue_milestones_count: 0,
    created_at: "2025-08-01T11:00:00Z",
    updated_at: "2026-04-10T10:00:00Z",
  },
  {
    id: 5,
    name: "Lean Manufacturing Rollout",
    idea_state: "execution_submitted",
    state_display: "Execution Submitted",
    state_text: "Execution Submitted",
    state_color: STATE_STYLES.execution_submitted,
    state_order: 10,
    workstream: 2,
    workstream_name: "Operational Excellence",
    strategic_objective: 3,
    strategic_objective_name: "Optimize Operations",
    lead: 5,
    lead_name: "R. Torres",
    confirmed_lead: 5,
    confirmed_lead_name: "R. Torres",
    tshirt_size: "XL",
    estimated_duration: "long_term",
    total_benefit: "1200000",
    overdue_milestones_count: 0,
    created_at: "2025-01-20T09:00:00Z",
    updated_at: "2026-04-15T11:00:00Z",
  },
  {
    id: 6,
    name: "Predictive Maintenance System",
    idea_state: "planning_submitted",
    state_display: "Planning Submitted",
    state_text: "Planning Submitted",
    state_color: STATE_STYLES.planning_submitted,
    state_order: 8,
    workstream: 2,
    workstream_name: "Operational Excellence",
    strategic_objective: 3,
    strategic_objective_name: "Optimize Operations",
    lead: 6,
    lead_name: "L. Okafor",
    confirmed_lead: 6,
    confirmed_lead_name: "L. Okafor",
    tshirt_size: "L",
    estimated_duration: "medium_term",
    total_benefit: "780000",
    overdue_milestones_count: 3,
    created_at: "2025-03-15T10:00:00Z",
    updated_at: "2026-04-13T08:30:00Z",
  },
  {
    id: 7,
    name: "Supply Chain Control Tower",
    idea_state: "validation_submitted",
    state_display: "Validation Submitted",
    state_text: "Validation Submitted",
    state_color: STATE_STYLES.validation_submitted,
    state_order: 4,
    workstream: 2,
    workstream_name: "Operational Excellence",
    strategic_objective: 3,
    strategic_objective_name: "Optimize Operations",
    lead: 7,
    lead_name: "D. Nakamura",
    confirmed_lead: null,
    confirmed_lead_name: null,
    tshirt_size: "M",
    estimated_duration: "medium_term",
    total_benefit: "540000",
    overdue_milestones_count: 0,
    created_at: "2025-06-10T14:00:00Z",
    updated_at: "2026-04-08T17:20:00Z",
  },
  {
    id: 8,
    name: "Omnichannel Platform",
    idea_state: "executed",
    state_display: "Executed",
    state_text: "Executed",
    state_color: STATE_STYLES.executed,
    state_order: 11,
    workstream: 3,
    workstream_name: "Customer Experience",
    strategic_objective: 4,
    strategic_objective_name: "Enhance Customer Engagement",
    lead: 8,
    lead_name: "E. Johansson",
    confirmed_lead: 8,
    confirmed_lead_name: "E. Johansson",
    tshirt_size: "XL",
    estimated_duration: "medium_term",
    total_benefit: "2100000",
    overdue_milestones_count: 0,
    created_at: "2024-11-15T09:00:00Z",
    updated_at: "2026-04-01T12:00:00Z",
  },
  {
    id: 9,
    name: "Customer 360 View",
    idea_state: "viability_submitted",
    state_display: "Viability Submitted",
    state_text: "Viability Submitted",
    state_color: STATE_STYLES.viability_submitted,
    state_order: 6,
    workstream: 3,
    workstream_name: "Customer Experience",
    strategic_objective: 4,
    strategic_objective_name: "Enhance Customer Engagement",
    lead: 9,
    lead_name: "K. Andersen",
    confirmed_lead: null,
    confirmed_lead_name: null,
    tshirt_size: "L",
    estimated_duration: "medium_term",
    total_benefit: "890000",
    overdue_milestones_count: 1,
    created_at: "2025-04-20T08:00:00Z",
    updated_at: "2026-04-11T15:45:00Z",
  },
  {
    id: 10,
    name: "AI Chatbot v2",
    idea_state: "submitted",
    state_display: "Submitted",
    state_text: "Submitted",
    state_color: STATE_STYLES.submitted,
    state_order: 1,
    workstream: 3,
    workstream_name: "Customer Experience",
    strategic_objective: 4,
    strategic_objective_name: "Enhance Customer Engagement",
    lead: 10,
    lead_name: "P. Nguyen",
    confirmed_lead: null,
    confirmed_lead_name: null,
    tshirt_size: "M",
    estimated_duration: "medium_term",
    total_benefit: "380000",
    overdue_milestones_count: 0,
    created_at: "2025-07-01T10:00:00Z",
    updated_at: "2026-04-09T14:00:00Z",
  },
  {
    id: 11,
    name: "Loyalty Program Redesign",
    idea_state: "initiative",
    state_display: "Initiative",
    state_text: "Initiative",
    state_color: STATE_STYLES.initiative,
    state_order: 2,
    workstream: 3,
    workstream_name: "Customer Experience",
    strategic_objective: 4,
    strategic_objective_name: "Enhance Customer Engagement",
    lead: 11,
    lead_name: "C. Williams",
    confirmed_lead: null,
    confirmed_lead_name: null,
    tshirt_size: "S",
    estimated_duration: "quick_win",
    total_benefit: "310000",
    overdue_milestones_count: 0,
    created_at: "2025-09-05T09:00:00Z",
    updated_at: "2026-04-07T11:30:00Z",
  },
  {
    id: 12,
    name: "Carbon Tracking Platform",
    idea_state: "viable",
    state_display: "Viable",
    state_text: "Viable",
    state_color: STATE_STYLES.viable,
    state_order: 7,
    workstream: 4,
    workstream_name: "Sustainability",
    strategic_objective: 5,
    strategic_objective_name: "Reduce Environmental Impact",
    lead: 12,
    lead_name: "T. Bergman",
    confirmed_lead: 12,
    confirmed_lead_name: "T. Bergman",
    tshirt_size: "M",
    estimated_duration: "medium_term",
    total_benefit: "420000",
    overdue_milestones_count: 1,
    created_at: "2025-02-15T10:00:00Z",
    updated_at: "2026-04-14T16:00:00Z",
  },
  {
    id: 13,
    name: "Circular Packaging Initiative",
    idea_state: "planned",
    state_display: "Planned",
    state_text: "Planned",
    state_color: STATE_STYLES.planned,
    state_order: 9,
    workstream: 4,
    workstream_name: "Sustainability",
    strategic_objective: 5,
    strategic_objective_name: "Reduce Environmental Impact",
    lead: 13,
    lead_name: "I. Muller",
    confirmed_lead: 13,
    confirmed_lead_name: "I. Muller",
    tshirt_size: "L",
    estimated_duration: "medium_term",
    total_benefit: "560000",
    overdue_milestones_count: 0,
    created_at: "2025-05-20T11:00:00Z",
    updated_at: "2026-04-06T09:45:00Z",
  },
  {
    id: 14,
    name: "Net-Zero Fleet Transition",
    idea_state: "rejected",
    state_display: "Rejected",
    state_text: "Rejected",
    state_color: STATE_STYLES.rejected,
    state_order: 3,
    workstream: 4,
    workstream_name: "Sustainability",
    strategic_objective: 5,
    strategic_objective_name: "Reduce Environmental Impact",
    lead: 14,
    lead_name: "F. Dubois",
    confirmed_lead: null,
    confirmed_lead_name: null,
    tshirt_size: "XL",
    estimated_duration: "long_term",
    total_benefit: "1500000",
    overdue_milestones_count: 0,
    created_at: "2025-08-10T09:00:00Z",
    updated_at: "2026-03-20T10:00:00Z",
  },
  {
    id: 15,
    name: "Green Building Certification",
    idea_state: "validated",
    state_display: "Validated",
    state_text: "Validated",
    state_color: STATE_STYLES.validated,
    state_order: 5,
    workstream: 4,
    workstream_name: "Sustainability",
    strategic_objective: 5,
    strategic_objective_name: "Reduce Environmental Impact",
    lead: 15,
    lead_name: "A. Singh",
    confirmed_lead: null,
    confirmed_lead_name: null,
    tshirt_size: "M",
    estimated_duration: "long_term",
    total_benefit: "350000",
    overdue_milestones_count: 0,
    created_at: "2025-10-01T08:00:00Z",
    updated_at: "2026-04-02T13:15:00Z",
  },
  {
    id: 16,
    name: "Warehouse Automation Phase 2",
    idea_state: "draft",
    state_display: "Draft",
    state_text: "Draft",
    state_color: STATE_STYLES.draft,
    state_order: 0,
    workstream: 2,
    workstream_name: "Operational Excellence",
    strategic_objective: null,
    strategic_objective_name: null,
    lead: 5,
    lead_name: "R. Torres",
    confirmed_lead: null,
    confirmed_lead_name: null,
    tshirt_size: "XL",
    estimated_duration: "long_term",
    total_benefit: "680000",
    overdue_milestones_count: 0,
    created_at: "2026-01-05T10:00:00Z",
    updated_at: "2026-04-16T08:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Sortable header component
// ---------------------------------------------------------------------------

function SortableHeader({
  label,
  field,
  currentSort,
  currentDir,
  onSort,
}: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentDir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentSort === field;

  return (
    <button
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors text-left"
      onClick={() => onSort(field)}
    >
      {label}
      {isActive ? (
        currentDir === "asc" ? (
          <ArrowUp className="size-3" />
        ) : (
          <ArrowDown className="size-3" />
        )
      ) : (
        <ArrowUpDown className="size-3 opacity-40" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function InitiativesPage() {
  const router = useRouter();

  // Data
  const [initiatives, setInitiatives] = useState<InitiativeListItem[]>(DEMO_DATA);

  useEffect(() => {
    api
      .get<{ results: InitiativeListItem[] }>("/initiatives/")
      .then((res) => setInitiatives(res.results))
      .catch(() => {/* fall back to demo data */});
  }, []);

  // Filters
  const [search, setSearch] = useState("");
  const [workstreamFilter, setWorkstreamFilter] = useState("all");
  const [stateGroupFilter, setStateGroupFilter] = useState("all");
  const [leadFilter, setLeadFilter] = useState("all");

  // Sort
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Derived data: unique workstreams and leads for filter options
  const workstreams = useMemo(() => {
    const unique = new Map<string, string>();
    for (const item of initiatives) {
      unique.set(String(item.workstream), item.workstream_name);
    }
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [initiatives]);

  const leads = useMemo(() => {
    const unique = new Map<string, string>();
    for (const item of initiatives) {
      unique.set(String(item.lead), item.lead_name);
    }
    return Array.from(unique.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [initiatives]);

  // Filter, sort, paginate
  const filtered = useMemo(() => {
    let items = [...initiatives];

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }

    // Workstream filter
    if (workstreamFilter !== "all") {
      items = items.filter((i) => String(i.workstream) === workstreamFilter);
    }

    // State group filter
    if (stateGroupFilter !== "all") {
      const states = STATE_GROUP_MAP[stateGroupFilter];
      if (states) {
        items = items.filter((i) => states.includes(i.idea_state));
      }
    }

    // Lead filter
    if (leadFilter !== "all") {
      items = items.filter((i) => String(i.lead) === leadFilter);
    }

    return items;
  }, [initiatives, search, workstreamFilter, stateGroupFilter, leadFilter]);

  const sorted = useMemo(() => {
    const items = [...filtered];

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "idea_state":
          cmp = a.state_order - b.state_order;
          break;
        case "workstream_name":
          cmp = a.workstream_name.localeCompare(b.workstream_name);
          break;
        case "total_benefit":
          cmp = parseFloat(a.total_benefit) - parseFloat(b.total_benefit);
          break;
        case "updated_at":
          cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(startIdx, startIdx + PAGE_SIZE);
  const showingFrom = sorted.length > 0 ? startIdx + 1 : 0;
  const showingTo = Math.min(startIdx + PAGE_SIZE, sorted.length);

  // Handlers
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  }

  function handleFilterChange(setter: (val: string) => void) {
    return (val: string | null) => {
      setter(val ?? "all");
      setCurrentPage(1);
    };
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            All Initiatives
          </h1>
          <p className="text-sm text-muted-foreground">
            {sorted.length} initiative{sorted.length !== 1 ? "s" : ""}{" "}
            {filtered.length !== DEMO_DATA.length ? `(filtered from ${DEMO_DATA.length})` : "total"}
          </p>
        </div>

        <Link href="/initiatives/create">
          <Button size="default">
            <PlusCircle className="size-4 mr-1.5" />
            Create New
          </Button>
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search initiatives..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8"
          />
        </div>

        {/* Workstream filter */}
        <Select
          value={workstreamFilter}
          onValueChange={handleFilterChange(setWorkstreamFilter)}
        >
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workstreams</SelectItem>
            {workstreams.map((ws) => (
              <SelectItem key={ws.value} value={ws.value}>
                {ws.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* State group filter */}
        <Select
          value={stateGroupFilter}
          onValueChange={handleFilterChange(setStateGroupFilter)}
        >
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATE_GROUP_LABELS.map((sg) => (
              <SelectItem key={sg.value} value={sg.value}>
                {sg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lead filter */}
        <Select
          value={leadFilter}
          onValueChange={handleFilterChange(setLeadFilter)}
        >
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leads</SelectItem>
            {leads.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="min-w-[200px]">
                <SortableHeader
                  label="Name"
                  field="name"
                  currentSort={sortField}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-[160px]">
                <SortableHeader
                  label="State"
                  field="idea_state"
                  currentSort={sortField}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-[180px]">
                <SortableHeader
                  label="Workstream"
                  field="workstream_name"
                  currentSort={sortField}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-[110px]">Lead</TableHead>
              <TableHead className="w-[80px]">Size</TableHead>
              <TableHead className="w-[100px]">
                <SortableHeader
                  label="Benefit"
                  field="total_benefit"
                  currentSort={sortField}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-[80px]">Overdue</TableHead>
              <TableHead className="w-[100px]">
                <SortableHeader
                  label="Updated"
                  field="updated_at"
                  currentSort={sortField}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No initiatives match your filters.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((item, idx) => (
                <TableRow
                  key={item.id}
                  className={`cursor-pointer transition-colors ${
                    idx % 2 === 1 ? "bg-muted/20" : ""
                  }`}
                  onClick={() => router.push(`/initiatives/${item.id}`)}
                >
                  <TableCell className="font-medium text-foreground">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="text-[11px] px-2 py-0 h-5 font-medium"
                      style={{
                        backgroundColor: item.state_color.background,
                        color: item.state_color.text,
                      }}
                    >
                      {STATE_LABELS[item.idea_state] ?? item.state_display}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.workstream_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.lead_name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
                      {item.tshirt_size}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {formatBenefit(item.total_benefit)}
                  </TableCell>
                  <TableCell>
                    {item.overdue_milestones_count > 0 ? (
                      <Badge variant="destructive" className="text-[11px] px-1.5 py-0 h-5 font-medium tabular-nums">
                        {item.overdue_milestones_count}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {formatRelativeDate(item.updated_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground tabular-nums">
            Showing {showingFrom}–{showingTo} of {sorted.length}
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-3.5 mr-0.5" />
              Previous
            </Button>
            <span className="px-2 text-xs text-muted-foreground tabular-nums">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="size-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
