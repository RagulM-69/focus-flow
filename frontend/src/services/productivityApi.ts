import type { Task, ProductivityPlan, TaskValidation, DeadlineRisk } from '../types';
import { apiClient } from './apiClient';
import { plannerApi } from './plannerApi';

/**
 * Fallback local planning mock logic used if VITE_API_URL is not set or the API call fails.
 * Mock planner mimics the new coaching engine schema.
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
      workloadAssessment: {
        level: 'Light',
        reason: 'No active tasks backlog detected.'
      },
      productivityScore: {
        score: 100,
        reason: 'No scheduling friction or workload overload exists.',
        breakdown: ['+100 Complete planning freedom']
      },
      deadlineRisks: [],
      taskValidation: [],
      recommendations: [
        'Add some tasks in the Task panel to see them structured into a daily flow.',
        'High priority items will be automatically scheduled first.',
        'Set reasonable task durations to create an accurate daily planning timeline.'
      ],
      dailySummary: 'No tasks scheduled for today. Add items to your backlog to construct a timeline.',
      motivationalInsight: 'A clean slate is the perfect starting point to define your goals.'
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

  for (let i = 0; i < tasksToSchedule.length; i++) {
    const task = tasksToSchedule[i];
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
      taskName: task.name,
      category: task.category || 'Work'
    });

    // Add a break after tasks
    if (i < tasksToSchedule.length - 1) {
      const breakStart = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      currentMinute += 15;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
      const breakEnd = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      
      timeline.push({
        timeRange: `${breakStart}–${breakEnd}`,
        taskName: 'Short Break',
        category: 'Break'
      });
    }
  }

  const estimatedFocusHours = activeTasks.reduce((acc, t) => acc + t.duration, 0);
  const workloadLevel = estimatedFocusHours > 7 ? 'Heavy' : estimatedFocusHours > 4 ? 'Moderate' : 'Light';

  // 4. Deadline risks & Task validation stubs
  const deadlineRisks: DeadlineRisk[] = activeTasks.map((t) => {
    const risk = t.priority === 'high' ? 'High' : 'Low';
    return {
      taskName: t.name,
      risk,
      reason: t.priority === 'high' ? 'Immediate deadline with high priority.' : 'Ample calendar buffer.'
    };
  });

  const taskValidation: TaskValidation[] = [];
  activeTasks.forEach((t) => {
    if (t.name.toLowerCase().includes('dinosaur') || t.name.toLowerCase().includes('teleport')) {
      taskValidation.push({
        taskName: t.name,
        issue: 'Fictional',
        reason: 'This task refers to prehistoric creatures or sci-fi concepts not currently possible.',
        suggestion: 'Replace with "Read dinosaur history" or remove the task.'
      });
    }
  });

  const recommendations = [
    'Focus on high-energy, complex tasks in your morning peak hours.',
    'Batch similar small tasks (like email updates or quick responses) together in the afternoon.',
    'Take short 10-15 minute breaks between focus blocks to maintain sustained mental stamina.'
  ];

  return {
    priorityRanking,
    timeline,
    estimatedFocusHours: parseFloat(estimatedFocusHours.toFixed(1)),
    workloadAssessment: {
      level: workloadLevel,
      reason: `You have ${activeTasks.length} active tasks totaling ${estimatedFocusHours} focused hours.`
    },
    productivityScore: {
      score: estimatedFocusHours > 8 ? 68 : 88,
      reason: estimatedFocusHours > 8 
        ? 'Workday exceeds 8 focus hours. High risk of cognitive fatigue.' 
        : 'Good balance of tasks with structured breaks.',
      breakdown: estimatedFocusHours > 8
        ? ['+15 Good break intervals', '-20 Excessive focus duration', '-12 Cognitive load overload']
        : ['+15 Good break intervals', '+10 Proper work blocks', '-7 High priority density']
    },
    deadlineRisks,
    taskValidation,
    recommendations,
    dailySummary: `Your schedule is structured with ${estimatedFocusHours} hours of focused work blocks.`,
    motivationalInsight: 'Finishing your highest-impact task before noon will create momentum for the rest of the day.'
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
      const plan = await plannerApi.generatePlan(tasks);
      console.log('✅ BEDROCK RESPONSE:', plan);
      return plan;
    } catch (error) {
      console.error('❌ BACKEND ERROR:', error);
      throw error;
    }
  }

  return generateMockProductivityPlan(tasks);
};
