import React from 'react';
import type { ProductivityPlan, Task } from '../../types';
import { Button } from '../shared/Button';
import { Sparkles, AlertCircle, Compass, ListOrdered, Calendar } from 'lucide-react';

interface PlannerDashboardProps {
  plan: ProductivityPlan | null;
  onGeneratePlan: () => void;
  isGenerating: boolean;
  activeTaskCount: number;
  tasks: Task[];
}

export const PlannerDashboard: React.FC<PlannerDashboardProps> = ({
  plan,
  onGeneratePlan,
  isGenerating,
  activeTaskCount,
  tasks
}) => {
  const activeTasks = tasks.filter((t) => t.status === 'todo');

  const getWorkload = (hours: number) => {
    if (hours > 6) return 'Heavy';
    if (hours >= 3) return 'Optimal';
    return 'Light';
  };

  const getHighestPriority = () => {
    const priorities = activeTasks.map((t) => t.priority);
    if (priorities.includes('high')) return 'High';
    if (priorities.includes('medium')) return 'Medium';
    if (priorities.includes('low')) return 'Low';
    return 'None';
  };

  const focusHours = plan ? plan.estimatedFocusHours : 0;
  const workload = getWorkload(focusHours);
  const highestPriority = getHighestPriority();

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="border border-border bg-card rounded-lg p-5 flex items-center justify-between flex-wrap gap-3 shadow-none">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Compass className="h-4 w-4 text-muted-foreground" /> Smart Planner
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Optimize your daily output using task prioritization.
          </p>
        </div>

        <Button
          size="sm"
          onClick={onGeneratePlan}
          isLoading={isGenerating}
          disabled={activeTaskCount === 0}
          className="gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-current" />
          Generate Plan
        </Button>
      </div>

      {/* Main planner state */}
      {isGenerating ? (
        // Skeleton loader
        <div className="border border-border bg-card rounded-lg p-6 space-y-6 animate-pulse shadow-none">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-40 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </div>
      ) : !plan ? (
        // Un-generated state
        <div className="py-16 text-center border border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-muted/5">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-4 border border-border">
            <Sparkles className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <h4 className="text-xs font-semibold text-foreground mb-1">
            No plan generated
          </h4>
          <p className="text-[11px] text-muted-foreground max-w-xs leading-normal">
            Generate a personalized plan based on your current tasks.
          </p>
        </div>
      ) : plan.priorityRanking.length === 0 ? (
        <div className="py-14 text-center border border-dashed border-border rounded-lg bg-muted/5">
          <p className="text-xs text-muted-foreground">
            Your tasks are completed! Add new tasks to construct a new workspace layout.
          </p>
        </div>
      ) : (
        // Plan generated output
        <div className="space-y-6">
          {/* 4 Compact stats cards (Insights summary) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-border rounded-lg p-4 bg-card shadow-none">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Focus Hours
              </span>
              <span className="text-base font-semibold text-foreground">
                {focusHours} hrs
              </span>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card shadow-none">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Today's Tasks
              </span>
              <span className="text-base font-semibold text-foreground">
                {activeTaskCount}
              </span>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card shadow-none">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Workload
              </span>
              <span className="text-base font-semibold text-foreground">
                {workload}
              </span>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card shadow-none">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Priority Level
              </span>
              <span className="text-base font-semibold text-foreground">
                {highestPriority}
              </span>
            </div>
          </div>

          {/* Core Plan cards (Ranking and Timeline) */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Priority Ranking Card */}
            <div className="border border-border bg-card rounded-lg p-5 shadow-none space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
                <ListOrdered className="h-3.5 w-3.5 text-foreground" /> Priority Ranking
              </h4>
              <div className="space-y-2.5">
                {plan.priorityRanking.map((item) => (
                  <div
                    key={item.id}
                    className="border border-border rounded-lg p-3 bg-muted/10 hover:border-neutral-300 dark:hover:border-neutral-800 transition-colors duration-150"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-foreground border border-border flex items-center justify-center shrink-0 mt-0.5">
                        {item.order}
                      </span>
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-foreground truncate">
                          {item.taskName}
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Timeline Card */}
            <div className="border border-border bg-card rounded-lg p-5 shadow-none space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
                <Calendar className="h-3.5 w-3.5 text-foreground" /> Suggested Timeline
              </h4>
              <div className="relative border-l border-border pl-4 ml-2.5 space-y-4 pt-1">
                {plan.timeline.map((block, idx) => (
                  <div key={idx} className="relative group">
                    {/* Bullet marker on line */}
                    <span className="absolute -left-[20.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-foreground border border-background" />

                    <div>
                      <span className="inline-block text-[9px] font-mono font-medium text-muted-foreground border border-border px-1.5 py-0.5 rounded bg-muted/40 mb-1">
                        {block.timeRange}
                      </span>
                      <h5 className="text-xs font-semibold text-foreground">
                        {block.taskName}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          {plan.recommendations && plan.recommendations.length > 0 && (
            <div className="border border-border bg-card rounded-lg p-5 shadow-none space-y-3">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <AlertCircle className="h-3.5 w-3.5 text-foreground" /> Recommendations
              </h4>
              <ul className="space-y-1.5 list-disc pl-4">
                {plan.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-muted-foreground leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
