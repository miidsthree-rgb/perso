import React from 'react';
import { Minus, Square, X, Flame, User } from 'lucide-react';

export default function TitleBar({ activeTab, user, onOpenProfile }) {
  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    if (window.electronAPI) window.electronAPI.maximizeWindow();
  };

  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.closeWindow();
  };

  return (
    <header className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 select-none drag-region z-50">
      <div className="flex items-center space-x-2 no-drag">
        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Flame className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold tracking-wider text-slate-200">
          FOCUS<span className="text-indigo-400">PULSE</span>
        </span>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">v4.0</span>
      </div>

      <div className="text-xs font-medium text-slate-400 capitalize hidden sm:block">
        {activeTab === 'tasks' && '📋 Gestion des Tâches'}
        {activeTab === 'calendar' && '📅 Calendrier'}
        {activeTab === 'reminders' && '🔔 Rappels & Notifications'}
        {activeTab === 'pomodoro' && '⏱️ Chronomètre Pomodoro'}
        {activeTab === 'stats' && '📊 Tableau de Bord & Statistiques'}
        {activeTab === 'settings' && '⚙️ Paramètres'}
      </div>

      <div className="flex items-center space-x-2 no-drag">
        {/* User Profile Badge Button */}
        {user && (
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 px-2 py-1 rounded-lg border border-slate-700 text-xs transition-colors"
            title="Mon Profil"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-bold text-white">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="max-w-[70px] sm:max-w-[90px] truncate font-medium text-[11px] hidden xs:inline">{user.name}</span>
          </button>
        )}

        {window.electronAPI && (
          <div className="flex items-center space-x-1">
            <button
              onClick={handleMinimize}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Réduire"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Agrandir"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
