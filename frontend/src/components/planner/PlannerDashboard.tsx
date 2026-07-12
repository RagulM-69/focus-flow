import React, { useState, useEffect, useRef } from 'react';
import type { ProductivityPlan } from '../../types';
import { Button } from '../shared/Button';
import { 
  Sparkles, 
  AlertCircle, 
  Compass, 
  ListOrdered, 
  Calendar, 
  Award, 
  Activity, 
  FileText,
  AlertTriangle,
  Download,
  CheckCircle2
} from 'lucide-react';

interface PlannerDashboardProps {
  plan: ProductivityPlan | null;
  onGeneratePlan: () => void;
  isGenerating: boolean;
  activeTaskCount: number;
}

export const PlannerDashboard: React.FC<PlannerDashboardProps> = ({
  plan,
  onGeneratePlan,
  isGenerating,
  activeTaskCount
}) => {
  const [loadingStep, setLoadingStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const prevPlanRef = useRef<ProductivityPlan | null>(null);

  // Success toast effect
  useEffect(() => {
    if (plan && !prevPlanRef.current) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
    prevPlanRef.current = plan;
  }, [plan]);

  // Loading status text sequencer
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const focusHours = plan ? plan.estimatedFocusHours : 0;
  const workloadLevel = plan?.workloadAssessment?.level || 'Moderate';
  const productivityScore = plan?.productivityScore?.score || 85;

  // Helper to color risk levels
  const getRiskColor = (risk: string) => {
    switch ((risk || '').toLowerCase()) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30';
      case 'high':
        return 'text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/20';
      default:
        return 'text-neutral-500 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800';
    }
  };

  // Helper to fetch timeline category emojis
  const getTimelineEmoji = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('work') || cat.includes('job') || cat.includes('office')) return '🟩';
    if (cat.includes('study') || cat.includes('learn') || cat.includes('aws') || cat.includes('read')) return '🟦';
    if (cat.includes('break')) return '☕';
    if (cat.includes('lunch') || cat.includes('food') || cat.includes('eat')) return '🍔';
    if (cat.includes('fit') || cat.includes('gym') || cat.includes('run')) return '🏃';
    if (cat.includes('shop') || cat.includes('buy') || cat.includes('store')) return '🛍️';
    if (cat.includes('person') || cat.includes('self') || cat.includes('home')) return '🟨';
    return '📋';
  };

  // Segmented Workload Meter blocks
  const getWorkloadMeter = (level: string) => {
    let filledSegments = 3;
    let colorClass = 'bg-neutral-300 dark:bg-neutral-600';
    if (level.toLowerCase() === 'moderate') {
      filledSegments = 5;
      colorClass = 'bg-blue-500';
    } else if (level.toLowerCase() === 'heavy') {
      filledSegments = 8;
      colorClass = 'bg-amber-500';
    } else if (level.toLowerCase() === 'overloaded') {
      filledSegments = 10;
      colorClass = 'bg-red-500';
    }

    return (
      <div className="flex gap-1 mt-2">
        {Array.from({ length: 10 }).map((_, idx) => (
          <span
            key={idx}
            className={`h-2.5 w-3.5 rounded-sm border border-border/40 transition-colors duration-200 ${
              idx < filledSegments ? colorClass : 'bg-neutral-100 dark:bg-neutral-800'
            }`}
          />
        ))}
      </div>
    );
  };

  // Safe Daily Plan markdown download
  const handleDownloadPlan = () => {
    if (!plan) return;
    let text = `# FocusFlow Daily Productivity Plan\n`;
    text += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    text += `=========================================\n`;
    text += `Productivity Score: ${plan.productivityScore?.score}/100\n`;
    text += `Workload Assessment: ${plan.workloadAssessment?.level} - ${plan.workloadAssessment?.reason}\n`;
    text += `Focus Hours Estimate: ${plan.estimatedFocusHours} hrs\n`;
    text += `=========================================\n\n`;
    text += `## Daily Summary\n${plan.dailySummary}\n\n`;
    text += `## Suggested Timeline\n`;
    plan.timeline.forEach((item) => {
      text += `- ${item.timeRange}: ${item.taskName} (${item.category})\n`;
    });
    text += `\n## Priority Ranking & Coaching Reasons\n`;
    plan.priorityRanking.forEach((item) => {
      text += `${item.order}. ${item.taskName} - ${item.reason}\n`;
    });
    text += `\n## Personal Recommendations\n`;
    plan.recommendations.forEach((item) => {
      text += `- ${item}\n`;
    });
    text += `\n\n---\nOptimized with FocusFlow. Reclaim your focus.`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'FocusFlow_Daily_Plan.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="border border-border bg-card rounded-xl p-5 flex items-center justify-between flex-wrap gap-3 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Compass className="h-4 w-4 text-muted-foreground" /> Workspace Plan
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Optimize your daily output using task prioritization.
          </p>
        </div>

        <div className="flex gap-2">
          {plan && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPlan}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              Download Plan
            </Button>
          )}
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
      </div>

      {/* Main planner state */}
      {isGenerating ? (
        // Sequential Loading State
        <div className="border border-border bg-card rounded-xl p-8 space-y-6 shadow-sm flex flex-col items-center justify-center py-14">
          <div className="animate-spin h-6 w-6 border-2 border-neutral-600 border-t-transparent rounded-full mb-3" />
          <h4 className="text-xs font-semibold text-foreground tracking-tight">
            🧠 FocusFlow AI is analyzing your workload...
          </h4>
          <div className="space-y-3 w-full max-w-xs text-xs text-muted-foreground mt-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold shrink-0">✔</span>
              <span className="text-foreground font-medium">Understanding priorities</span>
            </div>
            <div className="flex items-center gap-2">
              {loadingStep >= 1 ? (
                <span className="text-green-600 dark:text-green-400 font-bold shrink-0">✔</span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 ml-1.5 mr-1" />
              )}
              <span className={loadingStep >= 1 ? 'text-foreground font-medium' : 'opacity-50'}>
                Evaluating deadlines
              </span>
            </div>
            <div className="flex items-center gap-2">
              {loadingStep >= 2 ? (
                <span className="text-green-600 dark:text-green-400 font-bold shrink-0">✔</span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 ml-1.5 mr-1" />
              )}
              <span className={loadingStep >= 2 ? 'text-foreground font-medium' : 'opacity-50'}>
                Building timeline
              </span>
            </div>
            <div className="flex items-center gap-2">
              {loadingStep >= 3 ? (
                <span className="text-green-600 dark:text-green-400 font-bold shrink-0">✔</span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 ml-1.5 mr-1" />
              )}
              <span className={loadingStep >= 3 ? 'text-foreground font-medium' : 'opacity-50'}>
                Writing coaching insights
              </span>
            </div>
          </div>
        </div>
      ) : !plan ? (
        // Un-generated state
        <div className="py-16 text-center border border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/5">
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
        <div className="py-14 text-center border border-dashed border-border rounded-xl bg-muted/5">
          <p className="text-xs text-muted-foreground">
            Your tasks are completed! Add new tasks in the tasks backlog to construct a new workspace layout.
          </p>
        </div>
      ) : (
        // Plan generated output
        <div className="space-y-6">
          
          {/* 4 Compact stats cards (Insights summary) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-border rounded-xl p-4 bg-card shadow-sm hover:border-neutral-305 transition-colors">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Focus Hours
              </span>
              <span className="text-base font-semibold text-foreground">
                {focusHours} hrs
              </span>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card shadow-sm hover:border-neutral-305 transition-colors">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Today's Tasks
              </span>
              <span className="text-base font-semibold text-foreground">
                {activeTaskCount}
              </span>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card shadow-sm hover:border-neutral-305 transition-colors">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Workload
              </span>
              <span className="text-base font-semibold text-foreground block">
                {workloadLevel}
              </span>
              {getWorkloadMeter(workloadLevel)}
            </div>
            <div className="border border-border rounded-xl p-4 bg-card shadow-sm hover:border-neutral-305 transition-colors">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Productivity Score
              </span>
              <span className="text-base font-semibold text-foreground">
                {productivityScore}/100
              </span>
            </div>
          </div>

          {/* Coaching Summary Overview Card (Rendered if daily summary exists) */}
          {plan.dailySummary && (
            <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Coaching Insights
                </h4>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Daily Summary Paragraph & Motivational Insight */}
                <div className="md:col-span-2 space-y-3 border-r border-border pr-6">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {plan.dailySummary}
                  </p>
                  
                  {plan.motivationalInsight && (
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-border rounded-lg text-[11px] font-medium text-foreground flex items-center gap-2">
                      <span className="text-xs">✨</span>
                      {plan.motivationalInsight}
                    </div>
                  )}

                  {/* Assessment Details */}
                  {(plan.workloadAssessment?.reason || plan.productivityScore?.reason) && (
                    <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-border text-[11px]">
                      {plan.workloadAssessment?.reason && (
                        <div>
                          <span className="block font-semibold text-foreground mb-0.5 flex items-center gap-1">
                            <Activity className="h-3 w-3 text-muted-foreground" /> Workload Assessment
                          </span>
                          <span className="text-muted-foreground leading-normal">{plan.workloadAssessment.reason}</span>
                        </div>
                      )}
                      {plan.productivityScore?.reason && (
                        <div>
                          <span className="block font-semibold text-foreground mb-0.5 flex items-center gap-1">
                            <Award className="h-3 w-3 text-muted-foreground" /> Score Analysis
                          </span>
                          <span className="text-muted-foreground leading-normal">{plan.productivityScore.reason}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Score Adjustments Breakdown Column */}
                <div className="flex flex-col justify-center">
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
                    Score Adjustments
                  </span>
                  {plan.productivityScore?.breakdown && plan.productivityScore.breakdown.length > 0 ? (
                    <div className="space-y-1.5 text-[11px] font-medium">
                      {plan.productivityScore.breakdown.map((item, idx) => {
                        const isPositive = item.startsWith('+');
                        return (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className={`text-[10px] ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {isPositive ? '▲' : '▼'}
                            </span>
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Adjustments computed cleanly.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Conditionally Render Invalid / Problematic Tasks Validation Panel */}
          {plan.taskValidation && plan.taskValidation.length > 0 && (
            <div className="border border-red-200/50 dark:border-red-950/30 bg-red-50/30 dark:bg-red-950/5 rounded-xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 border-b border-red-100 dark:border-red-950/20 pb-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <h4 className="text-xs uppercase font-bold tracking-wider text-red-700 dark:text-red-400">
                  Invalid Tasks Flagged
                </h4>
              </div>
              <div className="space-y-3">
                {plan.taskValidation.map((validation, idx) => (
                  <div key={idx} className="text-xs border-l-2 border-red-350 dark:border-red-900/60 pl-3">
                    <span className="font-semibold text-red-700 dark:text-red-400 block">{validation.taskName}</span>
                    <p className="text-muted-foreground mt-0.5">
                      <strong className="text-foreground/80 font-medium">Issue:</strong> {validation.issue} — {validation.reason}
                    </p>
                    <p className="text-foreground mt-1">
                      <strong className="font-medium text-foreground/80">Suggestion:</strong> {validation.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Plan cards (Ranking and Timeline) */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Priority Ranking Card */}
            <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
                <ListOrdered className="h-3.5 w-3.5 text-foreground" /> Priority Ranking
              </h4>
              <div className="space-y-2.5">
                {plan.priorityRanking.map((item) => (
                  <div
                    key={item.id}
                    className="border border-border rounded-lg p-3 bg-muted/10 hover:border-neutral-350 dark:hover:border-neutral-800 transition-colors duration-150"
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
            <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
                <Calendar className="h-3.5 w-3.5 text-foreground" /> Suggested Timeline
              </h4>
              <div className="relative border-l border-border pl-4 ml-2.5 space-y-4 pt-1">
                {plan.timeline.map((block, idx) => (
                  <div key={idx} className="relative group">
                    {/* Bullet marker on line */}
                    <span className="absolute -left-[20.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-foreground border border-background" />

                    <div className="space-y-1">
                      <span className="inline-block text-[9px] font-mono font-medium text-muted-foreground border border-border px-1.5 py-0.5 rounded bg-muted/40">
                        {block.timeRange}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs shrink-0 select-none" title={block.category}>
                          {getTimelineEmoji(block.category)}
                        </span>
                        <h5 className="text-xs font-semibold text-foreground truncate">
                          {block.taskName}
                        </h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deadline Risks & Recommendations Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Deadline Risks Card */}
            <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
                <AlertCircle className="h-3.5 w-3.5 text-foreground" /> Deadline Risks
              </h4>
              <div className="space-y-3">
                {plan.deadlineRisks && plan.deadlineRisks.length > 0 ? (
                  plan.deadlineRisks.map((riskItem, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 text-xs border border-border rounded-lg p-3 bg-muted/10">
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground block truncate">{riskItem.taskName}</span>
                        <span className="text-[11px] text-muted-foreground mt-0.5 block leading-normal">
                          {riskItem.reason}
                        </span>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border shrink-0 ${getRiskColor(riskItem.risk)}`}>
                        {riskItem.risk}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">No active tasks with deadline risk.</p>
                )}
              </div>
            </div>

            {/* Personalized Recommendations Card */}
            <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
                <FileText className="h-3.5 w-3.5 text-foreground" /> Recommendations
              </h4>
              <ul className="space-y-2.5 list-disc pl-4">
                {(plan.recommendations || []).map((rec, index) => (
                  <li key={index} className="text-xs text-muted-foreground leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* Success Notification Toast */}
      {showSuccess && (
        <div className="fixed bottom-5 right-5 bg-foreground text-background text-xs px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-border animate-bounce z-50">
          <CheckCircle2 className="h-4 w-4 text-green-500 fill-current" />
          <span className="font-semibold">Plan Generated Successfully! ✨</span>
        </div>
      )}
    </div>
  );
};
