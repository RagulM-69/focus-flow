import React, { useState, useEffect } from 'react';
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

  // Settings States
  const [workspaceName, setWorkspaceName] = useState(() => localStorage.getItem('focusflow-workspace-name') || 'Personal Workspace');
  const [tempWorkspaceName, setTempWorkspaceName] = useState(workspaceName);
  
  const [targetFocusHours, setTargetFocusHours] = useState(() => parseInt(localStorage.getItem('focusflow-target-hours') || '6', 10));
  const [tempTargetHours, setTempTargetHours] = useState(targetFocusHours);

  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('focusflow-accent') || 'charcoal');
  const [soundNotifications, setSoundNotifications] = useState(() => localStorage.getItem('focusflow-sound') !== 'false');
  const [weekStart, setWeekStart] = useState(() => localStorage.getItem('focusflow-weekstart') || 'monday');

  const applyAccentColor = (color: string) => {
    const root = document.documentElement;
    localStorage.setItem('focusflow-accent', color);
    setAccentColor(color);
    
    switch (color) {
      case 'indigo':
        root.style.setProperty('--primary', '226 70% 55%');
        root.style.setProperty('--ring', '226 70% 55%');
        break;
      case 'emerald':
        root.style.setProperty('--primary', '142 70% 45%');
        root.style.setProperty('--ring', '142 70% 45%');
        break;
      case 'violet':
        root.style.setProperty('--primary', '262 70% 50%');
        root.style.setProperty('--ring', '262 70% 50%');
        break;
      case 'rose':
        root.style.setProperty('--primary', '346 75% 50%');
        root.style.setProperty('--ring', '346 75% 50%');
        break;
      case 'amber':
        root.style.setProperty('--primary', '38 90% 50%');
        root.style.setProperty('--ring', '38 90% 50%');
        break;
      case 'charcoal':
      default:
        root.style.removeProperty('--primary');
        root.style.removeProperty('--ring');
        break;
    }
  };

  useEffect(() => {
    const savedAccent = localStorage.getItem('focusflow-accent') || 'charcoal';
    applyAccentColor(savedAccent);
  }, []);

  const getInitials = (name: string) => {
    const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'GW';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleSaveSettings = () => {
    localStorage.setItem('focusflow-workspace-name', tempWorkspaceName);
    localStorage.setItem('focusflow-target-hours', String(tempTargetHours));
    setWorkspaceName(tempWorkspaceName);
    setTargetFocusHours(tempTargetHours);
    alert('Settings saved successfully!');
  };

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
    <div className="h-screen bg-background text-foreground flex overflow-hidden transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-200 md:translate-x-0 md:static h-full shrink-0 ${
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
              {getInitials(workspaceName)}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-foreground truncate font-medium">{workspaceName}</span>
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
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
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
            <div className="border border-border bg-card rounded-xl p-6 space-y-6 max-w-xl shadow-sm">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" /> Workspace Settings
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure UI themes, preferences, and profile defaults.
                </p>
              </div>

              <div className="space-y-5 border-t border-border pt-5">
                {/* 1. Workspace Identity */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground/90">
                    Workspace Identity
                  </h4>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={tempWorkspaceName}
                      onChange={(e) => setTempWorkspaceName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="e.g. Personal Workspace"
                    />
                  </div>
                </div>

                {/* 2. Custom Color Picker Accent */}
                <div className="space-y-3 border-t border-border pt-4">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground/90">
                    UI Accent Color
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Select a custom accent color to personalize your FocusFlow interface.
                  </p>
                  
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {[
                      { id: 'charcoal', label: 'Charcoal', class: 'bg-neutral-800 dark:bg-neutral-100 border-neutral-300 dark:border-neutral-700' },
                      { id: 'indigo', label: 'Indigo', class: 'bg-blue-600 border-blue-400' },
                      { id: 'emerald', label: 'Emerald', class: 'bg-emerald-600 border-emerald-400' },
                      { id: 'violet', label: 'Violet', class: 'bg-violet-600 border-violet-400' },
                      { id: 'rose', label: 'Rose', class: 'bg-rose-600 border-rose-400' },
                      { id: 'amber', label: 'Amber', class: 'bg-amber-500 border-amber-300' }
                    ].map((swatch) => (
                      <button
                        key={swatch.id}
                        type="button"
                        onClick={() => applyAccentColor(swatch.id)}
                        className={`h-7 px-3 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 transition-all ${
                          accentColor === swatch.id
                            ? 'ring-2 ring-offset-2 ring-ring scale-105'
                            : 'opacity-85 hover:opacity-100'
                        }`}
                        title={`Select ${swatch.label}`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${swatch.class} inline-block`} />
                        <span className="text-foreground">{swatch.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Scheduler Preferences */}
                <div className="space-y-4 border-t border-border pt-4">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground/90">
                    Scheduler Preferences
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Daily Focus Target (Hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={tempTargetHours}
                        onChange={(e) => setTempTargetHours(parseInt(e.target.value, 10) || 6)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Week Starts On
                      </label>
                      <select
                        value={weekStart}
                        onChange={(e) => {
                          setWeekStart(e.target.value);
                          localStorage.setItem('focusflow-weekstart', e.target.value);
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="monday">Monday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="soundToggle"
                      checked={soundNotifications}
                      onChange={(e) => {
                        setSoundNotifications(e.target.checked);
                        localStorage.setItem('focusflow-sound', String(e.target.checked));
                      }}
                      className="rounded border-border bg-background focus:ring-1 focus:ring-ring"
                    />
                    <label htmlFor="soundToggle" className="text-xs font-medium text-muted-foreground select-none cursor-pointer">
                      Enable interactive sound effects on task completion
                    </label>
                  </div>
                </div>

                {/* 4. Data Management */}
                <div className="space-y-3 border-t border-border pt-4">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground/90">
                    Data Portability
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Export your tasks backlog in raw JSON format to back up your planning database.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `focusflow_backlog_${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                    }}
                  >
                    Download Tasks JSON
                  </Button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveSettings}
                >
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
