import type { Task, ProductivityPlan } from '../types';
import { apiClient } from './apiClient';
import { plannerApi } from './plannerApi';

/**
 * Fallback local planning mock logic used if VITE_API_URL is not set or the API call fails.
 */
const generateMockProductivityPlan = async (tasks: Task[]): Promise<ProductivityPlan> => {
  // Simulate network latency (e.g., Lambda invocation time)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const activeTasks = tasks.filter((t) => t.status === 'todo');

  if (activeTasks.length === 0) {
    return {
      priorityRanking: [],
      timeline: [],
      estimatedFocusHours: 0,
      recommendations: [
        'Add some tasks in the Task panel to see them structured into a daily flow.',
        'High priority items will be automatically scheduled first.',
        'Set reasonable task durations to create an accurate daily planning timeline.'
      ]
    };
  }

  // 1. Sort tasks: High priority first, then closer deadline
  const sortedTasks = [...activeTasks].sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (weightDiff !== 0) return weightDiff;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  // 2. Priority ranking with reasoning
  const priorityRanking = sortedTasks.map((task, index) => {
    let reason = 'Flexible scheduling based on task profile.';
    if (task.priority === 'high') {
      reason = 'Highest priority with immediate focus recommended for maximum productivity impact.';
    } else if (task.priority === 'medium') {
      reason = 'Important task to maintain steady development progress and avoid bottlenecks.';
    } else if (task.duration >= 3) {
      reason = 'Substantial task requiring block scheduling during peak cognitive hours.';
    } else if (task.duration <= 1) {
      reason = 'Quick win task to easily build momentum in your work sessions.';
    }

    return {
      id: task.id,
      taskName: task.name,
      reason,
      order: index + 1
    };
  });

  // 3. Daily timeline
  let currentHour = 9;
  let currentMinute = 0;
  const timeline = [];
  const tasksToSchedule = sortedTasks.slice(0, 5);

  for (const task of tasksToSchedule) {
    const durationHours = task.duration;
    const startStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    currentHour += Math.floor(durationHours);
    currentMinute += Math.round((durationHours % 1) * 60);
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
    
    const endStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    timeline.push({
      timeRange: `${startStr}–${endStr}`,
      taskName: task.name
    });

    currentMinute += 15;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute -= 60;
    }
  }

  const estimatedFocusHours = activeTasks.reduce((acc, t) => acc + t.duration, 0);

  const recommendations = [
    'Focus on high-energy, complex tasks in your morning peak hours.',
    'Batch similar small tasks (like email updates or quick responses) together in the afternoon.',
    'Take short 10-15 minute breaks between focus blocks to maintain sustained mental stamina.'
  ];

  if (estimatedFocusHours > 6) {
    recommendations.push('Your daily workload is heavy. Consider delegating or rescheduling non-urgent tasks to avoid burnout.');
  } else if (estimatedFocusHours < 3 && activeTasks.length > 0) {
    recommendations.push('You have a light focus day. Great opportunity to work on backlog items or skill development.');
  }

  return {
    priorityRanking,
    timeline,
    estimatedFocusHours: parseFloat(estimatedFocusHours.toFixed(1)),
    recommendations
  };
};

/**
 * Orchestrates plan generation.
 * Connects to the AWS Lambda backend service via plannerApi if VITE_API_URL is configured,
 * otherwise falls back seamlessly to the mock calculation engine.
 */
export const generateProductivityPlan = async (tasks: Task[]): Promise<ProductivityPlan> => {
  if (apiClient.isConfigured()) {
    try {
      return await plannerApi.generatePlan(tasks);
    } catch (error) {
      console.warn('Backend connection failed; using local planner client fallback:', error);
      return generateMockProductivityPlan(tasks);
    }
  }

  return generateMockProductivityPlan(tasks);
};
