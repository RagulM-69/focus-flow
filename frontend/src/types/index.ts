export interface Task {
  id: string;
  name: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string; // ISO Date String YYYY-MM-DD
  duration: number; // in hours
  notes?: string;
  status: 'todo' | 'completed';
  createdAt: string;
}

export interface PlanItem {
  id: string;
  taskName: string;
  reason: string;
  order: number;
}

export interface TimelineItem {
  timeRange: string;
  taskName: string;
  category: string; // e.g. Work, Study, Fitness, Personal, Shopping, Break, Lunch
}

export interface WorkloadAssessment {
  level: 'Light' | 'Moderate' | 'Heavy' | 'Overloaded';
  reason: string;
}

export interface ProductivityScore {
  score: number;
  reason: string;
  breakdown: string[]; // List of score reasons e.g., "+10 Balanced workload"
}

export interface DeadlineRisk {
  taskName: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
}

export interface TaskValidation {
  taskName: string;
  issue: string;
  reason: string;
  suggestion: string;
}

export interface ProductivityPlan {
  priorityRanking: PlanItem[];
  timeline: TimelineItem[];
  estimatedFocusHours: number;
  workloadAssessment: WorkloadAssessment;
  productivityScore: ProductivityScore;
  deadlineRisks: DeadlineRisk[];
  taskValidation: TaskValidation[];
  recommendations: string[];
  dailySummary: string;
  motivationalInsight: string;
}

export type ActiveTab = 'overview' | 'workspace' | 'settings';
