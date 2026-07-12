/**
 * Formats a task list into a clear markdown instruction prompt for LLM consumption.
 */
export function buildPrompt(tasks) {
  const taskSummaryList = tasks
    .map(
      (t, index) =>
        `${index + 1}. Title: "${t.name}" | Category: "${t.category}" | Priority: "${t.priority}" | Duration: ${t.duration} hrs | Deadline: "${t.deadline}" | Notes: "${t.notes || ''}"`
    )
    .join('\n');

  return `
You are FocusFlow AI, an intelligent productivity planner.
Your goal is to organize, prioritize, and structure the following task list into a daily productivity calendar.

TASKS TO SCHEDULE:
${tasks.length === 0 ? 'No tasks provided.' : taskSummaryList}

INSTRUCTIONS:
1. Prioritize tasks by priority weight (high first, then medium, then low) and proximity of deadlines.
2. Provide a short, logical reasoning explanation for each priority rank item.
3. Construct a daily time block timeline (Suggested Timeline) starting at 09:00, allocating duration blocks for high-priority items. Include 15-minute breaks between consecutive blocks.
4. Estimate total focus hours.
5. Provide 3 action-oriented productivity recommendations.
6. Return your output EXACTLY as a valid JSON object matching the schema below. Do not wrap the JSON in markdown code blocks.

JSON SCHEMA:
{
  "priorityRanking": [
    { "id": "task_id_here", "taskName": "string", "reason": "string", "order": number }
  ],
  "timeline": [
    { "timeRange": "HH:MM–HH:MM", "taskName": "string" }
  ],
  "estimatedFocusHours": number,
  "recommendations": ["string"]
}
`;
}
