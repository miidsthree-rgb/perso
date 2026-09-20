import React from 'react';
import { BarChart3, Clock, CheckCircle, Flame, Download, Trophy } from 'lucide-react';
import Gamification from './Gamification';

export default function StatsDashboard({ tasks, sessions }) {
  const totalFocusSessions = sessions.filter((s) => s.type === 'focus');
  const totalFocusMinutes = totalFocusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Titre,Catégorie,Priorité,Statut,MinutesEstimées,MinutesPassées,DateLimite\n';

    tasks.forEach((t) => {
      const row = `"${t.id}","${t.title}","${t.category}","${t.priority}","${t.status}",${t.estimatedMinutes},${t.spentMinutes},"${t.dueDate}"`;
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `focuspulse-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">Tableau de Bord & Niveaux</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Suivez vos performances, gagnez des XP et débloquez des récompenses.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exporter Rapport CSV</span>
        </button>
      </div>

      {/* Gamification Widget */}
      <Gamification tasks={tasks} sessions={sessions} />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Heures de concentration</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalFocusHours} h</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cycles Pomodoro</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalFocusSessions.length}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tâches accomplies</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{completedTasks.length} / {tasks.length}</div>
        </div>
      </div>
    </div>
  );
}
