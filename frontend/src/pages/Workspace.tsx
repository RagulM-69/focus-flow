import React, { useState } from 'react';
import type { Task, ProductivityPlan, ActiveTab } from '../types';
import { generateProductivityPlan } from '../services/productivityApi';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskList } from '../components/tasks/TaskList';
import { PlannerDashboard } from '../components/planner/PlannerDashboard';
import { Button } from '../components/shared/Button';
import {
  LayoutDashboard,
  Calendar,
  Settings,
  Sun,
  Moon,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface WorkspaceProps {
  tasks: Task[];
  addTask: (data: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
  updateTask: (id: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  onGoBack: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  tasks,
  addTask,
  updateTask,
  deleteTask,
  toggleComplete,
  onGoBack,
  theme,
  toggleTheme
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workspace');
  const [plan, setPlan] = useState<ProductivityPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State for task editing
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // State for mobile workspace sub-tabs (Tasks vs Planner)
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<'tasks' | 'planner'>('tasks');

  // Trigger productivity plan generation
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const generatedPlan = await generateProductivityPlan(tasks);
      setPlan(generatedPlan);
    } catch (err) {
      console.error('Plan generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskFormSubmit = (data: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, data);
      setTaskToEdit(null);
    } else {
      addTask(data);
    }
    // Auto reset plan when task list is modified to prompt re-generation
    setPlan(null);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    if (taskToEdit?.id === id) {
      setTaskToEdit(null);
    }
    setPlan(null);
  };

  const handleToggleComplete = (id: string) => {
    toggleComplete(id);
    setPlan(null);
  };

  // Format today's date
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const activeTasksCount = tasks.filter((t) => t.status === 'todo').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const totalFocusHours = tasks.reduce((sum, t) => sum + (t.status === 'todo' ? t.duration : 0), 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-200 md:translate-x-0 md:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight">FocusFlow</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button
            onClick={() => {
              setActiveTab('overview');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/55'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </button>

          <button
            onClick={() => {
              setActiveTab('workspace');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'workspace'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/55'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Planner & Tasks
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/55'
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </nav>

        {/* Bottom Profile / Logout */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground">
              GW
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-foreground truncate font-medium">Guest Workspace</span>
              <span className="block text-[10px] text-muted-foreground truncate">Local Session</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoBack}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Exit Workspace
          </Button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 rounded-md text-muted-foreground hover:bg-muted md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-semibold tracking-tight text-foreground md:block hidden">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'workspace' && 'Workspace'}
              {activeTab === 'settings' && 'Workspace Settings'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-1 rounded-md border border-border">
              {getFormattedDate()}
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-border rounded-xl p-5 bg-card">
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Active Tasks
                  </span>
                  <span className="text-2xl font-bold text-foreground">{activeTasksCount}</span>
                </div>
                <div className="border border-border rounded-xl p-5 bg-card">
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Focus Hours Needed
                  </span>
                  <span className="text-2xl font-bold text-foreground">{totalFocusHours} hrs</span>
                </div>
                <div className="border border-border rounded-xl p-5 bg-card">
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Completed Tasks
                  </span>
                  <span className="text-2xl font-bold text-foreground">{completedTasksCount}</span>
                </div>
                <div className="border border-border rounded-xl p-5 bg-card">
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                    Tasks Completion Rate
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {tasks.length > 0
                      ? Math.round((completedTasksCount / tasks.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>

              {/* Layout Split: Overview details & recent tasks */}
              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3 border border-border bg-card rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    Welcome to FocusFlow, John
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This is your personal workspace. You have <strong className="text-foreground">{activeTasksCount} active tasks</strong> waiting to be structured.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Head over to the <button onClick={() => setActiveTab('workspace')} className="text-foreground underline font-medium hover:text-neutral-600">Planner & Tasks</button> view to organize your tasks into an hourly calendar schedule. Generating a plan helps segment large tasks and optimizes cognitive loading.
                  </p>
                  
                  <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      💡 Pro SaaS Tip
                    </span>
                    <p className="text-xs text-muted-foreground leading-normal">
                      Try adding a task with a <strong className="text-foreground">High</strong> priority value. High-priority items will automatically bubble up to the top of your suggested daily timeline.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 border border-border bg-card rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                      Recent Activity
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-mono">Today</span>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      No tasks found in history.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tasks.slice(0, 4).map((task) => (
                        <div key={task.id} className="flex items-center justify-between gap-3 text-xs">
                          <span className={`truncate flex-1 ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.name}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                            task.status === 'completed' 
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border-border'
                              : 'bg-primary text-primary-foreground border-transparent'
                          }`}>
                            {task.status === 'completed' ? 'Done' : 'Todo'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TASKS & PLANNER WORKSPACE TAB */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              {/* Desktop Workspace (40% Task Panel, 60% Planner Panel) */}
              <div className="hidden md:grid md:grid-cols-10 gap-6 items-start">
                {/* Task Panel (40% = col-span-4) */}
                <div className="md:col-span-4 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">Tasks</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Capture tasks, set estimate hours, and organize.
                    </p>
                  </div>

                  <TaskForm
                    onSubmit={handleTaskFormSubmit}
                    taskToEdit={taskToEdit}
                    onCancelEdit={() => setTaskToEdit(null)}
                  />

                  <TaskList
                    tasks={tasks}
                    onToggleComplete={handleToggleComplete}
                    onEditTask={(task) => setTaskToEdit(task)}
                    onDeleteTask={handleDeleteTask}
                  />
                </div>

                {/* Planner Panel (60% = col-span-6) */}
                <div className="md:col-span-6 space-y-6">
                  <PlannerDashboard
                    plan={plan}
                    onGeneratePlan={handleGeneratePlan}
                    isGenerating={isGenerating}
                    activeTaskCount={activeTasksCount}
                  />
                </div>
              </div>

              {/* Mobile Workspace Layout (Stacked / Toggled) */}
              <div className="md:hidden space-y-4">
                {/* Mobile Sub-tabs Select */}
                <div className="flex border border-border rounded-lg overflow-hidden bg-card p-1">
                  <button
                    onClick={() => setMobileWorkspaceTab('tasks')}
                    className={`flex-1 py-2 text-xs font-semibold text-center rounded-md transition-colors ${
                      mobileWorkspaceTab === 'tasks'
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Tasks ({tasks.length})
                  </button>
                  <button
                    onClick={() => setMobileWorkspaceTab('planner')}
                    className={`flex-1 py-2 text-xs font-semibold text-center rounded-md transition-colors ${
                      mobileWorkspaceTab === 'planner'
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Planner Output
                  </button>
                </div>

                {/* Render Selected Mobile Tab */}
                {mobileWorkspaceTab === 'tasks' ? (
                  <div className="space-y-4">
                    <TaskForm
                      onSubmit={handleTaskFormSubmit}
                      taskToEdit={taskToEdit}
                      onCancelEdit={() => setTaskToEdit(null)}
                    />
                    <TaskList
                      tasks={tasks}
                      onToggleComplete={handleToggleComplete}
                      onEditTask={(task) => setTaskToEdit(task)}
                      onDeleteTask={handleDeleteTask}
                    />
                  </div>
                ) : (
                  <PlannerDashboard
                    plan={plan}
                    onGeneratePlan={handleGeneratePlan}
                    isGenerating={isGenerating}
                    activeTaskCount={activeTasksCount}
                  />
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="border border-border bg-card rounded-xl p-6 space-y-6 max-w-xl">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Workspace Preferences
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure workspace parameters for the FocusFlow app.
                </p>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Personal Workspace"
                    className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Target Focus Hours (Daily)
                  </label>
                  <input
                    type="number"
                    defaultValue={6}
                    className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Export Data
                  </label>
                  <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                    Export your locally stored tasks in standard JSON format.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => {
                    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `focusflow_export_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                  }}>
                    Download Export
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button size="sm" onClick={() => alert('Settings saved successfully (Mock)!')}>
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
