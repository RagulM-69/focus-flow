import { useState, useEffect } from 'react';
import { Landing } from './pages/Landing';
import { Workspace } from './pages/Workspace';
import { useTasks } from './hooks/useTasks';

function App() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');
  
  // Initialize theme from localStorage or system setting
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('focusflow_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Inject custom task controller hooks
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks();

  // Apply theme settings to HTML root
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('focusflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      {view === 'landing' ? (
        <Landing
          onOpenWorkspace={() => setView('workspace')}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : (
        <Workspace
          tasks={tasks}
          addTask={addTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          toggleComplete={toggleComplete}
          onGoBack={() => setView('landing')}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </>
  );
}

export default App;
