/**
 * Safe parser and formatter for LLM outputs.
 * Ensures the response from Amazon Bedrock fits the expected frontend UI model.
 */
export function formatResponse(rawOutput, fallbackTasks = []) {
  const fallbackPlan = {
    priorityRanking: fallbackTasks.map((t, idx) => ({
      id: t.id,
      taskName: t.name,
      reason: 'Structured by local safety fallback.',
      order: idx + 1
    })),
    timeline: [],
    estimatedFocusHours: fallbackTasks.reduce((sum, t) => sum + t.duration, 0),
    recommendations: ['Check model inputs.', 'Ensure AWS Bedrock connection is healthy.']
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
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : fallbackPlan.timeline,
      estimatedFocusHours: typeof parsed.estimatedFocusHours === 'number' 
        ? parseFloat(parsed.estimatedFocusHours.toFixed(1)) 
        : fallbackPlan.estimatedFocusHours,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallbackPlan.recommendations
    };
  } catch (error) {
    console.warn('Response parsing failed, returning client fallback template:', error);
    return fallbackPlan;
  }
}
