import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Task } from '../../types';
import { Button } from '../shared/Button';
import { Calendar, Clock, Tag, FileText, AlertCircle, X, Check } from 'lucide-react';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(80, 'Task name is too long'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid deadline date',
  }),
  duration: z.number({ message: 'Estimated duration is required' })
    .min(0.25, 'Minimum duration is 15 minutes (0.25 hours)')
    .max(12, 'Maximum duration is 12 hours per task'),
  notes: z.string().optional()
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
  taskToEdit?: Task | null;
  onCancelEdit?: () => void;
}

const CATEGORIES = ['Work', 'Personal', 'Side Project', 'Finance', 'Learning', 'Health'];

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, taskToEdit, onCancelEdit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      category: 'Work',
      priority: 'medium',
      deadline: new Date().toISOString().split('T')[0],
      duration: 1,
      notes: ''
    }
  });

  // Reset form when taskToEdit changes (editing vs adding)
  useEffect(() => {
    if (taskToEdit) {
      reset({
        name: taskToEdit.name,
        category: taskToEdit.category,
        priority: taskToEdit.priority,
        deadline: taskToEdit.deadline,
        duration: taskToEdit.duration,
        notes: taskToEdit.notes || ''
      });
    } else {
      reset({
        name: '',
        category: 'Work',
        priority: 'medium',
        deadline: new Date().toISOString().split('T')[0],
        duration: 1,
        notes: ''
      });
    }
  }, [taskToEdit, reset]);

  const handleFormSubmit = (values: TaskFormValues) => {
    onSubmit(values);
    if (!taskToEdit) {
      // Clear fields if we are creating a new task, keeping defaults
      reset({
        name: '',
        category: 'Work',
        priority: 'medium',
        deadline: new Date().toISOString().split('T')[0],
        duration: 1,
        notes: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 border border-border bg-card rounded-lg p-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {taskToEdit ? 'Edit Task' : 'New Task'}
        </h3>
        {taskToEdit && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
            title="Cancel editing"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Task Name */}
      <div>
        <label htmlFor="task-name" className="block text-xs font-medium text-muted-foreground mb-1">
          Task Name
        </label>
        <input
          id="task-name"
          type="text"
          placeholder="What needs to be done?"
          className={`w-full px-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-ring ${
            errors.name ? 'border-destructive focus:ring-destructive' : 'border-border'
          }`}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {errors.name.message}
          </p>
        )}
      </div>

      {/* Grid for Category, Priority, Duration, Deadline */}
      <div className="grid grid-cols-2 gap-3">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <Tag className="h-3 w-3" /> Category
          </label>
          <input
            id="category"
            type="text"
            list="category-suggestions"
            placeholder="Meeting, Personal, Study..."
            className={`w-full px-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-ring ${
              errors.category ? 'border-destructive focus:ring-destructive' : 'border-border'
            }`}
            {...register('category')}
          />
          <datalist id="category-suggestions">
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-xs font-medium text-muted-foreground mb-1">
            Priority
          </label>
          <select
            id="priority"
            className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            {...register('priority')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Estimated Duration
          </label>
          <input
            id="duration"
            type="number"
            step="0.25"
            placeholder="1.5"
            className={`w-full px-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-ring ${
              errors.duration ? 'border-destructive focus:ring-destructive' : 'border-border'
            }`}
            {...register('duration', { valueAsNumber: true })}
          />
          {errors.duration && (
            <p className="text-xs text-destructive mt-1">
              {errors.duration.message}
            </p>
          )}
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Deadline
          </label>
          <input
            id="deadline"
            type="date"
            className={`w-full px-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-ring ${
              errors.deadline ? 'border-destructive focus:ring-destructive' : 'border-border'
            }`}
            {...register('deadline')}
          />
          {errors.deadline && (
            <p className="text-xs text-destructive mt-1">
              {errors.deadline.message}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
          <FileText className="h-3 w-3" /> Notes
        </label>
        <textarea
          id="notes"
          rows={2}
          placeholder="Add any additional context..."
          className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          {...register('notes')}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end pt-2">
        {taskToEdit && onCancelEdit && (
          <Button type="button" variant="outline" size="sm" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" className="gap-1.5">
          {taskToEdit ? <Check className="h-3.5 w-3.5" /> : null}
          {taskToEdit ? 'Save Changes' : '+ Add Task'}
        </Button>
      </div>
    </form>
  );
};
