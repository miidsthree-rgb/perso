import React from 'react';
import { CheckSquare, Calendar, Bell, Timer, BarChart3, Settings } from 'lucide-react';

export default function MobileNav({ activeTab, setActiveTab, isTimerRunning }) {
  const navItems = [
    { id: 'tasks', label: 'Tâches', icon: CheckSquare },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'reminders', label: 'Rappels', icon: Bell },
    { id: 'pomodoro', label: 'Minuteur', icon: Timer },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Réglages', icon: Settings },
  ];

  return (
    <nav className="md:hidden flex-shrink-0 bg-slate-900/95 border-t border-slate-800/80 backdrop-blur-lg flex items-center justify-around py-2 px-1 z-40 select-none safe-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400 stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'}`} />
              {item.id === 'pomodoro' && isTimerRunning && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span className={`text-[10px] mt-1 ${isActive ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
