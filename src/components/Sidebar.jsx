import React from 'react';
import { CheckSquare, Calendar, Bell, Timer, BarChart3, Settings, Zap } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, activeTask, activeSessionType, isTimerRunning }) {
  const navItems = [
    { id: 'tasks', label: 'Tâches', icon: CheckSquare },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'reminders', label: 'Rappels', icon: Bell },
    { id: 'pomodoro', label: 'Minuteur', icon: Timer },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'settings', label: 'Réglages', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-56 bg-slate-900/80 border-r border-slate-800/80 flex-col justify-between p-3 select-none backdrop-blur flex-shrink-0">
      <div className="space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'pomodoro' && isTimerRunning && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-indigo-400" /> Session Active
          </span>
          {isTimerRunning ? (
            <span className="text-[10px] bg-rose-500/20 text-rose-400 font-semibold px-1.5 py-0.5 rounded border border-rose-500/30 animate-pulse">
              EN COURS
            </span>
          ) : (
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              EN PAUSE
            </span>
          )}
        </div>

        {activeTask ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{activeTask.title}</p>
            <p className="text-[11px] text-slate-400 flex justify-between">
              <span>{activeTask.category}</span>
              <span className="text-indigo-400">{activeTask.spentMinutes}m / {activeTask.estimatedMinutes}m</span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Aucune tâche sélectionnée</p>
        )}
      </div>
    </aside>
  );
}
