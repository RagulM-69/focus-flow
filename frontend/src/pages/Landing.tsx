import React from 'react';
import { ArrowRight, CheckCircle2, CalendarRange, BarChart3, Sun, Moon } from 'lucide-react';
import { Button } from '../components/shared/Button';

interface LandingProps {
  onOpenWorkspace: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onOpenWorkspace, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Navigation */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight">FocusFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button variant="outline" size="sm" onClick={onOpenWorkspace}>
              Launch Workspace
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center flex flex-col items-center">

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6 max-w-2xl text-foreground">
            Plan your work. <br />
            Reclaim your focus.
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
            An intelligent productivity planner designed to organize, prioritize, and calendar your daily output. Experience visual clarity without the noise of typical modern planning tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
            <Button size="lg" className="w-full sm:w-auto" onClick={onOpenWorkspace}>
              Open Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={onOpenWorkspace}>
              Explore Demo
            </Button>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-24 md:pb-32">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border border-border rounded-xl p-8 bg-card flex flex-col hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors duration-250">
              <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-border mb-6">
                <CheckCircle2 className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Smart Prioritization</h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                Enter tasks and see them rank automatically based on priority level, estimated effort, and upcoming deadlines. Focus on what moves the needle.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-border rounded-xl p-8 bg-card flex flex-col hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors duration-250">
              <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-border mb-6">
                <CalendarRange className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Daily Planning</h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                Convert your task backlog into a solid, visual block-time timeline. Plan your entire day in consecutive, manageable focus intervals.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-border rounded-xl p-8 bg-card flex flex-col hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors duration-250">
              <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-border mb-6">
                <BarChart3 className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Productivity Insights</h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                Review estimated focus hours, daily workloads, and tailored recommendation checklists generated to improve your daily cognitive efficiency.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} FocusFlow Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
