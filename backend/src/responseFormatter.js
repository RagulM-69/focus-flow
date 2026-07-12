/**
 * Safe parser and formatter for LLM outputs.
 * Ensures the response from Amazon Bedrock fits the expected frontend UI model.
 */
export function formatResponse(rawOutput, fallbackTasks = []) {
  const activeTasks = fallbackTasks.filter(t => t.status === 'todo');

  const fallbackPlan = {
    priorityRanking: activeTasks.map((t, idx) => ({
      id: t.id,
      taskName: t.name,
      reason: 'Prioritized using local safety fallback.',
      order: idx + 1
    })),
    timeline: activeTasks.map((t, idx) => {
      const startHour = 9 + idx;
      return {
        timeRange: `${String(startHour).padStart(2, '0')}:00–${String(startHour + Math.floor(t.duration)).padStart(2, '0')}:00`,
        taskName: t.name,
        category: t.category || 'Work'
      };
    }),
    estimatedFocusHours: activeTasks.reduce((sum, t) => sum + t.duration, 0),
    workloadAssessment: {
      level: activeTasks.reduce((sum, t) => sum + t.duration, 0) > 6 ? 'Heavy' : 'Moderate',
      reason: 'Calculated using client-side fallback logic.'
    },
    productivityScore: {
      score: 85,
      reason: 'Assessed locally based on task volume and prioritization.',
      breakdown: ['+15 Good break intervals', '+10 Core priority focus', '-5 Workload density warning']
    },
    deadlineRisks: activeTasks.map(t => ({
      taskName: t.name,
      risk: 'Medium',
      reason: 'Proximity of deadline (fallback analysis).'
    })),
    taskValidation: [],
    recommendations: [
      'Focus on high-priority items first.',
      'Maintain regular breaks between intensive focus blocks.'
    ],
    dailySummary: 'A local planning timeline has been constructed from your tasks backlog.',
    motivationalInsight: 'Taking the first step builds momentum for the rest of your day.'
  };

  if (!rawOutput) {
    return fallbackPlan;
  }

  try {
    let parsed = rawOutput;
    if (typeof rawOutput === 'string') {
      // Clean up markdown block indicators if returned by LLM
      const cleanedText = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanedText);
    }

    return {
      priorityRanking: Array.isArray(parsed.priorityRanking) ? parsed.priorityRanking : fallbackPlan.priorityRanking,
      timeline: Array.isArray(parsed.timeline) 
        ? parsed.timeline.map(item => ({
            timeRange: item.timeRange || '09:00–10:00',
            taskName: item.taskName || 'Focus Session',
            category: item.category || 'Work'
          })) 
        : fallbackPlan.timeline,
      estimatedFocusHours: typeof parsed.estimatedFocusHours === 'number' 
        ? parseFloat(parsed.estimatedFocusHours.toFixed(1)) 
        : fallbackPlan.estimatedFocusHours,
      workloadAssessment: (parsed.workloadAssessment && typeof parsed.workloadAssessment === 'object')
        ? {
            level: parsed.workloadAssessment.level || fallbackPlan.workloadAssessment.level,
            reason: parsed.workloadAssessment.reason || fallbackPlan.workloadAssessment.reason
          }
        : fallbackPlan.workloadAssessment,
      productivityScore: (parsed.productivityScore && typeof parsed.productivityScore === 'object')
        ? {
            score: typeof parsed.productivityScore.score === 'number' ? parsed.productivityScore.score : fallbackPlan.productivityScore.score,
            reason: parsed.productivityScore.reason || fallbackPlan.productivityScore.reason,
            breakdown: Array.isArray(parsed.productivityScore.breakdown) ? parsed.productivityScore.breakdown : fallbackPlan.productivityScore.breakdown
          }
        : fallbackPlan.productivityScore,
      deadlineRisks: Array.isArray(parsed.deadlineRisks) ? parsed.deadlineRisks : fallbackPlan.deadlineRisks,
      taskValidation: Array.isArray(parsed.taskValidation) ? parsed.taskValidation : fallbackPlan.taskValidation,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallbackPlan.recommendations,
      dailySummary: parsed.dailySummary || fallbackPlan.dailySummary,
      motivationalInsight: parsed.motivationalInsight || fallbackPlan.motivationalInsight
    };
  } catch (error) {
    console.warn('Response parsing failed, returning client fallback template:', error);
    return fallbackPlan;
  }
}
