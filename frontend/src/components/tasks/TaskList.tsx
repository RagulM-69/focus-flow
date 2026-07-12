import React, { useState } from 'react';
import type { Task } from '../../types';
import { Badge } from '../shared/Badge';
import { 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Search, 
  Briefcase, 
  BookOpen, 
  Dumbbell, 
  ShoppingCart, 
  User, 
  Tag 
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask
}) => {
  const [filter, setFilter] = useState<'all' | 'todo' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks based on selected tab & search query
  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      filter === 'all' ||
      (filter === 'todo' && task.status === 'todo') ||
      (filter === 'completed' && task.status === 'completed');

    const matchesSearch = 
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && matchesSearch;
  });

  // Helper to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if a deadline is overdue
  const isOverdue = (dateStr: string, status: 'todo' | 'completed') => {
    if (status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateStr);
    return deadline < today;
  };

  // Helper to render category icon
  const getCategoryIcon = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('work') || cat.includes('job') || cat.includes('office')) {
      return <Briefcase className="h-3 w-3 text-muted-foreground/80" />;
    }
    if (cat.includes('study') || cat.includes('learn') || cat.includes('read') || cat.includes('course') || cat.includes('aws')) {
      return <BookOpen className="h-3 w-3 text-muted-foreground/80" />;
    }
    if (cat.includes('fit') || cat.includes('gym') || cat.includes('health') || cat.includes('workout') || cat.includes('sport')) {
      return <Dumbbell className="h-3 w-3 text-muted-foreground/80" />;
    }
    if (cat.includes('shop') || cat.includes('buy') || cat.includes('grocery') || cat.includes('order')) {
      return <ShoppingCart className="h-3 w-3 text-muted-foreground/80" />;
    }
    if (cat.includes('person') || cat.includes('life') || cat.includes('self') || cat.includes('home')) {
      return <User className="h-3 w-3 text-muted-foreground/80" />;
    }
    return <Tag className="h-3 w-3 text-muted-foreground/80" />;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks by name, category, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-9 pr-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex gap-2">
          {(['all', 'todo', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === tab
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-foreground border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
        </span>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center flex flex-col items-center justify-center">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center mb-3">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1">No tasks found</h4>
          <p className="text-xs text-muted-foreground max-w-[240px]">
            {filter === 'all'
              ? 'No tasks match your search query or backlog criteria.'
              : `You have no ${filter} tasks matching your selection.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredTasks.map((task) => {
            const overdue = isOverdue(task.deadline, task.status);
            return (
              <div
                key={task.id}
                className={`group border border-border rounded-lg p-4 bg-card hover:border-neutral-305 dark:hover:border-neutral-700 hover:shadow-sm hover:scale-[1.002] transition-all duration-150 ease-in-out ${
                  task.status === 'completed' ? 'opacity-50 bg-muted/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Custom Checkbox Button */}
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-foreground dark:text-neutral-350 fill-muted/10" />
                    ) : (
                      <Circle className="h-4.5 w-4.5" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-sm font-semibold text-foreground truncate tracking-tight ${
                          task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.name}
                      </h4>

                      {/* Action Menu (Visible on hover) */}
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1.5 transition-opacity shrink-0 duration-150">
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Edit Task"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete Task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Consolidated Metadata Row */}
                    <div className="flex flex-wrap items-center gap-x-2 mt-2 text-[11px] text-muted-foreground font-medium">
                      {/* Priority */}
                      <Badge
                        variant={task.priority}
                        className="text-[9px] px-1.5 py-0 border-none capitalize font-semibold shadow-none"
                      >
                        {task.priority}
                      </Badge>
                      
                      <span className="text-neutral-300 dark:text-neutral-800 select-none">·</span>

                      {/* Category */}
                      <span className="inline-flex items-center gap-1 text-foreground/80">
                        {getCategoryIcon(task.category)}
                        {task.category}
                      </span>
                      
                      <span className="text-neutral-300 dark:text-neutral-800 select-none">·</span>

                      {/* Duration */}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/75" />
                        {task.duration} hr{task.duration !== 1 ? 's' : ''}
                      </span>

                      <span className="text-neutral-300 dark:text-neutral-800 select-none">·</span>

                      {/* Deadline */}
                      <span
                        className={`inline-flex items-center gap-1 ${
                          overdue ? 'text-red-500 font-semibold' : ''
                        }`}
                      >
                        <Calendar className="h-3 w-3 text-muted-foreground/75" />
                        {formatDate(task.deadline)}
                        {overdue && (
                          <span className="ml-1 text-[9px] px-1 rounded-sm bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/20">
                            Overdue
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Notes, if present */}
                    {task.notes && (
                      <p className="text-xs text-muted-foreground mt-2 border-l-2 border-border pl-2 italic max-w-full truncate">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
