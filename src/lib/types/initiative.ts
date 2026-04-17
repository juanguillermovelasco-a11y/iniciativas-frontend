export type InitiativeState =
  | "draft"
  | "submitted"
  | "initiative"
  | "rejected"
  | "validation_submitted"
  | "validated"
  | "viability_submitted"
  | "viable"
  | "planning_submitted"
  | "planned"
  | "execution_submitted"
  | "executed";

export type FinancialDataType = "estimate" | "projected" | "real" | "final";
export type MilestoneType = "implementation" | "behavior_change" | "economic_impact_start";
export type KPIDataType = "numeric" | "boolean";
export type KPIPeriodicity = "daily" | "weekly" | "monthly";
export type EstimatedDuration = "quick_win" | "medium_term" | "long_term";

export const STATE_STYLES: Record<InitiativeState, { background: string; text: string }> = {
  draft: { background: "#999933", text: "#FFFFFF" },
  submitted: { background: "#669900", text: "#FFFFFF" },
  initiative: { background: "#003366", text: "#FFFFFF" },
  rejected: { background: "#333399", text: "#FFFFFF" },
  validation_submitted: { background: "#336600", text: "#FFFFFF" },
  validated: { background: "#666699", text: "#FFFFFF" },
  viability_submitted: { background: "#006633", text: "#FFFFFF" },
  viable: { background: "#6699CC", text: "#FFFFFF" },
  planning_submitted: { background: "#009966", text: "#FFFFFF" },
  planned: { background: "#3366CC", text: "#FFFFFF" },
  execution_submitted: { background: "#006666", text: "#FFFFFF" },
  executed: { background: "#0000CC", text: "#FFFFFF" },
};

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
}

export interface Workstream {
  id: number;
  name: string;
  description: string;
  type: string;
  type_display: string;
  owner: User;
}

export interface StrategicObjective {
  id: number;
  name: string;
  description: string;
  order: number;
}

export interface InitiativeListItem {
  id: number;
  name: string;
  idea_state: InitiativeState;
  state_display: string;
  state_text: string;
  state_color: { background: string; text: string };
  state_order: number;
  workstream: number;
  workstream_name: string;
  strategic_objective: number | null;
  strategic_objective_name: string | null;
  lead: number;
  lead_name: string;
  confirmed_lead: number | null;
  confirmed_lead_name: string | null;
  tshirt_size: string;
  estimated_duration: EstimatedDuration | null;
  total_benefit: string;
  overdue_milestones_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationUnit {
  id: number;
  name: string;
  description: string;
  organization_unit_type: {
    id: number;
    numeric_id: number;
    name: string;
  };
}

export interface FinancialData {
  id: number;
  initiative: number;
  data_type: FinancialDataType;
  data_type_display: string;
  recurring_net_impact_revenue: string;
  recurring_net_impact_costs: string;
  recurring_net_impact_cash_flow: string;
  recurring_net_impact_profit: string;
  recurrence_period: number;
  one_time_net_impact_revenue: string;
  one_time_net_impact_costs: string;
  one_time_net_impact_cash_flow: string;
  one_time_net_impact_profit: string;
  one_time_implementation_cost: string;
  total_anualized_benefit_1: string;
  total_anualized_benefit_2: string;
  total_anualized_benefit_3: string;
  total_benefit: string;
  roi: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: number;
  initiative: number;
  planned_date: string;
  actual_execution_date: string | null;
  description: string;
  milestone_type: MilestoneType;
  milestone_type_display: string;
  responsible: string;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface KPIValue {
  id: number;
  initiative_kpi: number;
  date: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface KPI {
  id: number;
  initiative: number;
  name: string;
  description: string;
  formula: string;
  data_type: KPIDataType;
  data_type_display: string;
  periodicity: KPIPeriodicity;
  periodicity_display: string;
  latest_value: { date: string; value: string } | null;
  values_count: number;
  created_at: string;
  updated_at: string;
}

export interface CashFlow {
  id: number;
  initiative: number;
  month_year: string;
  income: string;
  expenses: string;
  net_flow: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface InitiativeDetail {
  id: number;
  name: string;
  description: string;
  current_situation: string;
  what_needs_to_change: string;
  what_will_be_done: string;
  tshirt_size: string;
  estimated_duration: EstimatedDuration | null;
  estimated_duration_display: string;
  affected_organization_unit: number | null;
  affected_organization_unit_detail: OrganizationUnit | null;
  requires_it: boolean;
  requires_hr: boolean;
  requires_procurement: boolean;
  required_fte: string;
  workstream: number;
  workstream_detail: Workstream;
  strategic_objective: number | null;
  strategic_objective_detail: StrategicObjective | null;
  lead: number;
  lead_detail: User;
  confirmed_lead: number | null;
  confirmed_lead_detail: User | null;
  required_resources: string;
  required_investment: string;
  identified_implementation_risks: string;
  identified_business_risks: string;
  idea_state: InitiativeState;
  state_display: string;
  state_text: string;
  state_color: { background: string; text: string };
  state_order: number;
  financial_data: FinancialData[];
  milestones: Milestone[];
  kpis: KPI[];
  cash_flows_count: number;
  permissions: {
    can_edit: boolean;
    can_edit_financial: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const STATE_TRANSITIONS: Record<InitiativeState, { label: string; action: string; variant: "default" | "destructive" }[]> = {
  draft: [
    { label: "Submit for Approval", action: "submit_for_approval", variant: "default" },
  ],
  submitted: [
    { label: "Approve Idea", action: "approve_idea", variant: "default" },
    { label: "Reject Idea", action: "reject_idea", variant: "destructive" },
  ],
  initiative: [
    { label: "Submit Validation", action: "approve_validation", variant: "default" },
  ],
  rejected: [],
  validation_submitted: [
    { label: "Approve Validation", action: "approve_validation_review", variant: "default" },
    { label: "Reject Validation", action: "reject_validation_review", variant: "destructive" },
  ],
  validated: [
    { label: "Submit Viability", action: "approve_viability", variant: "default" },
  ],
  viability_submitted: [
    { label: "Approve Viability", action: "approve_viability_review", variant: "default" },
    { label: "Reject Viability", action: "reject_viability_review", variant: "destructive" },
  ],
  viable: [
    { label: "Submit Planning", action: "approve_planning", variant: "default" },
  ],
  planning_submitted: [
    { label: "Approve Planning", action: "approve_planning_review", variant: "default" },
    { label: "Reject Planning", action: "reject_planning_review", variant: "destructive" },
  ],
  planned: [
    { label: "Submit Execution", action: "approve_execution", variant: "default" },
  ],
  execution_submitted: [
    { label: "Approve Execution", action: "approve_execution_review", variant: "default" },
    { label: "Reject Execution", action: "reject_execution_review", variant: "destructive" },
  ],
  executed: [],
};

export const TSHIRT_SIZES: { value: string; label: string }[] = [
  { value: "XS", label: "XS - Extra Small" },
  { value: "S", label: "S - Small" },
  { value: "M", label: "M - Medium" },
  { value: "L", label: "L - Large" },
  { value: "XL", label: "XL - Extra Large" },
];

export const DURATION_OPTIONS: { value: EstimatedDuration; label: string }[] = [
  { value: "quick_win", label: "Quick Win (< 3 months)" },
  { value: "medium_term", label: "Medium Term (3-12 months)" },
  { value: "long_term", label: "Long Term (> 12 months)" },
];

export interface ExecutiveSummary {
  total_active_initiatives: number;
  on_track_count: number;
  at_risk_count: number;
  off_track_count: number;
  on_track_percentage: number;
  at_risk_percentage: number;
  off_track_percentage: number;
  total_benefits: string;
  currency_symbol: string;
  initiatives_by_state: {
    group: number;
    label: string;
    count: number;
    color: string;
  }[];
  benefit_by_workstream: {
    workstream: string;
    total_benefit: string;
  }[];
  cash_flow_monthly: {
    labels: string[];
    income: string[];
    expenses: string[];
    net_flow: string[];
  };
  annualized_benefits: {
    label: string;
    value: string;
  }[];
}
