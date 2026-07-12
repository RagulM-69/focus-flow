import type { Task, ProductivityPlan } from '../types';
import { apiClient } from './apiClient';

/**
 * Service abstraction for the FocusFlow planner endpoint.
 */
export const plannerApi = {
  /**
   * Calls the remote backend API to generate a structured daily plan from tasks.
   */
  generatePlan: async (tasks: Task[]): Promise<ProductivityPlan> => {
    return apiClient.post<ProductivityPlan>('', { tasks });
  }
};
