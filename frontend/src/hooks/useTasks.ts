import { useLocalStorage } from './useLocalStorage';
import type { Task } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('focusflow_tasks', []);

  const addTask = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      status: 'todo',
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updatedFields } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: task.status === 'completed' ? 'todo' : 'completed' }
          : task
      )
    );
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete
  };
}
