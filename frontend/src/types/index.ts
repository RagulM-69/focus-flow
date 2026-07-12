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
}

export interface ProductivityPlan {
  priorityRanking: PlanItem[];
  timeline: TimelineItem[];
  estimatedFocusHours: number;
  recommendations: string[];
}

export type ActiveTab = 'overview' | 'workspace' | 'settings';
